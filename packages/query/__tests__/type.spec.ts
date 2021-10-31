import { plainToClass } from 'class-transformer'
import { Model, Rule } from '../'

describe('Type', () => {
  it('Rule type', () => {
    class DTO extends Model() {
      @Rule({
        type: Number,
      })
      number: number

      @Rule({
        type: Boolean,
      })
      bool: boolean

      @Rule({
        type: Number,
      })
      array: number[]

      @Rule({
        type: Date,
      })
      date: Date

      @Rule({
        type: Object,

        options: {
          each: true,
        },
      })
      object: Record<string, any>
    }

    const payload = {
      number: { eq: '1' },
      bool: { eq: 'false' },
      array: { eq: '[1, 2, 50]' },
      date: { eq: new Date().toString() },
      object: { eq: JSON.stringify({ hello: 'Friend', status: 'true' }) },
    }

    const dto = plainToClass(DTO, payload)

    expect(dto.number).toEqual(1)
    expect(dto.bool).toEqual(false)
    expect(dto.array).toEqual([1, 2, 50])
    expect(dto.date).toEqual(dto.date)
    expect(dto.object).toEqual({ hello: 'Friend', status: 'true' })
  })
})
