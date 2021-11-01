import { Model } from '../lib/mixin'
import { Prop } from '../lib/decorator'
import { plainToClass, deserialize } from 'class-transformer'

describe('To JSON', () => {
  it('must return a valid json schema', () => {
    class A extends Model() {
      @Prop({
        type: Number,
      })
      key: number

      @Prop({
        type: Number,
      })
      name: string
    }

    class B extends Model() {
      @Prop({
        type: Number,
      })
      key: number
    }

    // console.log('A', new A().toSchema())
    // console.log('B', new B().toSchema())

    // const dtoA = deserialize(A, '{}')
    // const dtoB = deserialize(B, '{}')

    // console.log('A', dtoA.toSchema())
    // console.log('B', dtoB.toSchema())
  })
})
