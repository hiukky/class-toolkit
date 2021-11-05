import { plainToClass } from 'class-transformer'
import { Model, Prop, PropMetadataDTO } from '../index'

describe('Metadata', () => {
  it('must return an instance of PropMetadataDTO', () => {
    const dto = plainToClass(PropMetadataDTO, {
      operator: 'eq',
      value: 1,
      source: JSON.stringify({ eq: 1 }),
    })

    expect(dto).toBeInstanceOf(PropMetadataDTO)
  })
})
