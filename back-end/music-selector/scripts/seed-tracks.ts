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
  vibe: string;
}

const TEST_MODE = false;
const TEST_LIMIT = 1000;
const BATCH_SIZE = 100;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

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
    throw new Error(`Vibe invalida encontrada no CSV: ${value}`);
  }

  return Vibe[vibe as keyof typeof Vibe];
}

async function processTrack(row: CsvTrack) {
  await prisma.track.upsert({
    where: {
      spotifyId: row.track_id,
    },
    update: {
      trackName: row.track_name || 'Sem nome',
      artists: row.artists || 'Desconhecido',
      albumName: row.album_name || 'Sem album',
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
      albumName: row.album_name || 'Sem album',
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
}

async function processBatch(batch: CsvTrack[]) {
  for (const row of batch) {
    await processTrack(row);
  }
}

async function main() {
  const csvPath = path.join(process.cwd(), 'data', 'dataset_final.csv');

  console.log(`Lendo CSV: ${csvPath}`);

  const file = fs.readFileSync(csvPath, 'utf8');

  const allRecords = parse(file, {
    columns: true,
    skip_empty_lines: true,
  }) as CsvTrack[];

  const records = TEST_MODE
    ? allRecords.slice(0, TEST_LIMIT)
    : allRecords;

  console.log(`Total de musicas no CSV: ${allRecords.length}`);

  if (TEST_MODE) {
    console.log(`MODO TESTE ATIVO: importando apenas ${records.length} musicas`);
  } else {
    console.log(`MODO COMPLETO: importando ${records.length} musicas`);
  }

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    console.log(`Processando lote ${batchNumber} (${batch.length} musicas)`);

    await processBatch(batch);

    console.log(`${Math.min(i + BATCH_SIZE, records.length)} / ${records.length} musicas processadas`);
  }

  console.log('Seed finalizado com sucesso');

  if (TEST_MODE) {
    console.log('');
    console.log('O seed rodou em MODO TESTE.');
    console.log('Para importar tudo, altere TEST_MODE para false.');
  }
}

main()
  .catch((error) => {
    console.error('Erro ao importar musicas:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
