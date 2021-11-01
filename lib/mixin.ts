import 'reflect-metadata'
import { QueryTypes } from './interfaces'
import { JSON_PROPS, Key } from './constants'
import { PropMetadataDTO } from './dto'
import { resolveConflitsFor } from './helpers'
import { Prop } from './decorator'

type Of<T> = T & PropConstructor<Contract>
type PropsOf<T> = keyof Omit<T, keyof Contract>
type KeyOf<T> = PropsOf<T> extends never ? string : PropsOf<T>
type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (
  x: infer R,
) => any
  ? R
  : never

interface PropConstructor<T extends {}> {
  new (...args: any[]): T
}

export interface Contract {
  get(property: KeyOf<this>): PropMetadataDTO
  toSource<K extends Record<KeyOf<this>, any>>(): K
  toJSON(): Record<KeyOf<this>, QueryTypes.JSONSchema>
  toSchema(): Record<KeyOf<this>, QueryTypes.Schema>
}

function Factory() {
  return class Model implements Contract {
    private get __properties(): string[] {
      return Object.keys(Object.getOwnPropertyDescriptors(this)).filter(key =>
        key.startsWith('__'),
      )
    }

    get<K extends KeyOf<this>>(property: K): PropMetadataDTO {
      return Reflect.get(this, `__${property}`)
    }

    toSchema<K extends KeyOf<this>>(): Record<K, QueryTypes.Schema> {
      return Reflect.getMetadata(Key.Schema, this.constructor) || {}
    }

    toSource<K extends Record<KeyOf<this>, any>>(): K {
      return Object.fromEntries(
        this.__properties.map(key => [
          key.slice(2),
          Reflect.get(this, key)['source'],
        ]),
      ) as K
    }

    toJSON(): Record<KeyOf<this>, QueryTypes.JSONSchema> {
      return Object.fromEntries(
        Object.entries(this.toSchema<any>()).map(
          ([key, data]: QueryTypes.Entries) => {
            return [
              key,
              Object.fromEntries(
                Object.entries(data)
                  .filter(([option]) =>
                    JSON_PROPS.includes(option as keyof QueryTypes.JSONSchema),
                  )
                  .map(([key, value]) => {
                    switch (key) {
                      case 'type':
                        return [key, (value as Function).name]

                      case 'conflits':
                        return [key, resolveConflitsFor(value as [])]

                      default:
                        return [key, value]
                    }
                  }),
              ),
            ]
          },
        ),
      ) as Record<KeyOf<this>, QueryTypes.JSONSchema>
    }
  }
}

export function Model<T extends PropConstructor<{}>[]>(
  ...targets: T
): Of<UnionToIntersection<typeof targets[number]>> {
  let Model: any = Factory()

  if (targets?.length) {
    Model = class extends Factory() {
      constructor() {
        super()

        const metadata: Record<string, QueryTypes.Schema> = targets
          .map(baseConstructor =>
            Reflect.getMetadata(Key.Schema, baseConstructor),
          )
          .reduce((a, b) => Object.assign(a, b))

        if (metadata) {
          Object.entries(metadata).forEach(([property, schema]) => {
            Prop({ ...schema, conflits: resolveConflitsFor(schema.conflits) })(
              this,
              property,
            )
          })
        }
      }
    }
  }

  return Model as Of<UnionToIntersection<typeof targets[number]>>
}
