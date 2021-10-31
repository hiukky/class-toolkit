import { RuleTypes } from './interfaces'

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
  Rule = 'rule',
  Schema = 'rules::storage:schema',
  Metadata = 'rules::storage:metadata',
  Context = 'rules::storage:schema.context',
}

export const DEFAULT_MESSAGE = 'rule not satisfied'

export const DEFAULT_SCHEMA: RuleTypes.Schema = {
  name: 'Rule',
  required: true,
  operators: ['eq'],
  type: String,
  enums: [],
  args: [],
  conflits: [],
}
