import { EnergyLevelType, MoodType,  } from '../dto/get-recommendations.dto';

type AudioPreference = 'INSTRUMENTAL' | 'VOCAL' | 'MIXED';

export interface UserAnswers {
  
  mood: MoodType;
  energyLevel: EnergyLevelType;
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

  

  switch (answers.mood) {
    case MoodType.HAPPY:
      features.valence += 0.15;
      features.danceability += 0.05;
      break;

    case MoodType.NEUTRAL:
      break;

    case MoodType.ANXIOUS:
      features.energy -= 0.15;
      features.acousticness += 0.15;
      features.tempo -= 10;
      break;

    case MoodType.SAD:
      features.valence -= 0.25;
      features.energy -= 0.1;
      features.acousticness += 0.1;
      break;
  }

  switch (answers.energyLevel) {
    case EnergyLevelType.LOW:
      features.energy = Math.min(features.energy, 0.35);
      features.tempo = Math.min(features.tempo, 90);
      break;

    case EnergyLevelType.MEDIUM:
      features.energy = (features.energy + 0.55) / 2;
      features.tempo = (features.tempo + 115) / 2;
      break;

    case EnergyLevelType.HIGH:
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
      features.instrumentalness = Math.min(features.instrumentalness, 0.1);
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
