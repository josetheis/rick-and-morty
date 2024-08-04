import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Participation } from '../entities/participation.entity';
import { PAGE_SIZE } from 'src/shared/constants';

@Injectable()
export class ParticipationRepository {
  private include = {
    include: {
      character: {
        include: {
          species: true,
          status: true,
        },
      },
      episode: {
        include: {
          season: true,
          status: true,
        },
      },
    },
  };

  constructor(private prisma: PrismaService) {}

  save(characterId: string, episodeId: string, init: number, finish: number) {
    return this.prisma.participation
      .create({
        data: {
          characterId,
          init,
          finish,
          episodeId,
        },
        ...this.include,
      })
      .then(Participation.fromPrisma);
  }

  async find(where: Prisma.ParticipationWhereInput, offset = 1) {
    const [results, count] = await this.prisma.$transaction([
      this.prisma.participation.findMany({
        where,
        skip: (offset - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        ...this.include,
      }),
      this.prisma.participation.count({ where }),
    ]);

    return { results: results.map(Participation.fromPrisma), count };
  }

  remove(args: Prisma.ParticipationDeleteManyArgs) {
    return this.prisma.participation.deleteMany(args);
  }

  public update(id: string, data: Prisma.ParticipationUncheckedUpdateInput) {
    return this.prisma.participation
      .update({
        data,
        where: {
          id,
        },
        ...this.include,
      })
      .then(Participation.fromPrisma);
  }
}
