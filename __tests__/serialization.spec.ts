import { plainToClass, serialize, deserialize } from 'class-transformer'
import { Prop } from '../lib/decorator'
import { Model } from '../lib/mixin'

describe('Serealization', () => {
  class DTO extends Model() {
    @Prop({
      type: Number,
    })
    id: number
  }

  const dto = plainToClass(DTO, { id: { eq: 1 } })
  const payload = JSON.stringify({ id: 1 })
  const metadata = { operator: 'eq', value: 1, source: '{"eq":1}' }
  const schema = {
    id: {
      name: 'Prop',
      required: false,
      operators: ['eq'],
      type: Number,
      enums: [],
      args: [],
      conflits: [],
    },
  }
  const jsonSchema = {
    id: {
      name: 'Prop',
      required: false,
      operators: ['eq'],
      type: 'Number',
      enums: [],
      args: [],
      conflits: [],
    },
  }

  it('should return a DTO in serialized json object', () => {
    expect(serialize(dto)).toEqual(payload)
  })

  it('must return a deserialized DTO instance', () => {
    const data = deserialize(DTO, payload)

    expect(data).toBeInstanceOf(DTO)
    expect(data).toEqual(dto)

    expect(data.toSource()).toEqual({ id: '{"eq":1}' })
    expect(data.toJSON()).toEqual(jsonSchema)
    expect(data.toSchema()).toEqual(schema)
    expect(data.get('id')).toEqual(metadata)
    expect(data.id).toEqual(1)
  })
})
