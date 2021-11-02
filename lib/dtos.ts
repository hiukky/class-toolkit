import { IsIn, IsOptional, IsString } from 'class-validator'
import { OPERATORS } from './constants'
import { QueryTypes } from './interfaces'

export class PropMetadataDTO {
  @IsIn(Object.keys(OPERATORS))
  operator: QueryTypes.Operators

  @IsString()
  value: any

  @IsOptional()
  args?: any[]

  @IsString()
  source: string
}
