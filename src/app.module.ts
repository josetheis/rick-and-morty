import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { CharactersModule } from './characters/characters.module';
import { SharedModule } from './shared/shared.module';
import { EpisodesModule } from './episodes/episodes.module';
import { ParticipationsModule } from './participations/participations.module';

@Module({
  imports: [
    CharactersModule,
    SharedModule,
    EpisodesModule,
    ParticipationsModule,
  ],
  providers: [AppService],
})
export class AppModule {}
