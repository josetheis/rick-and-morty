import { Prisma } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { transformSecondsToMinutes } from 'src/shared/util/transformSecondsToMinutes';

type EpisodePrisma = Prisma.EpisodeGetPayload<{
  include: { status: true; season: true };
}>;

export class Episode {
  id: string;
  name: string;
  season: string;
  duration: string;
  status: string;
  @Exclude()
  durationInSeconds: number;

  constructor(
    id: string,
    name: string,
    season: string,
    durationInSeconds: number,
    status: string,
  ) {
    this.id = id;
    this.name = name;
    this.season = season;
    this.duration = transformSecondsToMinutes(durationInSeconds);
    this.durationInSeconds = durationInSeconds;
    this.status = status;
  }

  static fromPrisma(episode: EpisodePrisma) {
    return new Episode(
      episode.id,
      episode.name,
      episode.season.name,
      episode.duration,
      episode.status.name,
    );
  }
}
