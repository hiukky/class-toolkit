import { Transform, Type } from 'class-transformer'
import {
  getMetadataStorage,
  IsNotEmpty,
  registerDecorator,
  ValidationArguments,
} from 'class-validator'
import { DEFAULT_MESSAGE, DEFAULT_SCHEMA, Key } from './constants'
import { QueryTypes } from './interfaces'
import {
  getPropertyMetadataFor,
  setPropertyMetadataFor,
  parseToMetadata,
  getParsedValueFor,
  setPropertySchemaFor,
} from './helpers'
import { ValidationMetadata } from 'class-validator/types/metadata/ValidationMetadata'

let REFERENCES: Record<string, InstanceType<any>> = {}

const VALIDATION_METADATA: ValidationMetadata[] =
  getMetadataStorage()[Key.StorageMetadata]

export function Prop(options: QueryTypes.SchemaOptions) {
  const schema = { ...DEFAULT_SCHEMA, ...options }

  let extraDecorators: QueryTypes.Decorate[] = []
  let operators: QueryTypes.Operators[] = schema.operators

  if (schema?.decorate) {
    const { enums, args } = schema

    extraDecorators = schema.decorate({
      enums: enums as [],
      args: args as [],
    })

    operators = extraDecorators
      .map(({ when }) => when)
      .reduce((a, b) => [...a, ...b], [])
  }

  return function (target: Object, propertyName: string) {
    let CONSTRAINTS: string[] = []

    const push = (message: string): void => {
      CONSTRAINTS.push(message)
    }

    setPropertySchemaFor(
      propertyName,
      {
        ...schema,
        operators: Array.from(new Set(operators)),
      },
      target.constructor,
    )

    Type(data => {
      const meta = parseToMetadata({
        ...schema,
        meta: data?.object[propertyName],
      })

      if (schema.decorate) {
        VALIDATION_METADATA.filter(
          storage => storage.propertyName === propertyName,
        ).forEach(storage => {
          storage.constraintCls = () => {}
        })

        extraDecorators
          ?.filter(({ when }) => when.includes(meta.operator))
          ?.forEach(options => {
            Reflect.decorate(options.with, target, propertyName)
          })
      }

      setPropertyMetadataFor({ ...schema, meta }, propertyName, data?.newObject)

      const value = getParsedValueFor(schema.type, meta?.value)

      Reflect.defineProperty(data!.object, propertyName, {
        value,
        enumerable: true,
        configurable: true,
      })

      REFERENCES[target.constructor.name] = data?.newObject

      return schema.type
    })(target, propertyName)

    Transform(
      data => {
        return data.obj[propertyName]
      },
      {
        toClassOnly: true,
      },
    )(target, propertyName)

    if (schema.required) {
      IsNotEmpty()(target, propertyName)
    }

    const { message, ...validatorOptions } = schema?.options || {}

    registerDecorator({
      name: Key.Prop,
      target: target.constructor,
      propertyName: propertyName,
      options: validatorOptions,
      constraints: [propertyName],
      validator: {
        validate: <V>(payload: V, args: ValidationArguments) => {
          try {
            if (Object.keys(args.object).includes(args.property)) {
              const schemaUpdated = getPropertyMetadataFor(
                propertyName,
                args?.object,
              )

              const { meta, operators } = schemaUpdated

              const keys = Object.keys(JSON.parse(meta.source))

              if (keys.length > 1) {
                push('only one operation is allowed per field')
              } else if (!operators?.some(op => keys.includes(op))) {
                push(`wait for one of the operators: ${operators}`)
              } else if (schema.validate) {
                const commonValidation = schema.validate({
                  value: payload,
                  operator: meta.operator,
                  args: meta?.args,
                  target: args.object,
                  schema: {
                    enums: schema.enums as [],
                    args: schema.args as [],
                  },
                })

                if (typeof commonValidation === 'string') {
                  push(commonValidation)
                } else {
                  return false
                }
              } else if (schema?.conflits?.length) {
                schema.conflits.forEach(conflit => {
                  if (typeof conflit === 'string') {
                    if (args.object[conflit as keyof typeof args.object]) {
                      push(
                        `property "${propertyName}" conflicts with property "${conflit}"`,
                      )
                    }
                  }

                  if (conflit instanceof Object) {
                    const conflitRefKeys = Object.keys(
                      REFERENCES[conflit.ref.name],
                    )

                    conflit.rules.forEach(propertyConflit => {
                      if (conflitRefKeys.includes(propertyConflit)) {
                        push(
                          `property "${propertyName}" conflicts with property "${propertyConflit}"`,
                        )
                      }
                    })
                  }
                })
              }
            }

            return !CONSTRAINTS.length
          } catch {
            return true
          }
        },
        defaultMessage: () => {
          const defaultMessage = CONSTRAINTS.length
            ? `${propertyName}: ${CONSTRAINTS.at(-1)?.trim()}`
            : message instanceof Array
            ? message[0]
            : message || DEFAULT_MESSAGE

          CONSTRAINTS = []

          return defaultMessage
        },
      },
    })
  }
}
