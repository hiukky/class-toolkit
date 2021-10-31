import { IsIn, IsOptional, IsString } from 'class-validator'
import { OPERATORS } from './constants'
import { RuleTypes } from './interfaces'

export class RuleMetadataDTO {
  @IsIn(Object.keys(OPERATORS))
  operator: RuleTypes.Operators

  @IsString()
  value: any

  @IsOptional()
  args?: any

  @IsString()
  source: string
}
