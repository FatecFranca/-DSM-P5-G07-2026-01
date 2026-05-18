import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  ),
});

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // ─────────────────────────────────────────
  // CRIAR GÊNEROS
  // ─────────────────────────────────────────
  const genres = await Promise.all([
    prisma.genre.create({
      data: {
        name: 'Eletrônico',
        spotifyKey: 'electronic',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Hip Hop',
        spotifyKey: 'hip-hop',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Rock',
        spotifyKey: 'rock',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Pop',
        spotifyKey: 'pop',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Jazz',
        spotifyKey: 'jazz',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Clássico',
        spotifyKey: 'classical',
      },
    }),
  ]);

  console.log(`✅ ${genres.length} gêneros criados`);

  // ─────────────────────────────────────────
  // CRIAR USUÁRIOS
  // ─────────────────────────────────────────
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'João Silva',
        email: 'joao@example.com',
        birthDate: new Date('1990-05-15'),
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz', // hash fictício
        onboardingDone: true,
        onboardingProfile: {
          create: {
            audioPreference: 'MIXED',
          },
        },
        genres: {
          create: [
            { genreId: genres[0].id }, // Eletrônico
            { genreId: genres[1].id }, // Hip Hop
          ],
        },
      },
      include: { onboardingProfile: true, genres: true },
    }),
    prisma.user.create({
      data: {
        name: 'Maria Santos',
        email: 'maria@example.com',
        birthDate: new Date('1995-10-20'),
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz',
        onboardingDone: true,
        onboardingProfile: {
          create: {
            audioPreference: 'VOCAL',
          },
        },
        genres: {
          create: [
            { genreId: genres[3].id }, // Pop
            { genreId: genres[4].id }, // Jazz
          ],
        },
      },
      include: { onboardingProfile: true, genres: true },
    }),
    prisma.user.create({
      data: {
        name: 'Pedro Costa',
        email: 'pedro@example.com',
        birthDate: new Date('1988-03-08'),
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz',
        onboardingDone: true,
        onboardingProfile: {
          create: {
            audioPreference: 'INSTRUMENTAL',
          },
        },
        genres: {
          create: [
            { genreId: genres[2].id }, // Rock
            { genreId: genres[5].id }, // Clássico
          ],
        },
      },
      include: { onboardingProfile: true, genres: true },
    }),
  ]);

  console.log(`✅ ${users.length} usuários criados`);

  // ─────────────────────────────────────────
  // CRIAR TRACKS
  // ─────────────────────────────────────────
  const tracks = await Promise.all([
    // Eletrônico
    prisma.track.create({
      data: {
        spotifyId: 'spotify_001',
        trackName: 'Electric Dreams',
        artists: 'The Synthetics;DJ Wave',
        albumName: 'Neon Nights',
        popularity: 75,
        durationMs: 240000,
        explicit: false,
        energy: 0.85,
        valence: 0.7,
        danceability: 0.8,
        acousticness: 0.1,
        instrumentalness: 0.5,
        speechiness: 0.05,
        liveness: 0.2,
        loudness: -6.5,
        tempo: 128,
        key: 0,
        mode: 1,
        timeSignature: 4,
        trackGenre: 'Eletrônico',
      },
    }),
    // Hip Hop
    prisma.track.create({
      data: {
        spotifyId: 'spotify_002',
        trackName: 'Street Vibes',
        artists: 'MC Fire;Beat Master',
        albumName: 'Urban Legends',
        popularity: 82,
        durationMs: 210000,
        explicit: true,
        energy: 0.9,
        valence: 0.6,
        danceability: 0.75,
        acousticness: 0.05,
        instrumentalness: 0.1,
        speechiness: 0.3,
        liveness: 0.15,
        loudness: -5.8,
        tempo: 92,
        key: 1,
        mode: 0,
        timeSignature: 4,
        trackGenre: 'Hip Hop',
      },
    }),
    // Rock
    prisma.track.create({
      data: {
        spotifyId: 'spotify_003',
        trackName: 'Rock Anthem',
        artists: 'Thunder Road;Stone Hearts',
        albumName: 'Electric Rebellion',
        popularity: 88,
        durationMs: 280000,
        explicit: false,
        energy: 0.95,
        valence: 0.65,
        danceability: 0.6,
        acousticness: 0.15,
        instrumentalness: 0.3,
        speechiness: 0.1,
        liveness: 0.4,
        loudness: -4.2,
        tempo: 140,
        key: 5,
        mode: 1,
        timeSignature: 4,
        trackGenre: 'Rock',
      },
    }),
    // Pop
    prisma.track.create({
      data: {
        spotifyId: 'spotify_004',
        trackName: 'Sunshine Pop',
        artists: 'Bright Stars;Pop Queens',
        albumName: 'Happy Days',
        popularity: 90,
        durationMs: 200000,
        explicit: false,
        energy: 0.7,
        valence: 0.95,
        danceability: 0.85,
        acousticness: 0.2,
        instrumentalness: 0.05,
        speechiness: 0.1,
        liveness: 0.1,
        loudness: -5.0,
        tempo: 110,
        key: 7,
        mode: 1,
        timeSignature: 4,
        trackGenre: 'Pop',
      },
    }),
    // Jazz
    prisma.track.create({
      data: {
        spotifyId: 'spotify_005',
        trackName: 'Midnight Jazz',
        artists: 'Blue Notes;Smoky Nights',
        albumName: 'After Hours',
        popularity: 65,
        durationMs: 320000,
        explicit: false,
        energy: 0.55,
        valence: 0.5,
        danceability: 0.45,
        acousticness: 0.7,
        instrumentalness: 0.8,
        speechiness: 0.02,
        liveness: 0.6,
        loudness: -8.0,
        tempo: 85,
        key: 0,
        mode: 0,
        timeSignature: 4,
        trackGenre: 'Jazz',
      },
    }),
    // Clássico
    prisma.track.create({
      data: {
        spotifyId: 'spotify_006',
        trackName: 'Symphony No. 5',
        artists: 'Orquestra Sinfônica;Maestro Clássico',
        albumName: 'Obras Maestras',
        popularity: 72,
        durationMs: 480000,
        explicit: false,
        energy: 0.65,
        valence: 0.6,
        danceability: 0.3,
        acousticness: 0.95,
        instrumentalness: 0.99,
        speechiness: 0.0,
        liveness: 0.3,
        loudness: -15.0,
        tempo: 80,
        key: 10,
        mode: 1,
        timeSignature: 4,
        trackGenre: 'Clássico',
      },
    }),
  ]);

  console.log(`✅ ${tracks.length} tracks criadas`);

  // ─────────────────────────────────────────
  // CRIAR PLAYLISTS
  // ─────────────────────────────────────────
  const playlists = await Promise.all([
    prisma.playlist.create({
      data: {
        userId: users[0].id,
        name: 'Foco Total',
        objective: 'FOCUS',
        energyLevel: 'MEDIUM',
        mood: 'NEUTRAL',
        type: 'AUTOMATIC',
        tracks: {
          create: [
            { trackId: tracks[0].id, position: 1 },
            { trackId: tracks[4].id, position: 2 },
          ],
        },
      },
      include: { tracks: true },
    }),
    prisma.playlist.create({
      data: {
        userId: users[1].id,
        name: 'Bom Humor',
        objective: 'MOOD_BOOST',
        energyLevel: 'HIGH',
        mood: 'HAPPY',
        type: 'AUTOMATIC',
        tracks: {
          create: [
            { trackId: tracks[3].id, position: 1 },
            { trackId: tracks[1].id, position: 2 },
            { trackId: tracks[2].id, position: 3 },
          ],
        },
      },
      include: { tracks: true },
    }),
    prisma.playlist.create({
      data: {
        userId: users[2].id,
        name: 'Academia',
        objective: 'WORKOUT',
        energyLevel: 'HIGH',
        mood: 'HAPPY',
        type: 'ON_DEMAND',
        tracks: {
          create: [
            { trackId: tracks[2].id, position: 1 },
            { trackId: tracks[1].id, position: 2 },
            { trackId: tracks[3].id, position: 3 },
          ],
        },
      },
      include: { tracks: true },
    }),
  ]);

  console.log(`✅ ${playlists.length} playlists criadas`);

  // ─────────────────────────────────────────
  // CRIAR FEEDBACK
  // ─────────────────────────────────────────
  const feedbacks = await Promise.all([
    prisma.feedback.create({
      data: {
        userId: users[0].id,
        trackId: tracks[0].id,
        reaction: 'LIKE',
        objectiveContext: 'FOCUS',
      },
    }),
    prisma.feedback.create({
      data: {
        userId: users[1].id,
        trackId: tracks[3].id,
        reaction: 'LIKE',
        objectiveContext: 'MOOD_BOOST',
      },
    }),
    prisma.feedback.create({
      data: {
        userId: users[2].id,
        trackId: tracks[1].id,
        reaction: 'DISLIKE',
        objectiveContext: 'WORKOUT',
      },
    }),
  ]);

  console.log(`✅ ${feedbacks.length} feedbacks criados`);

  console.log('\n✨ Seed completado com sucesso!');
  console.log(`
📊 Resumo dos dados inseridos:
  • ${genres.length} Gêneros
  • ${users.length} Usuários
  • ${tracks.length} Tracks
  • ${playlists.length} Playlists
  • ${feedbacks.length} Feedbacks
  `);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
