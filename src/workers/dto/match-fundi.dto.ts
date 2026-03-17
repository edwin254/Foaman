import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class MatchFundiDto {
  @IsString()
  @IsNotEmpty()
  skill: string;

  @IsNotEmpty()
  location: { lat: number; lng: number };

  @IsString()
  @IsOptional()
  description?: string;
}
