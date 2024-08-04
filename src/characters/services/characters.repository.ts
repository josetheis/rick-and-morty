import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PAGE_SIZE } from 'src/shared/constants';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Character } from '../entities/character.entity';
import { Category } from 'src/shared/enums/Category';
import { Type } from 'src/shared/enums/Type';
import { CharacterStatus } from '../enums/CharacterStatus';

@Injectable()
export class CharactersRepository {
  constructor(private prisma: PrismaService) {}

  async save(name: string, speciesName: string) {
    const species = await this.getSpeciesByName(speciesName);
    const status = await this.getStatusByName(CharacterStatus.ACTIVE);

    return this.prisma.character
      .create({
        data: {
          name,
          speciesId: species.id,
          statusId: status.id,
        },
        include: {
          species: true,
          status: true,
        },
      })
      .then(Character.fromPrisma);
  }

  async find(where: Prisma.CharacterWhereInput, offset = 1) {
    const [results, count] = await this.prisma.$transaction([
      this.prisma.character.findMany({
        where,
        skip: (offset - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          species: true,
          status: true,
        },
      }),
      this.prisma.character.count({ where }),
    ]);

    return { results: results.map(Character.fromPrisma), count };
  }

  public async update(id: string, data: Prisma.CharacterUncheckedUpdateInput) {
    return this.prisma.character
      .update({
        where: {
          id,
        },
        include: {
          species: true,
          status: true,
        },
        data,
      })
      .then(Character.fromPrisma);
  }

  async remove(id: string) {
    const { id: statusId } = await this.getStatusByName(
      CharacterStatus.SUSPENDED,
    );

    return this.update(id, {
      statusId,
    });
  }

  public async getSpeciesByName(species: string) {
    return this.prisma.subcategory.findFirst({
      where: {
        name: species,
        category: {
          name: Category.SPECIES,
        },
      },
    });
  }

  public async getStatusByName(status: string) {
    return this.prisma.status.findFirst({
      where: {
        name: status,
        type: {
          name: Type.CHARACTERS,
        },
      },
    });
  }
}
