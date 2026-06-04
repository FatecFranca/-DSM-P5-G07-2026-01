import {
  EnergyLevelType,
  MoodType,
  ObjectiveType,
} from '../dto/get-recommendations.dto';

export interface UserAnswers {
  objective: ObjectiveType;
  mood: MoodType;
  energyLevel: EnergyLevelType;
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

  /**
   * 1. OBJETIVO
   * O objective define a base principal da playlist.
   */
  switch (answers.objective) {
    case ObjectiveType.FOCUS:
      features.danceability = 0.35;
      features.energy = 0.4;
      features.valence = 0.5;
      features.acousticness = 0.55;
      features.instrumentalness = 0.7;
      features.speechiness = 0.03;
      features.tempo = 95;
      break;

    case ObjectiveType.WORKOUT:
      features.danceability = 0.78;
      features.energy = 0.88;
      features.valence = 0.65;
      features.acousticness = 0.12;
      features.instrumentalness = 0.08;
      features.speechiness = 0.06;
      features.tempo = 140;
      break;

    case ObjectiveType.RELAX:
      features.danceability = 0.3;
      features.energy = 0.25;
      features.valence = 0.45;
      features.acousticness = 0.82;
      features.instrumentalness = 0.35;
      features.speechiness = 0.03;
      features.tempo = 80;
      break;

    case ObjectiveType.MOOD_BOOST:
      features.danceability = 0.75;
      features.energy = 0.7;
      features.valence = 0.85;
      features.acousticness = 0.25;
      features.instrumentalness = 0.08;
      features.speechiness = 0.06;
      features.tempo = 125;
      break;
  }

  /**
   * 2. HUMOR
   * Ajusta a base sem destruir o objetivo principal.
   */
  switch (answers.mood) {
    case MoodType.HAPPY:
      features.valence += 0.15;
      features.danceability += 0.05;
      break;

    case MoodType.NEUTRAL:
      break;

    case MoodType.ANXIOUS:
      features.energy -= 0.1;
      features.acousticness += 0.15;
      features.tempo -= 8;
      features.valence -= 0.05;
      break;

    case MoodType.SAD:
      features.valence -= 0.25;
      features.energy -= 0.1;
      features.acousticness += 0.1;
      features.tempo -= 5;
      break;
  }

  /**
   * 3. ENERGIA DESEJADA
   * O energyLevel ajusta dentro do contexto do objective.
   * Assim, RELAX + HIGH não vira automaticamente WORKOUT.
   */
  switch (answers.objective) {
    case ObjectiveType.RELAX:
      switch (answers.energyLevel) {
        case EnergyLevelType.LOW:
          features.energy = 0.2;
          features.tempo = 75;
          features.danceability = 0.25;
          break;

        case EnergyLevelType.MEDIUM:
          features.energy = 0.35;
          features.tempo = 90;
          features.danceability = 0.35;
          break;

        case EnergyLevelType.HIGH:
          features.energy = 0.5;
          features.tempo = 105;
          features.danceability = 0.45;
          break;
      }
      break;

    case ObjectiveType.FOCUS:
      switch (answers.energyLevel) {
        case EnergyLevelType.LOW:
          features.energy = 0.3;
          features.tempo = 85;
          features.danceability = 0.3;
          break;

        case EnergyLevelType.MEDIUM:
          features.energy = 0.45;
          features.tempo = 100;
          features.danceability = 0.35;
          break;

        case EnergyLevelType.HIGH:
          features.energy = 0.58;
          features.tempo = 115;
          features.danceability = 0.45;
          break;
      }
      break;

    case ObjectiveType.WORKOUT:
      switch (answers.energyLevel) {
        case EnergyLevelType.LOW:
          features.energy = 0.65;
          features.tempo = 120;
          features.danceability = 0.65;
          break;

        case EnergyLevelType.MEDIUM:
          features.energy = 0.78;
          features.tempo = 132;
          features.danceability = 0.72;
          break;

        case EnergyLevelType.HIGH:
          features.energy = 0.9;
          features.tempo = 145;
          features.danceability = 0.82;
          break;
      }
      break;

    case ObjectiveType.MOOD_BOOST:
      switch (answers.energyLevel) {
        case EnergyLevelType.LOW:
          features.energy = 0.45;
          features.tempo = 100;
          features.danceability = 0.55;
          break;

        case EnergyLevelType.MEDIUM:
          features.energy = 0.62;
          features.tempo = 118;
          features.danceability = 0.68;
          break;

        case EnergyLevelType.HIGH:
          features.energy = 0.78;
          features.tempo = 130;
          features.danceability = 0.78;
          break;
      }
      break;
  }

  /**
   * 4. AJUSTES FINAIS POR OBJETIVO
   * Garante que o objetivo continue predominando.
   */
  switch (answers.objective) {
    case ObjectiveType.RELAX:
      features.acousticness = Math.max(features.acousticness, 0.7);
      features.instrumentalness = Math.max(features.instrumentalness, 0.25);
      features.speechiness = Math.min(features.speechiness, 0.04);
      break;

    case ObjectiveType.FOCUS:
      features.instrumentalness = Math.max(features.instrumentalness, 0.65);
      features.speechiness = Math.min(features.speechiness, 0.04);
      features.acousticness = Math.max(features.acousticness, 0.45);
      break;

    case ObjectiveType.WORKOUT:
      features.acousticness = Math.min(features.acousticness, 0.2);
      features.instrumentalness = Math.min(features.instrumentalness, 0.15);
      break;

    case ObjectiveType.MOOD_BOOST:
      features.valence = Math.max(features.valence, 0.7);
      features.danceability = Math.max(features.danceability, 0.65);
      break;
  }

  return {
    danceability: clamp01(features.danceability),
    energy: clamp01(features.energy),
    valence: clamp01(features.valence),
    acousticness: clamp01(features.acousticness),
    instrumentalness: clamp01(features.instrumentalness),
    speechiness: clamp01(features.speechiness),
    tempo: Math.max(40, Math.round(features.tempo)),
  };
}