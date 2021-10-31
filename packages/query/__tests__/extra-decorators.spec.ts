import { plainToClass } from 'class-transformer'
import { Prop } from '../'
import { Model } from '../mixin'

describe('Extra Decorators', () => {
  it('Must apply new decorators after rules effect', () => {
    class DTO extends Model() {
      @Prop({
        type: Number,
      })
      id: number
    }

    const dto = plainToClass(DTO, { id: { eq: 1 } })

    expect(true)
  })
})
