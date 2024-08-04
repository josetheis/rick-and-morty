import { Prisma } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { Character } from 'src/characters/entities/character.entity';
import { Episode } from 'src/episodes/entities/episode.entity';
import { transformSecondsToMinutes } from 'src/shared/util/transformSecondsToMinutes';

type ParticipationPrisma = Prisma.ParticipationGetPayload<{
  include: {
    character: {
      include: {
        species: true;
        status: true;
      };
    };
    episode: {
      include: {
        season: true;
        status: true;
      };
    };
  };
}>;

export class Participation {
  id: string;
  character: Character;
  episode: Episode;
  init: string;
  finish: string;
  @Exclude()
  initInSeconds: number;
  @Exclude()
  finishInSeconds: number;

  constructor(
    id: string,
    init: number,
    finish: number,
    episode: Episode,
    character: Character,
  ) {
    this.id = id;
    this.episode = episode;
    this.init = transformSecondsToMinutes(init);
    this.finish = transformSecondsToMinutes(finish);
    this.initInSeconds = init;
    this.finishInSeconds = finish;
    this.character = character;
  }

  doesItOverlap(init: number, finish: number) {
    return this.initInSeconds <= finish && this.finishInSeconds >= init;
  }

  static fromPrisma(participation: ParticipationPrisma) {
    return new Participation(
      participation.id,
      participation.init,
      participation.finish,
      new Episode(
        participation.episodeId,
        participation.episode.name,
        participation.episode.season.name,
        participation.episode.duration,
        participation.episode.status.name,
      ),
      new Character(
        participation.characterId,
        participation.character.name,
        participation.character.species.name,
        participation.character.status.name,
      ),
    );
  }
}
