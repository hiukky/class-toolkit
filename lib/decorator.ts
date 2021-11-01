import 'reflect-metadata'
import { Expose, Transform, Type } from 'class-transformer'
import {
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
import { Model } from './mixin'

let REFERENCES: Record<string, InstanceType<any>> = {}

export function Prop(options: QueryTypes.SchemaOptions) {
  const schema = { ...DEFAULT_SCHEMA, ...options }

  return function (target: Object, propertyName: string) {
    let CONSTRAINTS: string[] = []

    const push = (message: string): void => {
      CONSTRAINTS.push(message)
    }

    setPropertySchemaFor(propertyName, schema, target.constructor)

    Type(data => {
      class Base extends Model() {}

      const meta = parseToMetadata({
        ...schema,
        meta: data?.object[propertyName],
      })

      let operators = schema.operators

      if (schema.decorate) {
        Reflect.defineProperty(Base, 'name', {
          value: target.constructor.name,
        })

        const { enums, args } = schema

        const extraDecorators = schema.decorate({
          enums: enums as [],
          args: args as [],
        })

        extraDecorators
          ?.filter(({ when }) => when.includes(meta.operator))
          ?.forEach(options => {
            Reflect.decorate(options.with, Base.prototype, propertyName)
          })

        Object.setPrototypeOf(data?.newObject, Base.prototype)

        operators = extraDecorators
          .map(({ when }) => when)
          .reduce((a, b) => [...a, ...b], [])
      }

      setPropertyMetadataFor({ ...schema, meta }, propertyName, data?.newObject)

      setPropertySchemaFor(
        propertyName,
        { ...schema, operators: Array.from(new Set(operators)) },
        target.constructor,
      )

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

    registerDecorator({
      name: Key.Prop,
      target: target.constructor,
      propertyName: propertyName,
      options: schema.options,
      constraints: [propertyName],
      validator: {
        validate: <V>(payload: V, args: ValidationArguments) => {
          try {
            const { meta, operators } = getPropertyMetadataFor(
              propertyName,
              args?.object,
            )

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

            return Object.keys(CONSTRAINTS).every(error => !error)
          } catch {
            return true
          }
        },
        defaultMessage: () => {
          return `${propertyName}: ${
            CONSTRAINTS.at(-1)?.trim() || DEFAULT_MESSAGE
          }`
        },
      },
    })
  }
}
