import { QueryTypes } from './interfaces'

export const JSON_PROPS = <const>[
  'name',
  'required',
  'enums',
  'args',
  'operators',
  'conflits',
  'type',
]

export const OPERATORS = <const>{
  ls: 'less',
  le: 'lessOrEqual',
  gt: 'greater',
  ge: 'greaterOrEqual',
  eq: 'equal',
  df: 'diff',
  in: 'in',
  ni: 'notIn',
}

export const DEFAULT_MESSAGE = 'rule not satisfied'

export const DEFAULT_SCHEMA: QueryTypes.Schema = {
  name: 'Prop',
  required: false,
  operators: ['eq'],
  type: String,
  enums: [],
  args: [],
  conflits: [],
}

export enum Key {
  Constraint = 'rule',
  Schema = 'rule::storage:schema',
  Metadata = 'rule::storage:metadata',
  ValidationMetadata = 'validationMetadatas',
  ConstraintMetadata = 'constraintMetadatas',
  PropertyMetadata = 'rule::storage:property:metadata',
}
