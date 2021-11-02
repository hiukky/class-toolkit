import { plainToClass } from 'class-transformer'
import { Model } from '../lib/mixins'
import { Prop } from '../lib/decorators'

describe('Type', () => {
  it('must return values with real types', () => {
    class DTO extends Model() {
      @Prop({
        type: Number,
      })
      number: number

      @Prop({
        type: Boolean,
      })
      bool: boolean

      @Prop({
        type: Number,
      })
      array: number[]

      @Prop({
        type: Date,
      })
      date: Date

      @Prop({
        type: Object,
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
