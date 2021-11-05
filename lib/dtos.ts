import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { OPERATORS } from './constants'
import { QueryTypes } from './interfaces'

export class PropMetadataDTO {
  @IsIn(Object.keys(OPERATORS))
  operator: QueryTypes.Operators

  @IsNotEmpty()
  value: any

  @IsOptional()
  args: any[]

  @IsString()
  source: string
}
