import { plainToClass } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNumber,
  Max,
  Min,
  validateSync,
} from 'class-validator'
import { getErrorConstraints } from '../utils/test.util'
import { Prop, Model } from '../index'

describe('Decorate', () => {
  it('must define a schema in the array model', () => {
    class DTO extends Model() {
      @Prop({
        type: Number,
        decorate: [
          {
            when: ['eq'],
            with: [IsNumber({ allowNaN: false })],
          },
        ],
      })
      value: number
    }

    const dto = plainToClass(DTO, { value: 5 })

    expect(dto.value).toBe(5)
    expect(dto.toJSON().value.operators).toEqual(['eq'])
  })

  it('must define a schema in the function model with arguments', () => {
    class DTO extends Model() {
      @Prop({
        type: Number,
        decorate: () => [
          {
            when: ['eq'],
            with: [IsNumber({ allowNaN: false })],
          },
        ],
      })
      value: number
    }

    const dto = plainToClass(DTO, { value: 5 })

    expect(dto.value).toBe(5)
    expect(dto.toJSON().value.operators).toEqual(['eq'])
  })

  it('should return error to a single decorator in an operation', () => {
    class Example extends Model() {
      @Prop({
        type: Number,
        enums: [10, 50],
        decorate: () => [
          {
            when: ['eq'],
            with: [IsNumber()],
          },
        ],
      })
      id: number | number[]
    }

    const dto = plainToClass(Example, { id: { eq: 'A' } })

    expect(dto.toJSON().id.operators).toEqual(['eq'])
    expect(getErrorConstraints(validateSync(dto))).toEqual({
      isNumber: 'id must be a number conforming to the specified constraints',
    })
  })

  it('should return error for multiple decorators and operators', () => {
    class Example extends Model() {
      @Prop({
        type: Number,
        enums: [10, 50],
        decorate: ({ enums }) => [
          {
            when: ['eq', 'df', 'ls'],
            with: [IsNumber()],
          },
          {
            when: ['in', 'ni'],
            with: [IsArray(), IsNumber({}, { each: true })],
          },
          {
            when: ['ls'],
            with: [IsIn(enums)],
          },
          {
            when: ['bt'],
            with: [Min(1), Max(10)],
          },
        ],
      })
      id: number | number[]
    }

    const dto = plainToClass(Example, {})
    expect(dto.toJSON().id.operators).toEqual([
      'eq',
      'df',
      'ls',
      'in',
      'ni',
      'bt',
    ])

    const dtoA = plainToClass(Example, { id: { eq: 'A' } })

    expect(getErrorConstraints(validateSync(dtoA))).toEqual({
      isNumber: 'id must be a number conforming to the specified constraints',
    })

    const dtoB = plainToClass(Example, { id: { in: 1 } })

    expect(getErrorConstraints(validateSync(dtoB))).toEqual({
      isArray: 'id must be an array',
    })

    const dtoC = plainToClass(Example, { id: { ls: 100 } })
    expect(getErrorConstraints(validateSync(dtoC))).toEqual({
      isIn: 'id must be one of the following values: 10, 50',
    })

    const dtoD = plainToClass(Example, { id: { bt: 100 } })
    expect(getErrorConstraints(validateSync(dtoD))).toEqual({
      arrayMaxSize: 'id must contain not more than 2 elements',
      arrayMinSize: 'id must contain at least 2 elements',
      max: 'id must not be greater than 10',
    })
  })

  it('must return error for an invalid or missing operator', () => {
    class DTO extends Model() {
      @Prop({
        type: Number,
        decorate: [
          {
            when: ['eq', 'ge'],
            with: [IsNumber()],
          },
        ],
      })
      field: number
    }

    const dto = plainToClass(DTO, { field: { foo: 10 } })

    expect(getErrorConstraints(validateSync(dto))).toEqual({
      rule: 'field: wait for one of the operators: eq,ge',
    })
  })
})
