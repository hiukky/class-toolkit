import { Model, Prop } from '../index'

import { plainToClass } from 'class-transformer'

class A extends Model() {
  @Prop({
    type: Number,
  })
  key: number

  @Prop({
    type: Number,
  })
  foo: string
}

class B extends A {
  @Prop({
    type: Number,
    required: true,
  })
  bar: number
}

class C extends B {
  @Prop({
    name: 'New bar field schema',
    type: Number,
    required: false,
    enums: ['foo', 'bar'],
  })
  bar: number
}

const COMMON_SCHEMA = {
  key: {
    name: 'Prop',
    required: false,
    operators: ['eq'],
    type: 'Number',
    enums: [],
    args: [],
    conflits: [],
  },
  foo: {
    name: 'Prop',
    required: false,
    operators: ['eq'],
    type: 'Number',
    enums: [],
    args: [],
    conflits: [],
  },
}

describe('To JSON', () => {
  it('must return a valid json schema from a new instance', () => {
    expect(new A().toJSON()).toEqual(COMMON_SCHEMA)
    expect(new B().toJSON()).toEqual({
      ...COMMON_SCHEMA,
      bar: {
        name: 'Prop',
        required: true,
        operators: ['eq'],
        type: 'Number',
        enums: [],
        args: [],
        conflits: [],
      },
    })
  })

  it('must return a valid json schema using plainToClass', () => {
    expect(plainToClass(A, {}).toJSON()).toEqual(COMMON_SCHEMA)
    expect(plainToClass(B, {}).toJSON()).toEqual({
      ...COMMON_SCHEMA,
      bar: {
        name: 'Prop',
        required: true,
        operators: ['eq'],
        type: 'Number',
        enums: [],
        args: [],
        conflits: [],
      },
    })
  })

  it('should return a json schema with updated metadata', () => {
    expect(new C().toJSON()).toEqual({
      ...COMMON_SCHEMA,
      bar: {
        name: 'New bar field schema',
        required: false,
        operators: ['eq'],
        type: 'Number',
        enums: ['foo', 'bar'],
        args: [],
        conflits: [],
      },
    })
  })

  it('must delete a property from a json schema', () => {
    class DTO extends Model() {
      @Prop({
        type: String,
        toJSON: {
          exclude: true,
        },
      })
      field_a: string

      @Prop({
        type: String,
      })
      field_b: string
    }

    const dto = plainToClass(DTO, { field_a: 'Foo', field_b: 'Bar' })

    expect(dto.toJSON()).toEqual({
      field_b: {
        args: [],
        conflits: [],
        enums: [],
        name: 'Prop',
        operators: ['eq'],
        required: false,
        type: 'String',
      },
    })
  })
})
