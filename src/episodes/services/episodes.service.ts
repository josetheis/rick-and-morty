import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateEpisodeDto } from '../dto/create-episode.dto';
import { UpdateEpisodeDto } from '../dto/update-episode.dto';
import { EpisodeRepository } from './episode.repository';
import { Prisma } from '@prisma/client';
import { patchObject } from 'src/shared/util/patchObject';

@Injectable()
export class EpisodesService {
  constructor(private repository: EpisodeRepository) {}

  async create(createEpisodeDto: CreateEpisodeDto) {
    await this.ensureEpisodeDoesNotExists(
      createEpisodeDto.name,
      createEpisodeDto.season,
    );

    const season = await this.getValidSeasonByName(createEpisodeDto.season);
    return this.repository.save(
      createEpisodeDto.name,
      season.id,
      createEpisodeDto.duration,
    );
  }

  async findAll(page: number, seasonName?: string) {
    const where: Prisma.EpisodeWhereInput = {};

    if (seasonName) {
      const season = await this.repository.getSeasonByName(seasonName);
      where.seasonId = season.id;
    }

    return this.repository.find(where, page);
  }

  async findOne(id: string) {
    const {
      results: [episodeFound],
    } = await this.repository.find({ id });

    if (!episodeFound) {
      throw new HttpException(
        "The episode couldn't be found",
        HttpStatus.NOT_FOUND,
      );
    }

    return episodeFound;
  }

  async update(id: string, updateEpisodeDto: UpdateEpisodeDto) {
    const episodeFound = await this.findOne(id);
    const patchedEpisode = patchObject(updateEpisodeDto, episodeFound);

    await this.ensureEpisodeDoesNotExists(
      patchedEpisode.name,
      patchedEpisode.season,
    );

    const data: Prisma.EpisodeUncheckedUpdateInput = {};
    const { name, duration } = updateEpisodeDto;
    Object.entries({ name, duration }).forEach(([key, value]) => {
      if (value) {
        data[key] = value;
      }
    });

    if (updateEpisodeDto.season) {
      const season = await this.getValidSeasonByName(updateEpisodeDto.season);
      data.seasonId = season.id;
    }

    if (updateEpisodeDto.status) {
      const status = await this.getValidStatusByName(updateEpisodeDto.status);
      data.statusId = status.id;
    }

    return this.repository.update(id, data);
  }

  async remove(id: string) {
    const episodeFound = await this.findOne(id);
    return this.repository.remove(episodeFound.id);
  }

  public async getValidSeasonByName(seasonName: string) {
    const seasonFound = await this.repository.getSeasonByName(seasonName);

    if (!seasonFound) {
      throw new HttpException(
        `The season '${seasonName}' doesn't exists`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return seasonFound;
  }

  public async getValidStatusByName(seasonName: string) {
    const statusFound = await this.repository.getStatusByName(seasonName);

    if (!statusFound) {
      throw new HttpException(
        `The status '${seasonName}' doesn't exists`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return statusFound;
  }

  private async ensureEpisodeDoesNotExists(name: string, season: string) {
    const {
      results: [episodeFound],
    } = await this.repository.find({
      name: name,
      season: {
        name: season,
      },
    });

    if (episodeFound) {
      throw new HttpException(
        'A character with the same data already exists',
        HttpStatus.CONFLICT,
      );
    }
  }
}
