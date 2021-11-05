import { plainToClass } from 'class-transformer'
import { validateSync } from 'class-validator'
import { Model, Prop } from '../index'
import { getErrorConstraints } from '../utils/test.util'

describe('Validate', () => {
  class DTO extends Model() {
    @Prop({
      type: Number,
      validate: ({ value }) => value === 51,
    })
    value: number
  }

  describe('when it passes', () => {
    it('should return true if validation is met.', () => {
      const dto = plainToClass(DTO, { value: 51 })

      expect(validateSync(dto)).toEqual([])
    })

    it('must succeed and the defined enums must be available', () => {
      class CustomDTO extends Model() {
        @Prop({
          type: Number,
          enums: [10, 50, 120],
          validate: ({ value, schema }) => schema.enums.includes(+value),
        })
        value: number
      }

      const dto = plainToClass(CustomDTO, { value: 50 })

      expect(validateSync(dto)).toEqual([])
    })

    it('must succeed and the defined arguments must be available', () => {
      class CustomDTO extends Model() {
        @Prop({
          type: Number,
          enums: [10, 50, 120],
          args: ['d', 'm', 'y'],
          validate: ({ value, args, schema }) => {
            return (
              schema.enums.includes(+value) &&
              args.some(arg => schema.args.includes(arg))
            )
          },
        })
        value: number
      }

      const dto = plainToClass(CustomDTO, { value: { eq: 50, args: ['d'] } })

      expect(validateSync(dto)).toEqual([])
    })
  })

  describe("when it doesn't pass", () => {
    it('should return an error with the default message', () => {
      const dto = plainToClass(DTO, { value: 50 })

      expect(getErrorConstraints(validateSync(dto))).toEqual({
        rule: 'rule not satisfied',
      })
    })

    it('should return an error with a custom message', () => {
      class CustomDTO extends Model() {
        @Prop({
          type: Number,
          options: {
            message: 'A personalized message.',
          },
          validate: ({ value }) => value === 51,
        })
        value: number
      }

      const dto = plainToClass(CustomDTO, { value: 50 })

      expect(getErrorConstraints(validateSync(dto))).toEqual({
        rule: 'A personalized message.',
      })
    })

    it('should return a custom error message from the validator', () => {
      class CustomDTO extends Model() {
        @Prop({
          type: Number,
          validate: ({ value }) =>
            value === 51 || 'An error message from the validator',
        })
        value: number
      }

      const dto = plainToClass(CustomDTO, { value: 50 })

      expect(getErrorConstraints(validateSync(dto))).toEqual({
        rule: 'value: An error message from the validator',
      })
    })

    it('should return error if more than one argument is given for operation', () => {
      class DTO extends Model() {
        @Prop({
          type: Number,
        })
        field: number
      }

      const dto = plainToClass(DTO, {
        field: { eq: 50, ls: 30, args: ['foo', 'bar'] },
      })

      expect(getErrorConstraints(validateSync(dto))).toEqual({
        rule: 'field: only one operation is allowed per field',
      })
    })
  })
})
