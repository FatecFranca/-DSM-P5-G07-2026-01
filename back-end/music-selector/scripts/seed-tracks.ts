import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { Vibe } from '../src/generated/prisma/enums';

interface CsvTrack {
  track_id: string;
  track_name: string;
  artists: string;
  album_name: string;
  popularity: string;
  duration_ms: string;
  explicit: string;
  danceability: string;
  energy: string;
  key: string;
  loudness: string;
  mode: string;
  speechiness: string;
  acousticness: string;
  instrumentalness: string;
  liveness: string;
  valence: string;
  tempo: string;
  time_signature: string;
  track_genre: string;
  vibe: string;
}

const TEST_MODE = true;
const TEST_LIMIT = 1000;
const BATCH_SIZE = 100;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const genreCache = new Map<string, string>();

function normalizeGenre(value: string): string {
  if (!value) return 'unknown';

  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '');
}

function parseBoolean(value: unknown): boolean {
  return (
    value === true ||
    value === 'true' ||
    value === 'True' ||
    value === '1'
  );
}

function toNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? 0 : numberValue;
}

function parseVibe(value: string): Vibe {
  const vibe = value?.trim().toUpperCase();

  if (!(vibe in Vibe)) {
    throw new Error(`Vibe inválida encontrada no CSV: ${value}`);
  }

  return Vibe[vibe as keyof typeof Vibe];
}

async function loadGenres() {
  const genres = await prisma.genre.findMany();

  for (const genre of genres) {
    genreCache.set(genre.spotifyKey, genre.id);
  }

  console.log(`🎼 ${genres.length} gêneros carregados no cache`);
}

async function getOrCreateGenre(rawGenre: string): Promise<string> {
  const spotifyKey = normalizeGenre(rawGenre);
  const name = rawGenre?.trim() || 'unknown';

  if (genreCache.has(spotifyKey)) {
    return genreCache.get(spotifyKey)!;
  }

  const genre = await prisma.genre.upsert({
    where: {
      spotifyKey,
    },
    update: {
      name,
    },
    create: {
      name,
      spotifyKey,
    },
  });

  genreCache.set(spotifyKey, genre.id);

  return genre.id;
}

async function processTrack(row: CsvTrack) {
  const genreId = await getOrCreateGenre(row.track_genre);

  const track = await prisma.track.upsert({
    where: {
      spotifyId: row.track_id,
    },
    update: {
      trackName: row.track_name || 'Sem nome',
      artists: row.artists || 'Desconhecido',
      albumName: row.album_name || 'Sem álbum',
      popularity: toNumber(row.popularity),
      durationMs: toNumber(row.duration_ms),
      explicit: parseBoolean(row.explicit),

      vibe: parseVibe(row.vibe),

      danceability: toNumber(row.danceability),
      energy: toNumber(row.energy),
      key: toNumber(row.key),
      loudness: toNumber(row.loudness),
      mode: toNumber(row.mode),
      speechiness: toNumber(row.speechiness),
      acousticness: toNumber(row.acousticness),
      instrumentalness: toNumber(row.instrumentalness),
      liveness: toNumber(row.liveness),
      valence: toNumber(row.valence),
      tempo: toNumber(row.tempo),
      timeSignature: toNumber(row.time_signature),
    },
    create: {
      spotifyId: row.track_id,
      trackName: row.track_name || 'Sem nome',
      artists: row.artists || 'Desconhecido',
      albumName: row.album_name || 'Sem álbum',
      popularity: toNumber(row.popularity),
      durationMs: toNumber(row.duration_ms),
      explicit: parseBoolean(row.explicit),

      vibe: parseVibe(row.vibe),

      danceability: toNumber(row.danceability),
      energy: toNumber(row.energy),
      key: toNumber(row.key),
      loudness: toNumber(row.loudness),
      mode: toNumber(row.mode),
      speechiness: toNumber(row.speechiness),
      acousticness: toNumber(row.acousticness),
      instrumentalness: toNumber(row.instrumentalness),
      liveness: toNumber(row.liveness),
      valence: toNumber(row.valence),
      tempo: toNumber(row.tempo),
      timeSignature: toNumber(row.time_signature),
    },
  });

  await prisma.trackGenre.upsert({
    where: {
      trackId_genreId: {
        trackId: track.id,
        genreId,
      },
    },
    update: {},
    create: {
      trackId: track.id,
      genreId,
    },
  });
}

async function processBatch(batch: CsvTrack[]) {
  for (const row of batch) {
    await processTrack(row);
  }
}

async function main() {
  const csvPath = path.join(process.cwd(), 'data', 'dataset_final.csv');

  console.log(`📂 Lendo CSV: ${csvPath}`);

  const file = fs.readFileSync(csvPath, 'utf8');

  const allRecords = parse(file, {
    columns: true,
    skip_empty_lines: true,
  }) as CsvTrack[];

  const records = TEST_MODE
    ? allRecords.slice(0, TEST_LIMIT)
    : allRecords;

  console.log(`🎧 Total de músicas no CSV: ${allRecords.length}`);

  if (TEST_MODE) {
    console.log(`🧪 MODO TESTE ATIVO: importando apenas ${records.length} músicas`);
  } else {
    console.log(`🚀 MODO COMPLETO: importando ${records.length} músicas`);
  }

  await loadGenres();

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    console.log(
      `⚡ Processando lote ${batchNumber} (${batch.length} músicas)`
    );

    await processBatch(batch);

    console.log(
      `✅ ${Math.min(i + BATCH_SIZE, records.length)} / ${records.length} músicas processadas`
      
    );
  }

  console.log('✅ Seed finalizado com sucesso');

  if (TEST_MODE) {
    console.log('');
    console.log('⚠️ O seed rodou em MODO TESTE.');
    console.log('Para importar tudo, altere TEST_MODE para false.');
  }
}

main()
  .catch((error) => {
    console.error('❌ Erro ao importar músicas:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });