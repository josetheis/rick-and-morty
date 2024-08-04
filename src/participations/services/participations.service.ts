import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateParticipationDto } from '../dto/create-participation.dto';
import { UpdateParticipationDto } from '../dto/update-participation.dto';
import { ParticipationRepository } from './participation.repository';
import { EpisodesService } from 'src/episodes/services/episodes.service';
import { CharactersService } from 'src/characters/services/characters.service';
import { DeleteParticipationFromEpisodeDto } from '../dto/delete-participation-from-episode.dto';
import { Prisma } from '@prisma/client';
import { patchObject } from 'src/shared/util/patchObject';
import { Participation } from '../entities/participation.entity';

@Injectable()
export class ParticipationsService {
  constructor(
    private repository: ParticipationRepository,
    private episodeService: EpisodesService,
    private characterService: CharactersService,
  ) {}
  async create({
    characterId,
    episodeId,
    finishInSeconds,
    initInSeconds,
  }: CreateParticipationDto) {
    const { results } = await this.repository.find({
      episodeId,
      characterId,
    });

    await this.ensureDataIsValid(
      results,
      episodeId,
      characterId,
      initInSeconds,
      finishInSeconds,
    );

    return this.repository.save(
      characterId,
      episodeId,
      initInSeconds,
      finishInSeconds,
    );
  }

  async findAll(
    pageNumber: number,
    seasonName?: string,
    characterStatusName?: string,
    episodeStatusName?: string,
    episodeId?: string,
    characterId?: string,
  ) {
    const where: Prisma.ParticipationWhereInput = {
      episode: {},
      character: {},
    };

    if (seasonName) {
      const season = await this.episodeService.getValidSeasonByName(seasonName);
      where.episode.seasonId = season.id;
    }

    if (characterStatusName) {
      const characterStatus =
        await this.characterService.getValidStatusByName(characterStatusName);
      where.character.statusId = characterStatus.id;
    }

    if (episodeStatusName) {
      const episodeStatus =
        await this.episodeService.getValidStatusByName(episodeStatusName);
      where.episode.statusId = episodeStatus.id;
    }

    if (episodeId) {
      const episode = await this.episodeService.findOne(episodeId);
      where.episodeId = episode.id;
    }

    if (characterId) {
      const character = await this.characterService.findOne(characterId);
      where.characterId = character.id;
    }

    return this.repository.find(where, pageNumber);
  }

  async findOne(id: string) {
    const {
      results: [participationFound],
    } = await this.repository.find({ id });

    if (!participationFound) {
      throw new HttpException(
        "The participation couldn't be found",
        HttpStatus.NOT_FOUND,
      );
    }

    return participationFound;
  }

  async update(id: string, updateParticipationDto: UpdateParticipationDto) {
    const participationFound = await this.findOne(id);
    const patchedParticipation = patchObject(
      updateParticipationDto,
      participationFound,
    );
    const { results } = await this.repository.find({
      id: {
        not: id,
      },
      episodeId: patchedParticipation.episode.id,
      characterId: patchedParticipation.character.id,
    });

    await this.ensureDataIsValid(
      results,
      patchedParticipation.episode.id,
      patchedParticipation.character.id,
      patchedParticipation.initInSeconds,
      patchedParticipation.finishInSeconds,
    );

    return this.repository.update(id, {
      characterId: updateParticipationDto.characterId,
      episodeId: updateParticipationDto.episodeId,
      init: updateParticipationDto.initInSeconds,
      finish: updateParticipationDto.finishInSeconds,
    });
  }

  async remove(id: string) {
    await this.repository.remove({
      where: {
        id,
      },
    });
  }

  async removeByCharacterFromEpisode({
    characterId,
    episodeId,
  }: DeleteParticipationFromEpisodeDto) {
    await this.repository.remove({
      where: {
        characterId,
        episodeId,
      },
    });
  }

  private ensureCharacterExists(id: string) {
    return this.characterService.findOne(id);
  }

  private async ensureDataIsValid(
    results: Participation[],
    episodeId: string,
    characterId: string,
    init: number,
    finish: number,
  ) {
    await this.ensureCharacterExists(characterId);

    if (results.some((r) => r.doesItOverlap(init, finish))) {
      throw new HttpException(
        'The time range overlaps with one of the participations',
        HttpStatus.CONFLICT,
      );
    }

    const { durationInSeconds } = await this.episodeService.findOne(episodeId);
    if (init >= finish || finish > durationInSeconds) {
      throw new HttpException(
        'The time range is invalid',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
