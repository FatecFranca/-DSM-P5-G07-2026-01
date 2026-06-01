# Guia de Integração ML + Backend — Music Selector

Este arquivo explica como o backend deve consumir a parte de Machine Learning feita até agora.

## 1. Fluxo completo

```text
Mobile
↓
NestJS recebe respostas do usuário
↓
NestJS converte respostas em 7 parâmetros musicais
↓
NestJS chama FastAPI do ML
↓
FastAPI carrega model.pkl, scaler.pkla e features.pkl
↓
ML prevê a vibe
↓
NestJS recebe a vibe prevista
↓
NestJS busca no Supabase músicas com essa vibe
↓
NestJS retorna 10 músicas para o mobile
```

O ML **não retorna músicas**.  
O ML retorna apenas a **vibe prevista**.

Quem monta a playlist é o backend.

---

## 2. Arquivos já prontos do ML

```text
modelos/model.pkl
modelos/scaler.pkl
modelos/features.pkl
scripts/api_vibe.py
scripts/prever_vibe.py
data/spotify_final.csv
```

Função de cada arquivo:

```text
model.pkl
Modelo treinado com Logistic Regression.

scaler.pkl
Normalizador usado no treinamento.

features.pkl
Lista exata das 7 features esperadas pelo modelo.

api_vibe.py
API FastAPI que recebe os 7 parâmetros e retorna a vibe.

prever_vibe.py
Script local de teste.

spotify_final.csv
Dataset limpo com músicas e coluna vibe. Deve ser importado no Supabase.
```

---

## 3. Features que o ML espera

O modelo espera exatamente estes 7 campos:

```ts
danceability: number;       // 0.0 a 1.0
energy: number;             // 0.0 a 1.0
valence: number;            // 0.0 a 1.0
acousticness: number;       // 0.0 a 1.0
instrumentalness: number;   // 0.0 a 1.0
speechiness: number;        // 0.0 a 1.0
tempo: number;              // BPM
```

Exemplo:

```json
{
  "danceability": 0.8,
  "energy": 0.9,
  "valence": 0.7,
  "acousticness": 0.1,
  "instrumentalness": 0.05,
  "speechiness": 0.05,
  "tempo": 140
}
```

---

## 4. API FastAPI do ML

Rodar a API:

```bash
uvicorn scripts.api_vibe:app --reload
```

Swagger:

```text
http://localhost:8000/docs
```

Endpoint:

```http
POST http://localhost:8000/predict-vibe
```

Entrada:

```json
{
  "danceability": 0.8,
  "energy": 0.9,
  "valence": 0.7,
  "acousticness": 0.1,
  "instrumentalness": 0.05,
  "speechiness": 0.05,
  "tempo": 140
}
```

Resposta:

```json
{
  "vibe": "workout",
  "scores": {
    "workout": 0.86,
    "party": 0.12,
    "focus": 0.01
  },
  "features_used": {
    "danceability": 0.8,
    "energy": 0.9,
    "valence": 0.7,
    "acousticness": 0.1,
    "instrumentalness": 0.05,
    "speechiness": 0.05,
    "tempo": 140
  }
}
```

Vibes possíveis:

```text
focus
workout
party
relax
chill
romantic
```

---

## 5. Entrada atual do mobile/backend

O backend hoje recebe algo parecido com:

```ts
objective: "FOCUS" | "WORKOUT" | "RELAX" | "MOOD_BOOST";
mood: "HAPPY" | "NEUTRAL" | "ANXIOUS" | "SAD";
energyLevel: "LOW" | "MEDIUM" | "HIGH";
```

Essas respostas humanas precisam ser convertidas para as 7 features do ML.

---

## 6. Função para converter respostas em features

Criar no backend algo como `mapAnswersToMlFeatures.ts`:

