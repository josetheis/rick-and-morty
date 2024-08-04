import { Module } from '@nestjs/common';
import { ParticipationsService } from './services/participations.service';
import { ParticipationsController } from './participations.controller';
import { ParticipationRepository } from './services/participation.repository';
import { SharedModule } from 'src/shared/shared.module';
import { EpisodesModule } from 'src/episodes/episodes.module';
import { CharactersModule } from 'src/characters/characters.module';

@Module({
  imports: [SharedModule, EpisodesModule, CharactersModule],
  controllers: [ParticipationsController],
  providers: [ParticipationsService, ParticipationRepository],
})
export class ParticipationsModule {}
