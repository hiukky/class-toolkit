import { ClassConstructor, plainToClass } from 'class-transformer'
import { getMetadataStorage, IsOptional } from 'class-validator'
import { ConstraintMetadata } from 'class-validator/types/metadata/ConstraintMetadata'
import { ValidationMetadata } from 'class-validator/types/metadata/ValidationMetadata'
import { Key } from './constants'
import { PropMetadataDTO } from './dtos'
import { QueryTypes } from './interfaces'

export type StorageUpdate = {
  decorators: PropertyDecorator[]
  property: string
  target: Object
  properties: string[]
}

export type PartialMetadata = [ValidationMetadata, ConstraintMetadata]

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

    metadata['value'] = valueOf(schema.type as any, metadata.value)
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

export const valueOf = <T extends ClassConstructor<any>, V = string>(
  type: T,
  value: V,
) => {
  let defaultInput = value

  if (typeof value === 'string') {
    try {
      defaultInput = JSON.parse(value as any)
    } catch {}
  }

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

export const updateStorageFor = ({
  decorators,
  property,
  target,
  properties,
}: StorageUpdate): void => {
  const storage = getMetadataStorage()

  const getGroupedMetadata = (): [string, ValidationMetadata[]][] =>
    Object.entries(
      storage.groupByPropertyName(
        storage.getTargetValidationMetadatas(
          target.constructor,
          typeof target,
          true,
          true,
        ),
      ),
    )

  const _metadatas: ValidationMetadata[] = []
  const _constraints: ConstraintMetadata[] = []

  getGroupedMetadata().forEach(([key, schema]) => {
    const data = schema
      .map(
        meta =>
          [
            meta,
            storage.getTargetValidatorConstraints(meta.constraintCls)[0],
          ] as PartialMetadata,
      )
      .filter(([, constraint]) => constraint?.name !== Key.Constraint)

    if (key === property) {
      data?.forEach(([meta, constraint]) => {
        _metadatas.push(meta)
        _constraints.push(constraint)
      })
    } else if (!properties.includes(key) && data.length > 1) {
      Reflect.decorate([IsOptional()], target, key)
    }
  })

  storage[Key.ValidationMetadata] = storage[Key.ValidationMetadata].filter(
    (meta: ValidationMetadata) => !_metadatas.includes(meta),
  )

  storage[Key.ConstraintMetadata] = storage[Key.ConstraintMetadata].filter(
    (meta: ConstraintMetadata) => !_constraints.includes(meta),
  )

  Reflect.decorate(decorators, target, property)
}
