import 'reflect-metadata'
import { ClassConstructor, plainToClass, Type } from 'class-transformer'
import { Key } from './constants'
import { PropMetadataDTO } from './dtos'
import { QueryTypes } from './interfaces'

export const parseToMetadata = (
  schema: Partial<QueryTypes.MetadataSchema>,
): PropMetadataDTO => {
  const metadata = {} as PropMetadataDTO

  try {
    const meta =
      typeof schema.meta === 'string' ? JSON.parse(schema.meta) : schema.meta

    if (meta instanceof Object) {
      const payload = Object.entries(meta).filter(Boolean)

      const [operator, value] = payload[0]

      metadata['operator'] = operator as QueryTypes.Operators
      metadata['value'] = value
      metadata['source'] = JSON.stringify(meta)
    } else if (schema.operators?.length === 1) {
      metadata['operator'] = schema.operators[0]
      metadata['value'] = meta
      metadata['source'] = JSON.stringify({ [metadata.operator]: meta })
    }
  } catch {}

  return metadata
}

export const setPropertyMetadataFor = (
  schema: Partial<QueryTypes.MetadataSchema>,
  property: string,
  target: Object,
): void => {
  Reflect.defineProperty(target, `__${property}`, {
    value: schema.meta,
    enumerable: false,
    configurable: false,
  })
}

export const getPropertyMetadataFor = (
  property: string,
  target: Object,
): QueryTypes.MetadataSchema => {
  const meta = Reflect.get(target, `__${property}`) || {}
  const schema = Reflect.getMetadata(Key.Schema, target.constructor)

  return (
    Object.assign(schema[property], {
      meta,
    }) || {}
  )
}

export const setPropertySchemaFor = (
  property: string,
  schema: QueryTypes.Schema,
  target: Object,
) => {
  Reflect.defineMetadata(
    Key.Schema,
    {
      ...Reflect.getMetadata(Key.Schema, target),
      [property]: schema,
    },
    target,
  )
}

export const getParsedValueFor = <T extends ClassConstructor<any>, V = string>(
  type: T,
  value: V,
) => {
  let defaultInput = value

  try {
    defaultInput = JSON.parse(value as any)
  } catch {}

  return plainToClass(type, defaultInput)
}

export const resolveConflitsFor = (
  conflits: QueryTypes.Schema['conflits'],
): string[] => {
  let partialConflits: string[] = []

  conflits?.forEach(conflit => {
    if (typeof conflit === 'string') {
      partialConflits = [...partialConflits, conflit]
    } else if (conflit instanceof Object) {
      partialConflits = [...partialConflits, ...conflit.rules]
    }
  })

  return partialConflits
}
