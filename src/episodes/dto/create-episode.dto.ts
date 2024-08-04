import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateEpisodeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  season: string;
  @IsInt()
  @Min(1)
  @Max(3599)
  duration;
}