```ts
type Objective = 'FOCUS' | 'WORKOUT' | 'RELAX' | 'MOOD_BOOST';
type Mood = 'HAPPY' | 'NEUTRAL' | 'ANXIOUS' | 'SAD';
type EnergyLevel = 'LOW' | 'MEDIUM' | 'HIGH';
type AudioPreference = 'INSTRUMENTAL' | 'VOCAL' | 'MIXED';

interface UserAnswers {
  objective: Objective;
  mood: Mood;
  energyLevel: EnergyLevel;
  audioPreference?: AudioPreference;
}

export interface MlFeatures {
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  speechiness: number;
  tempo: number;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function mapAnswersToMlFeatures(answers: UserAnswers): MlFeatures {
  const features: MlFeatures = {
    danceability: 0.5,
    energy: 0.5,
    valence: 0.5,
    acousticness: 0.5,
    instrumentalness: 0.2,
    speechiness: 0.05,
    tempo: 115,
  };

  switch (answers.objective) {
    case 'FOCUS':
      features.danceability = 0.35;
      features.energy = 0.45;
      features.valence = 0.50;
      features.acousticness = 0.55;
      features.instrumentalness = 0.70;
      features.speechiness = 0.03;
      features.tempo = 100;
      break;

    case 'WORKOUT':
      features.danceability = 0.75;
      features.energy = 0.85;
      features.valence = 0.65;
      features.acousticness = 0.15;
      features.instrumentalness = 0.10;
      features.speechiness = 0.06;
      features.tempo = 140;
      break;

    case 'RELAX':
      features.danceability = 0.30;
      features.energy = 0.25;
      features.valence = 0.45;
      features.acousticness = 0.80;
      features.instrumentalness = 0.35;
      features.speechiness = 0.03;
      features.tempo = 80;
      break;

    case 'MOOD_BOOST':
      features.danceability = 0.75;
      features.energy = 0.70;
      features.valence = 0.85;
      features.acousticness = 0.25;
      features.instrumentalness = 0.10;
      features.speechiness = 0.06;
      features.tempo = 125;
      break;
  }

  switch (answers.mood) {
    case 'HAPPY':
      features.valence += 0.15;
      features.danceability += 0.05;
      break;

    case 'NEUTRAL':
      break;

    case 'ANXIOUS':
      features.energy -= 0.15;
      features.acousticness += 0.15;
      features.tempo -= 10;
      break;

    case 'SAD':
      features.valence -= 0.25;
      features.energy -= 0.10;
      features.acousticness += 0.10;
      break;
  }

  switch (answers.energyLevel) {
    case 'LOW':
      features.energy = Math.min(features.energy, 0.35);
      features.tempo = Math.min(features.tempo, 90);
      break;

    case 'MEDIUM':
      features.energy = (features.energy + 0.55) / 2;
      features.tempo = (features.tempo + 115) / 2;
      break;

    case 'HIGH':
      features.energy = Math.max(features.energy, 0.75);
      features.tempo = Math.max(features.tempo, 135);
      features.danceability += 0.05;
      break;
  }

  switch (answers.audioPreference) {
    case 'INSTRUMENTAL':
      features.instrumentalness = Math.max(features.instrumentalness, 0.75);
      features.speechiness = Math.min(features.speechiness, 0.03);
      break;

    case 'VOCAL':
      features.instrumentalness = Math.min(features.instrumentalness, 0.10);
      features.speechiness = Math.max(features.speechiness, 0.06);
      break;

    case 'MIXED':
    default:
      features.instrumentalness = (features.instrumentalness + 0.25) / 2;
      break;
  }

  return {
    danceability: clamp01(features.danceability),
    energy: clamp01(features.energy),
    valence: clamp01(features.valence),
    acousticness: clamp01(features.acousticness),
    instrumentalness: clamp01(features.instrumentalness),
    speechiness: clamp01(features.speechiness),
    tempo: Math.max(40, features.tempo),
  };
}
```

Essa função é a ponte entre o formulário e o modelo de ML.

---

## 7. Serviço NestJS para chamar o ML

Criar ou adaptar o `MLService`:

```ts
import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { MlFeatures } from './mapAnswersToMlFeatures';

@Injectable()
export class MLService {
  private readonly mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000';

  async predictVibe(features: MlFeatures) {
    const response = await axios.post(`${this.mlApiUrl}/predict-vibe`, features);

    return response.data as {
      vibe: string;
      scores: Record<string, number>;
      features_used: MlFeatures;
    };
  }
}
```

No `.env`:

```env
ML_API_URL=http://localhost:8000
```

---

## 8. Buscar músicas pela vibe prevista

Depois de receber a vibe:

```ts
const prediction = await this.mlService.predictVibe(mlFeatures);
const predictedVibe = prediction.vibe;
```

O backend deve buscar músicas no banco:

```ts
const tracks = await this.prisma.track.findMany({
  where: {
    vibe: predictedVibe.toUpperCase(),
  },
  orderBy: {
    popularity: 'desc',
  },
  take: 50,
});
```

Depois:

```ts
const selectedTracks = tracks.slice(0, 10);
```

Também pode aplicar:

- filtro por gêneros favoritos;
- remoção de dislikes;
- ordenação por popularidade;
- criação da playlist no banco.

---

## 9. Ajuste necessário no Prisma

O model `Track` precisa ter a coluna `vibe`.

Adicionar enum:

```prisma
enum Vibe {
  FOCUS
  WORKOUT
  PARTY
  RELAX
  CHILL
  ROMANTIC

  @@map("vibe")
}
```

Adicionar no model `Track`:

```prisma
vibe Vibe
```

Adicionar índice:

```prisma
@@index([vibe])
```

Observação:

O ML retorna vibes em minúsculo:

```text
workout
```

O Prisma enum usa maiúsculo:

```text
WORKOUT
```

Então converter:

```ts
const prismaVibe = prediction.vibe.toUpperCase();
```

