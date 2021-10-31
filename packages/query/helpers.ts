import 'reflect-metadata'
import { plainToClass, Type } from 'class-transformer'
import { Key } from './constants'
import { RuleMetadataDTO } from './dto'
import { RuleTypes } from './interfaces'

export const parseToMetadata = (
  schema: Partial<RuleTypes.MetadataSchema>,
): RuleMetadataDTO => {
  const metadata = {} as RuleMetadataDTO

  if (schema.meta instanceof Object) {
    const payload = Object.entries(schema.meta).filter(Boolean)

    const [operator, value] = payload[0]

    metadata['operator'] = operator as RuleTypes.Operators
    metadata['value'] = value
    metadata['source'] = JSON.stringify(schema.meta)
  } else if (schema.operators?.length === 1) {
    metadata['operator'] = schema.operators[0]
    metadata['value'] = schema.meta
    metadata['source'] = JSON.stringify({ [metadata.operator]: schema.meta })
  }

  return metadata
}

export const setPropertyMetadataFor = (
  schema: Partial<RuleTypes.MetadataSchema>,
  property: string,
  target: Object,
): void => {
  Reflect.defineProperty(target, `__${property}`, {
    value: schema,
    enumerable: false,
    configurable: false,
  })
}

export const getPropertyMetadataFor = (
  property: string,
  target: Object,
): RuleTypes.MetadataSchema => {
  return Reflect.get(target, `__${property}`) || {}
}

export const setPropertySchemaFor = (
  property: string,
  schema: RuleTypes.Schema,
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

export const getParsedValueFor = <T extends Function, V = string>(
  type: T,
  value: V,
) => {
  class Value {
    @Type(() => type)
    input: V
  }

  let defaultInput = value

  try {
    defaultInput = JSON.parse(value as any)
  } catch {}

  const { input } = plainToClass(Value, { input: defaultInput })

  return input
}

export const extractConflitsFor = (
  conflits: RuleTypes.Schema['conflits'],
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
