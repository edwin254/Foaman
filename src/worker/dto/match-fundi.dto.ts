import { IsString, IsNotEmpty, IsOptional, isString } from 'class-validator';

export class MatchFundiDto {
  @IsString()
  @IsNotEmpty()
  public readonlyskill: string;

  @IsString()
  @IsNotEmpty()
  public readonly location: string;

  @IsString()
  @IsOptional()
  description?: string;
}
