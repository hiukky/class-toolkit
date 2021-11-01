import { plainToClass } from 'class-transformer'
import {
  IsArray,
  IsIn,
  IsNumber,
  validateSync,
  ValidationError,
} from 'class-validator'
import { Prop } from '../lib/decorator'
import { Model } from '../lib/mixin'

const getConstraints = (error: ValidationError[]): Record<string, string> => {
  return error[0]?.constraints as Record<string, string>
}

describe('Decorate', () => {
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
    expect(getConstraints(validateSync(dto))).toEqual({
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
        ],
      })
      id: number | number[]
    }

    const dtoA = plainToClass(Example, { id: { eq: 'A' } })
    const dtoB = plainToClass(Example, { id: { in: 1 } })
    const dtoC = plainToClass(Example, { id: { ls: 100 } })

    expect(dtoA.toJSON().id.operators).toEqual(['eq', 'df', 'ls', 'in', 'ni'])

    expect(getConstraints(validateSync(dtoA))).toEqual({
      isNumber: 'id must be a number conforming to the specified constraints',
    })
    expect(getConstraints(validateSync(dtoB))).toEqual({
      isArray: 'id must be an array',
    })
    expect(getConstraints(validateSync(dtoC))).toEqual({
      isIn: 'id must be one of the following values: 10, 50',
    })
  })
})
