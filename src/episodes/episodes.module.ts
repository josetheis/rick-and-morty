import { Module } from '@nestjs/common';
import { EpisodesService } from './services/episodes.service';
import { EpisodesController } from './episodes.controller';
import { SharedModule } from 'src/shared/shared.module';
import { EpisodeRepository } from './services/episode.repository';

@Module({
  imports: [SharedModule],
  exports: [EpisodesService],
  controllers: [EpisodesController],
  providers: [EpisodesService, EpisodeRepository],
})
export class EpisodesModule {}
