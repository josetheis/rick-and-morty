import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Episode } from '../entities/episode.entity';
import { Category } from 'src/shared/enums/Category';
import { Type } from 'src/shared/enums/Type';
import { PAGE_SIZE } from 'src/shared/constants';

@Injectable()
export class EpisodeRepository {
  constructor(private prisma: PrismaService) {}

  public async save(name: string, seasonId: string, duration: number) {
    const { id: statusId } = await this.getStatusByName('ACTIVE');

    return this.prisma.episode
      .create({
        data: {
          name,
          duration,
          seasonId,
          statusId,
        },
        include: {
          status: true,
          season: true,
        },
      })
      .then(Episode.fromPrisma);
  }

  public async remove(id: string) {
    const { id: statusId } = await this.getStatusByName('CANCELLED');
    return this.update(id, {
      statusId,
    });
  }

  public update(id: string, data: Prisma.EpisodeUncheckedUpdateInput) {
    return this.prisma.episode
      .update({
        where: {
          id,
        },
        data,
        include: {
          season: true,
          status: true,
        },
      })
      .then(Episode.fromPrisma);
  }

  public async find(where: Prisma.EpisodeWhereInput, offset = 1) {
    const [rawResults, count] = await this.prisma.$transaction([
      this.prisma.episode.findMany({
        include: {
          status: true,
          season: true,
        },
        where,
        skip: (offset - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      this.prisma.episode.count({
        where,
      }),
    ]);

    return { results: rawResults.map(Episode.fromPrisma), count };
  }

  public getSeasonByName(seasonName: string) {
    return this.prisma.subcategory.findFirst({
      where: {
        name: seasonName,
        category: {
          name: Category.SEASON,
        },
      },
    });
  }

  public getStatusByName(statusName: string) {
    return this.prisma.status.findFirst({
      where: {
        name: statusName,
        type: {
          name: Type.EPISODES,
        },
      },
    });
  }
}
