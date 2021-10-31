import { IntersectionType } from '@nestjs/mapped-types'
import { plainToClass, Type } from 'class-transformer'
import { IsIn, ValidateNested, validateSync } from 'class-validator'
import { Model } from '../lib/mixin'
import { QueryTypes } from '../lib/interfaces'
import { PropMetadataDTO } from '../lib/dto'
import { Prop } from '../lib/decorator'

const SCHEMA: QueryTypes.Schema = {
  name: 'Prop Test',
  required: true,
  operators: ['eq'],
  type: Number,
  enums: [],
  args: [],
  conflits: [],
  decorate: () => [
    {
      when: ['eq'],
      with: [IsIn([5])],
    },
  ],
}

const SCHEMA_JSON: QueryTypes.JSONSchema = {
  name: 'Prop Test',
  required: true,
  operators: ['eq'],
  enums: [],
  args: [],
  conflits: [],
  type: 'Number',
}

class SimpleDTO extends Model() {
  @Prop(SCHEMA)
  field: number
}

class ManyPropsDTO {
  @Type(() => SimpleDTO)
  @ValidateNested()
  rules: SimpleDTO[]
}

describe('Schema', () => {
  const payload = {
    field: { eq: 1 },
  }

  it('Base', () => {
    class DTO extends Model() {
      @Prop({
        type: Number,
      })
      field: number
    }

    const dto = plainToClass(DTO, payload)

    expect(dto).toBeInstanceOf(DTO)
    expect(dto.toSource()).toEqual({ field: '{"eq":1}' })
    expect(dto.toSchema()).toEqual({
      field: {
        name: 'Prop',
        required: true,
        operators: ['eq'],
        type: Number,
        enums: [],
        args: [],
        conflits: [],
      },
    })
    expect(dto.toJSON()).toEqual({
      field: {
        name: 'Prop',
        required: true,
        operators: ['eq'],
        type: 'Number',
        enums: [],
        args: [],
        conflits: [],
      },
    })
    expect(dto.get('field')).toEqual({
      operator: 'eq',
      value: 1,
      source: '{"eq":1}',
    })
  })

  it('should return error for conflict in same schema', () => {
    class DTO extends Model() {
      @Prop({
        type: Number,
        conflits: [],
      })
      a: number

      @Prop({
        type: Number,
        conflits: ['a'],
      })
      b: number
    }

    const dto = plainToClass(DTO, { a: { eq: 5 }, b: { eq: 2 } })

    const { property, constraints } = validateSync(dto)[0]

    expect(property).toEqual('b')
    expect(dto.toJSON().b.conflits).toEqual(['a'])
    expect(constraints?.['rule']).toEqual(
      'b: property "b" conflicts with property "a"',
    )
  })

  it('should return error for conflict in inheritance schema', () => {
    class A extends Model() {
      @Prop({
        type: Number,
        conflits: [],
      })
      a: number
    }

    class B extends Model() {
      @Prop({
        type: Number,
        conflits: [
          {
            ref: A,
            rules: ['a'],
          },
        ],
      })
      b: number
    }

    class ExampleDTO extends Model(IntersectionType<A, B>(A, B)) {}

    const dto = plainToClass(ExampleDTO, {
      a: { eq: 5 },
      b: { eq: 2 },
    })

    const { property, constraints } = validateSync(dto)[0]

    expect(property).toEqual('b')
    expect(constraints?.['rule']).toEqual(
      'b: property "b" conflicts with property "a"',
    )
  })

  it('must return an instance of PropMetadataDTO', () => {
    const dto = plainToClass(PropMetadataDTO, {
      operator: 'eq',
      value: 1,
      source: JSON.stringify({ eq: 1 }),
    })

    expect(dto).toBeInstanceOf(PropMetadataDTO)
  })
})

describe('Unique Schema', () => {
  const commonExpect = (dto: SimpleDTO): void => {
    expect(dto.toJSON()).toMatchObject({
      field: SCHEMA_JSON,
    })
    expect(dto.toSchema()).toMatchObject({
      field: SCHEMA,
    })
  }

  it('must define a default operator if it accepts only one and n is a valid model', () => {
    const dto = plainToClass(SimpleDTO, { field: 1 })

    expect(dto.field).toBe(1)
    expect(dto.get('field')).toMatchObject({
      operator: 'eq',
      value: 1,
      source: '{"eq":1}',
    })
    commonExpect(dto)
  })

  it('Must return a valid value for the model', () => {
    const dto = plainToClass(SimpleDTO, { field: { eq: 1 } })

    expect(dto.field).toBe(1)
    expect(dto.get('field')).toMatchObject({
      operator: 'eq',
      value: 1,
      source: '{"eq":1}',
    })
    commonExpect(dto)
  })
})

describe('Nested Schemas', () => {
  it("should assume a default template when there isn't one.", () => {
    const payload = [{ field: 1 }, { field: 50 }]

    const dto = plainToClass(ManyPropsDTO, {
      rules: payload,
    })

    expect(dto.rules).toEqual(expect.arrayContaining(payload))
    expect(dto.rules).toHaveLength(2)
  })

  it('Must return a valid value for the models', () => {
    const dto = plainToClass(ManyPropsDTO, {
      rules: [{ field: { eq: 1 } }, { field: { eq: 50 } }],
    })

    expect(dto.rules).toEqual(
      expect.arrayContaining([{ field: 1 }, { field: 50 }]),
    )
    expect(dto.rules).toHaveLength(2)
  })
})
