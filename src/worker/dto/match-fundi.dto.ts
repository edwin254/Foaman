import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class MatchFundiDto {
  @IsString()
  @IsNotEmpty()
  public readonly skill!: string;

  @IsString()
  @IsNotEmpty()
  public readonly location!: string;

  @IsString()
  @IsOptional()
  public readonly description?: string;
}
