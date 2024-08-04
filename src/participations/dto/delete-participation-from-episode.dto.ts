import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteParticipationFromEpisodeDto {
  @IsString()
  @IsNotEmpty()
  characterId: string;
  @IsString()
  @IsNotEmpty()
  episodeId: string;
}
