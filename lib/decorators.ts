import { Transform, Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  registerDecorator,
  ValidationArguments,
} from 'class-validator'
import { DEFAULT_MESSAGE, DEFAULT_SCHEMA, Key, OPERATORS } from './constants'
import { QueryTypes } from './interfaces'
import {
  getPropertyMetadataFor,
  setPropertyMetadataFor,
  parseToMetadata,
  setPropertySchemaFor,
  updateStorageFor,
} from './helpers'

let REFERENCES: Record<string, InstanceType<any>> = {}

export function Validator(schema: QueryTypes.Schema): PropertyDecorator {
  return function (target: Object, propertyName: string) {
    let CONSTRAINTS: string[] = []

    const push = (message: string): void => {
      CONSTRAINTS.push(message)
    }

    const { message, ...validatorOptions } = schema.options || {}

    registerDecorator({
      name: Key.Constraint,
      target: target.constructor,
      propertyName: propertyName,
      options: validatorOptions,
      constraints: [propertyName],
      validator: {
        validate: <V>(payload: V, args: ValidationArguments) => {
          try {
            const { meta, operators } = getPropertyMetadataFor(
              propertyName,
              args.object,
            )

            const contextOperators = Object.keys(
              JSON.parse(meta.source),
            ).filter(key => !!{ ...OPERATORS }[key])

            if (!contextOperators.length) {
              push(`wait for one of the operators: ${operators}`)
            } else if (contextOperators.length > 1) {
              push('only one operation is allowed per field')
            } else if (schema.validate) {
              const commonValidation = schema.validate({
                value: payload,
                operator: meta.operator,
                args: meta.args,
                target: args.object,
                schema: {
                  enums: schema.enums as [],
                  args: schema.args as [],
                },
              })

              if (typeof commonValidation === 'string') {
                push(commonValidation)
              } else if (typeof commonValidation === 'boolean') {
                return commonValidation
              }
            } else if (schema.conflits?.length) {
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
  } as PropertyDecorator
}

export function Prop(options: QueryTypes.SchemaOptions): PropertyDecorator {
  const schema = { ...DEFAULT_SCHEMA, ...options }

  let extraDecorators: QueryTypes.Decorate[] = []

  if (schema.decorate) {
    const { enums, args } = schema

    if (schema.decorate instanceof Function) {
      extraDecorators = schema.decorate({
        enums: enums as [],
        args: args as [],
      })
    } else if (schema.decorate instanceof Array) {
      extraDecorators = [...schema.decorate]
    }
  }

  if (extraDecorators.length) {
    schema.operators = Array.from(
      new Set(
        extraDecorators
          .map(({ when }) => when)
          .reduce((a, b) => [...a, ...b], []),
      ),
    )
  }

  return function (target: Object, propertyName: string) {
    setPropertySchemaFor(propertyName, schema, target.constructor)

    Validator(schema)(target, propertyName)

    Type(data => {
      const decorators: PropertyDecorator[] = []

      const meta = parseToMetadata({
        ...schema,
        meta: data?.object[propertyName],
      })

      Reflect.defineProperty(data!.object, propertyName, {
        value: meta.value,
        enumerable: true,
        configurable: true,
      })

      if (schema.decorate) {
        extraDecorators
          ?.filter(({ when }) => when.includes(meta.operator))
          ?.forEach(options => {
            decorators.push(...options.with)
          })
      }

      if (schema.operators.includes(meta.operator)) {
        switch (meta.operator) {
          case 'in':
          case 'ni':
            decorators.push(IsArray())
            break
          case 'bt':
            decorators.push(ArrayMinSize(2), ArrayMaxSize(2))
          default:
            break
        }
      }

      updateStorageFor({
        target,
        decorators,
        property: propertyName,
        properties: Object.keys(data?.object || {}),
      })

      setPropertyMetadataFor({ ...schema, meta }, propertyName, data?.newObject)

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
  } as PropertyDecorator
}
