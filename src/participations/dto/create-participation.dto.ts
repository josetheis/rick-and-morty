import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateParticipationDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  characterId: string;
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  episodeId: string;
  @IsInt()
  @Min(1)
  initInSeconds: number;
  @IsInt()
  @Max(3599)
  finishInSeconds: number;
}
