import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCharacterDto } from '../dto/create-character.dto';
import { UpdateCharacterDto } from '../dto/update-character.dto';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CharacterStatus } from '../enums/CharacterStatus';
import { Prisma } from '@prisma/client';
import { CharactersRepository } from './characters.repository';
import { patchObject } from 'src/shared/util/patchObject';

@Injectable()
export class CharactersService {
  constructor(
    private prisma: PrismaService,
    private repository: CharactersRepository,
  ) {}

  async create(createCharacterDto: CreateCharacterDto) {
    await this.ensureCharacterDoesNotExist(
      createCharacterDto.name,
      createCharacterDto.species,
      CharacterStatus.ACTIVE,
    );

    return this.repository.save(
      createCharacterDto.name,
      createCharacterDto.species,
    );
  }

  async findAll(page: number, species?: string, status?: string) {
    const where: Prisma.CharacterWhereInput = {};

    if (species) {
      const { id: speciesId } = await this.getValidSpeciesByName(species);
      where.speciesId = speciesId;
    }

    if (status) {
      const { id: statusId } = await this.getValidStatusByName(status);
      where.statusId = statusId;
    }

    return this.repository.find(where, page);
  }

  async findOne(id: string) {
    const {
      results: [characterFound],
    } = await this.repository.find({ id });
    if (!characterFound) {
      throw new HttpException('No character was found', HttpStatus.NOT_FOUND);
    }

    return characterFound;
  }

  async update(id: string, updateCharacterDto: UpdateCharacterDto) {
    const character = await this.findOne(id);
    const patchedCharacter = patchObject(updateCharacterDto, character);
    const payload: Prisma.CharacterUncheckedUpdateInput = {
      name: updateCharacterDto.name,
    };

    await this.ensureCharacterDoesNotExist(
      patchedCharacter.name,
      patchedCharacter.species,
      patchedCharacter.status,
    );

    if (updateCharacterDto.species) {
      const species = await this.getValidSpeciesByName(
        updateCharacterDto.species,
      );
      payload.speciesId = species.id;
    }

    if (updateCharacterDto.status) {
      const status = await this.getValidStatusByName(updateCharacterDto.status);
      payload.statusId = status.id;
    }

    return this.repository.update(id, payload);
  }

  async remove(id: string) {
    await this.repository.remove(id);
  }

  public async getValidStatusByName(statusName: string) {
    const status = await this.repository.getStatusByName(statusName);

    if (!status) {
      throw new HttpException(
        "The status doesn't exists",
        HttpStatus.BAD_REQUEST,
      );
    }
    return status;
  }

  private async getValidSpeciesByName(statusName: string) {
    const species = await this.repository.getSpeciesByName(statusName);

    if (!species) {
      throw new HttpException(
        "The species doesn't exists",
        HttpStatus.BAD_REQUEST,
      );
    }
    return species;
  }

  private async ensureCharacterDoesNotExist(
    name: string,
    speciesName: string,
    statusName: string,
  ) {
    const { id: statusId } = await this.getValidStatusByName(statusName);
    const { id: speciesId } = await this.getValidSpeciesByName(speciesName);
    const {
      results: [characterFound],
    } = await this.repository.find({
      name,
      statusId,
      speciesId,
    });

    console.log({ characterFound });

    if (characterFound) {
      throw new HttpException(
        'A character with those values already exists',
        HttpStatus.CONFLICT,
      );
    }
  }
}
