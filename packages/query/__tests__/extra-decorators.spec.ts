import { plainToClass } from 'class-transformer'
import { Rule } from '../'
import { Model } from '../mixin'

describe('Extra Decorators', () => {
  it('Must apply new decorators after rules effect', () => {
    class DTO extends Model() {
      @Rule({
        type: Number,
      })
      id: number
    }

    const dto = plainToClass(DTO, { id: { eq: 1 } })

    expect(true)
  })
})
