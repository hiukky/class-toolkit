import 'reflect-metadata'
import { RuleTypes } from './interfaces'
import { Key, OPERATORS } from './constants'
import { RuleMetadataDTO } from './dto'
import { extractConflitsFor } from './helpers'

type Of<T> = T & RuleConstructor<Contract>
type PropsOf<T> = keyof Omit<T, keyof Contract>
type KeyOf<T> = PropsOf<T> extends never ? string : PropsOf<T>

interface RuleConstructor<T extends {}> {
  new (...args: any[]): T
}

export interface Contract {
  get(property: KeyOf<this>): RuleMetadataDTO
  toSource<K extends Record<KeyOf<this>, any>>(): K
  toJSON(): Record<KeyOf<this>, RuleTypes.JSONSchema>
  toSchema(): Record<KeyOf<this>, RuleTypes.Schema>
}

abstract class ValueDTO {}

const SCHEMAS: Record<string, RuleTypes.Schema> = {}

export function Model<T extends RuleConstructor<{}>>(
  target: T = class {} as T,
): Of<T> {
  return class Model extends target implements Contract {
    constructor(...args: any[]) {
      super()
      this.register()
    }

    private get __properties(): string[] {
      return Object.keys(Object.getOwnPropertyDescriptors(this)).filter(key =>
        key.startsWith('__'),
      )
    }

    private register(): void {
      const name = this.constructor.name

      SCHEMAS[name] = Reflect.getMetadata(Key.Schema, this.constructor) || {}
    }

    get<K extends KeyOf<this>>(property: K): RuleMetadataDTO {
      return Reflect.get(this, `__${property}`)?.['meta']
    }

    toSchema<K extends KeyOf<this>>(): Record<K, RuleTypes.Schema> {
      return Object.values(SCHEMAS).reduce(
        (a, b) => ({ ...a, ...b }),
        {},
      ) as Record<KeyOf<this>, any>
    }

    toJSON(): Record<KeyOf<this>, RuleTypes.JSONSchema> {
      return Object.fromEntries(
        Object.entries(this.toSchema<any>()).map(
          ([key, data]: RuleTypes.Entries) => {
            return [
              key,
              Object.fromEntries(
                Object.entries(data)
                  .filter(([option]) => !['is', 'options'].includes(option))
                  .map(([key, value]) => {
                    switch (key) {
                      case 'type':
                        return [key, (value as Function).name]

                      case 'conflits':
                        return [key, extractConflitsFor(value as [])]

                      default:
                        return [key, value]
                    }
                  }),
              ),
            ]
          },
        ),
      ) as Record<KeyOf<this>, RuleTypes.JSONSchema>
    }

    toSource<K extends Record<KeyOf<this>, any>>(): K {
      return Object.fromEntries(
        this.__properties.map(key => [
          key.slice(2),
          Reflect.get(this, key)['meta']['source'],
        ]),
      ) as K
    }
  }
}

export function Value(): typeof ValueDTO {
  Object.keys(OPERATORS).forEach(op => {
    Reflect.defineProperty(ValueDTO, op, {
      value: undefined,
    })
  })

  return ValueDTO
}
