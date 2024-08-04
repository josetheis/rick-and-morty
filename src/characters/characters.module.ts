import { Module } from '@nestjs/common';
import { CharactersService } from './services/characters.service';
import { CharactersController } from './characters.controller';
import { SharedModule } from 'src/shared/shared.module';
import { CharactersRepository } from './services/characters.repository';

@Module({
  imports: [SharedModule],
  exports: [CharactersService],
  controllers: [CharactersController],
  providers: [CharactersService, CharactersRepository],
})
export class CharactersModule {}
