import { CharacterStatus } from '../enums/CharacterStatus';
import { Prisma } from '@prisma/client';

type CharacterPrisma = Prisma.CharacterGetPayload<{
  include: { species: true; status: true };
}>;

export class Character {
  id: string;
  name: string;
  species: string;
  status: string;

  constructor(id: string, name: string, species: string, status: string) {
    this.id = id;
    this.name = name;
    this.species = species;
    this.status = status;
  }

  static fromPrisma(character: CharacterPrisma) {
    return new Character(
      character.id,
      character.name,
      character.species.name,
      character.status.name as CharacterStatus,
    );
  }
}
