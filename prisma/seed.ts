import { Prisma, PrismaClient, Status, Subcategory } from '@prisma/client';
const prisma = new PrismaClient();

interface RickAndMortyAPIResponse<T> {
  info: {
    count: number;
    next: string | null;
    pages: number;
    prev: string | null;
  };
  results: T[];
}

const fetchAllElements = async (url: string) => {
  const initialData: RickAndMortyAPIResponse<{ name: string }> = await fetch(
    url,
  ).then((res) => res.json());

  let next = initialData.info.next;
  const elements = [...initialData.results];
  while (next) {
    const { info, results } = await fetch(next).then((res) => res.json());
    elements.push(...results);
    next = info.next;
  }

  return elements;
};

const getRandomDuration = () => {
  const min = Math.ceil(1);
  const max = Math.floor(3599);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomSubcategoryId = (seasons: Subcategory[] | Status[]) => {
  return seasons[Math.floor(Math.random() * seasons.length)].id;
};

async function main() {
  const { subcategories: SPECIES } = await prisma.category.create({
    data: {
      name: 'SPECIES',
      subcategories: {
        create: [{ name: 'HUMAN' }, { name: 'ALIEN' }],
      },
    },
    include: {
      subcategories: true,
    },
  });

  const { subcategories: SEASONS } = await prisma.category.create({
    data: {
      name: 'SEASON',
      subcategories: {
        create: [
          { name: 'SEASON 1' },
          { name: 'SEASON 2' },
          { name: 'SEASON 3' },
        ],
      },
    },
    include: {
      subcategories: true,
    },
  });

  const { status: CHARACTER_STATUS } = await prisma.type.create({
    data: {
      name: 'CHARACTERS',
      status: {
        create: [{ name: 'ACTIVE' }, { name: 'SUSPENDED' }],
      },
    },
    include: {
      status: true,
    },
  });

  const { status: EPISODES_STATUS } = await prisma.type.create({
    data: {
      name: 'EPISODES',
      status: {
        create: [{ name: 'ACTIVE' }, { name: 'CANCELLED' }],
      },
    },
    include: {
      status: true,
    },
  });

  const [characters, episodes] = await Promise.all([
    fetchAllElements('https://rickandmortyapi.com/api/character'),
    fetchAllElements('https://rickandmortyapi.com/api/episode'),
  ]);

  const charactersData = characters.map((r) => ({
    name: r.name,
    speciesId: getRandomSubcategoryId(SPECIES),
    statusId: getRandomSubcategoryId(CHARACTER_STATUS),
  }));
  const episodesData = episodes.map((r) => ({
    name: r.name,
    duration: getRandomDuration(),
    seasonId: getRandomSubcategoryId(SEASONS),
    statusId: getRandomSubcategoryId(EPISODES_STATUS),
  }));

  const [createdEpisodes, createdCharacters] = await prisma.$transaction([
    prisma.episode.createManyAndReturn({
      data: episodesData,
    }),
    prisma.character.createManyAndReturn({
      data: charactersData,
    }),
  ]);

  const participationArgs: Prisma.ParticipationCreateManyArgs = {
    data: createdEpisodes
      .map((episode) => {
        return createdCharacters.slice(0, 5).map((character) => ({
          episodeId: episode.id,
          characterId: character.id,
          init: 1,
          finish: 30,
        }));
      })
      .flat(),
  };

  await prisma.participation.createMany(participationArgs);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