---

## 10. Importar o dataset no Supabase

Ainda falta armazenar a tabela limpa no Supabase.

Arquivo final:

```text
data/spotify_final.csv
```

Esse CSV deve popular a tabela `tracks`.

Mapeamento:

```text
track_id            → spotifyId
track_name          → trackName
artists             → artists
album_name          → albumName
popularity          → popularity
duration_ms         → durationMs
explicit            → explicit
danceability        → danceability
energy              → energy
key                 → key
loudness            → loudness
mode                → mode
speechiness         → speechiness
acousticness        → acousticness
instrumentalness    → instrumentalness
liveness            → liveness
valence             → valence
tempo               → tempo
time_signature      → timeSignature
track_genre         → trackGenre
vibe                → vibe
```

Antes de importar:

```text
1. Remover coluna Unnamed: 0, se existir.
2. Garantir que track_id seja único.
3. Garantir que vibe esteja preenchida.
4. Converter vibe para uppercase se usar enum Prisma.
```

---

## 11. Seed sugerido para importar CSV

Criar:

```text
prisma/seed-tracks.ts
```

Exemplo:

```ts
import { PrismaClient } from '../src/generated/prisma';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

function parseBoolean(value: any): boolean {
  return value === true || value === 'true' || value === 'True' || value === '1';
}

async function main() {
  const csvPath = path.resolve(__dirname, '../data/spotify_final.csv');
  const file = fs.readFileSync(csvPath, 'utf-8');

  const records = parse(file, {
    columns: true,
    skip_empty_lines: true,
  });

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
        vibe: row.vibe.toUpperCase(),
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
        vibe: row.vibe.toUpperCase(),
      },
    });
  }

  console.log(`Importação concluída: ${records.length} músicas processadas.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Instalar dependência:

```bash
npm install csv-parse
```

---

## 12. Fluxo final no RecommendationsService

Ordem recomendada:

```text
1. Buscar usuário com onboarding, gêneros e feedbacks.
2. Validar onboarding.
3. Converter dto + onboarding para 7 features.
4. Chamar FastAPI /predict-vibe.
5. Receber vibe prevista.
6. Buscar tracks no banco com a vibe.
7. Remover dislikes.
8. Aplicar filtro de gêneros, se necessário.
9. Ordenar por popularidade/relevância.
10. Criar playlist.
11. Retornar exatamente 10 músicas.
```

Pseudo-código:

```ts
const user = await this.prisma.user.findUnique({
  where: { id: userId },
  include: {
    genres: { include: { genre: true } },
    onboardingProfile: true,
    feedbacks: { include: { track: true } },
  },
});

const mlFeatures = mapAnswersToMlFeatures({
  objective: dto.objective,
  mood: dto.mood,
  energyLevel: dto.energyLevel,
  audioPreference: user.onboardingProfile?.audioPreference ?? 'MIXED',
});

const prediction = await this.mlService.predictVibe(mlFeatures);

const predictedVibe = prediction.vibe.toUpperCase();

const dislikedTrackIds = await this.feedbackService.getUserDislikes(
  userId,
  dto.objective,
);

const tracks = await this.prisma.track.findMany({
  where: {
    vibe: predictedVibe,
    id: {
      notIn: dislikedTrackIds,
    },
  },
  orderBy: {
    popularity: 'desc',
  },
  take: 50,
});

const selectedTracks = tracks.slice(0, 10);
```

---

## 13. Resumo do que falta implementar

Backend:

```text
1. Adicionar vibe no Prisma Track.
2. Rodar migration.
3. Importar data/spotify_final.csv no Supabase.
4. Criar mapAnswersToMlFeatures().
5. Criar chamada HTTP para FastAPI /predict-vibe.
6. Usar vibe prevista para buscar músicas.
7. Retornar playlist com 10 faixas.
```

ML já pronto:

```text
1. Dataset limpo com vibe.
2. Modelo treinado.
3. Scaler salvo.
4. Features salvas.
5. FastAPI pronta.
```

---

## 14. Exemplo ponta a ponta

Mobile envia para NestJS:

```json
{
  "objective": "WORKOUT",
  "mood": "HAPPY",
  "energyLevel": "HIGH"
}
```

NestJS converte para:

```json
{
  "danceability": 0.8,
  "energy": 0.9,
  "valence": 0.8,
  "acousticness": 0.1,
  "instrumentalness": 0.05,
  "speechiness": 0.06,
  "tempo": 140
}
```

NestJS chama:

```http
POST http://localhost:8000/predict-vibe
```

FastAPI retorna:

```json
{
  "vibe": "workout"
}
```

NestJS consulta:

```sql
SELECT *
FROM tracks
WHERE vibe = 'WORKOUT'
ORDER BY popularity DESC
LIMIT 10;
```

NestJS retorna a playlist para o mobile.
