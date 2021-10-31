import { ValidationOptions } from 'class-validator'
import { RuleMetadataDTO } from './dto'
import { OPERATORS } from './constants'

export namespace RuleTypes {
  export type Operators = keyof typeof OPERATORS

  export type Payload = Record<RuleTypes.Operators, any>

  export interface Class extends Function {
    new (...args: any[]): {}
  }

  export type Entries = [string, RuleTypes.Schema]

  // export type ValidatorSchema = [boolean | number, string?][];

  export type ValidatorSchema = PropertyDecorator[]

  export type BuiderOperator = Record<
    Operators,
    (...validations: ValidatorSchema) => void
  >

  export type Context<V, A> = {
    value: V
    operator: Operators
    args?: A
    target: Object
    schema: Required<Pick<Schema, 'enums' | 'args'>>
  }

  export type Decorate = {
    when: Operators[]
    with: PropertyDecorator[]
  }

  export type Schema = {
    type: Function
    name?: string
    required?: boolean
    operators: Operators[]
    enums?: Readonly<(string | number)[]>
    args?: Readonly<(string | number)[]>
    conflits?:
      | string[]
      | {
          ref: Class
          rules: string[]
        }[]
    options?: ValidationOptions
    decorate?: (partialSchema: Context<any, any>['schema']) => Decorate[]
    validate?: <V extends unknown, A extends unknown>(
      context: Context<V, A>,
    ) => boolean | string
  }

  export type SchemaOptions = Omit<Schema, 'operators'>

  export type MetadataSchema = Schema & {
    meta: RuleMetadataDTO
  }

  export type JSONSchema = Pick<
    Schema,
    'name' | 'required' | 'enums' | 'args' | 'operators' | 'conflits'
  >
}
