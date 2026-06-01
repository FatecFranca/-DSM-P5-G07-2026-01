import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { Vibe } from '../src/generated/prisma/enums';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';




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

const dbUrl = process.env.DATABASE_URL;
console.log(process.env.DATABASE_URL);

if (!dbUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString: dbUrl,
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

function parseVibe(value: string): Vibe {
  const vibe = value?.trim().toUpperCase();

  if (!(vibe in Vibe)) {
    throw new Error(`Invalid vibe value: ${value}`);
  }

  return Vibe[vibe as keyof typeof Vibe];
}

async function main() {
  const csvPath = path.join(
    process.cwd(),
    
    'data',
    'dataset_final.csv',
  );

  console.log(`Reading CSV from: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  const file = fs.readFileSync(csvPath, 'utf8');

  const records = parse(file, {
    columns: true,
    skip_empty_lines: true,
  }) as CsvTrack[];

  for (const row of records) {
    await prisma.track.upsert({
      where: {
        spotifyId: row.track_id,
      },

      update: {
        trackName: row.track_name,
        artists: row.artists,
        albumName: row.album_name,
        popularity: Number(row.popularity),
        durationMs: Number(row.duration_ms),
        explicit: parseBoolean(row.explicit),
        danceability: Number(row.danceability),
        energy: Number(row.energy),
        key: Number(row.key),
        loudness: Number(row.loudness),
        mode: Number(row.mode),
        speechiness: Number(row.speechiness),
        acousticness: Number(row.acousticness),
        instrumentalness: Number(row.instrumentalness),
        liveness: Number(row.liveness),
        valence: Number(row.valence),
        tempo: Number(row.tempo),
        timeSignature: Number(row.time_signature),
        trackGenre: row.track_genre,
        vibe: parseVibe(row.vibe),
      },

      create: {
        spotifyId: row.track_id,
        trackName: row.track_name,
        artists: row.artists,
        albumName: row.album_name,
        popularity: Number(row.popularity),
        durationMs: Number(row.duration_ms),
        explicit: parseBoolean(row.explicit),
        danceability: Number(row.danceability),
        energy: Number(row.energy),
        key: Number(row.key),
        loudness: Number(row.loudness),
        mode: Number(row.mode),
        speechiness: Number(row.speechiness),
        acousticness: Number(row.acousticness),
        instrumentalness: Number(row.instrumentalness),
        liveness: Number(row.liveness),
        valence: Number(row.valence),
        tempo: Number(row.tempo),
        timeSignature: Number(row.time_signature),
        trackGenre: row.track_genre,
        vibe: parseVibe(row.vibe),
      },
    });
  }

  console.log(`Import complete: ${records.length} tracks processed.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });