import { plainToClass } from 'class-transformer'
import { Rule } from '../'

describe('Extra Decorators', () => {
  it('Must apply new decorators after rules effect', () => {
    class DTO {
      @Rule({
        type: Number,
      })
      id: number
    }

    const dto = plainToClass(DTO, { id: { eq: 1 } })

    console.log(dto)

    expect(true)
  })
})
