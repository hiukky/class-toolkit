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

export enum Key {
  Prop = 'rule',
  Schema = 'rules::storage:schema',
  Metadata = 'rules::storage:metadata',
  Context = 'rules::storage:schema.context',
}

export const DEFAULT_MESSAGE = 'rule not satisfied'

export const DEFAULT_SCHEMA: QueryTypes.Schema = {
  name: 'Prop',
  required: true,
  operators: ['eq'],
  type: String,
  enums: [],
  args: [],
  conflits: [],
}
