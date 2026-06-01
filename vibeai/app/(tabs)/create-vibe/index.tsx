import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, fontSize } from '@/constants/theme';
import { useVibeStore } from '@/store/vibeStore';

const OBJECTIVES = [
  { id: 'focus', label: 'Estudar/Foco', desc: 'Prioriza instrumental', emoji: '🧠' },
  { id: 'workout', label: 'Treinar/Exercício', desc: 'Prioriza beats intensos', emoji: '⚡' },
  { id: 'relax', label: 'Relaxar/Dormir', desc: 'Prioriza acústico', emoji: '🌙' },
  { id: 'mood', label: 'Melhorar o humor', desc: 'Prioriza energia', emoji: '😊' },
];

const MOODS = [
  { id: 'happy', label: 'Feliz/Animado', emoji: '😄' },
  { id: 'neutral', label: 'Neutro', emoji: '😐' },
  { id: 'anxious', label: 'Ansioso/Tenso', emoji: '😰' },
  { id: 'sad', label: 'Melancólico/Triste', emoji: '😔' },
];

const ENERGY_LEVELS = [
  { id: 'low', label: 'Baixo', range: '0.0 – 0.33', color: colors.secondary },
  { id: 'medium', label: 'Médio', range: '0.34 – 0.66', color: colors.primary },
  { id: 'high', label: 'Alto', range: '0.67 – 1.0', color: colors.accent },
];

export default function CreateVibeScreen() {
  const { setVibeRequest } = useVibeStore();
  const [step, setStep] = useState(1);
  const [objective, setObjective] = useState('');
  const [energy, setEnergy] = useState('');
  const [mood, setMood] = useState('');
  const [generating, setGenerating] = useState(false);

  const isStepValid = () => {
    if (step === 1) return !!objective;
    if (step === 2) return !!energy;
    if (step === 3) return !!mood;
    return false;
  };

  const handleGenerate = () => {
    setGenerating(true);
    setVibeRequest({ objective, energyLevel: energy, mood });
    // chamada de API entra aqui futuramente
    setTimeout(() => {
      setGenerating(false);
      router.push('/vibe/generated');
    }, 2000);
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleGenerate();
  };

  if (generating) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingEmoji}>🧠</Text>
        </View>
        <Text style={styles.loadingTitle}>A IA está criando sua Vibe</Text>
        <Text style={styles.loadingSubtitle}>
          Analisando {OBJECTIVES.find(o => o.id === objective)?.label} e{' '}
          {MOODS.find(m => m.id === mood)?.label}...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Barra de progresso */}
        <View style={styles.progressBar}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.progressSegmentWrapper}>
              {s <= step ? (
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressSegment}
                />
              ) : (
                <View style={[styles.progressSegment, styles.progressInactive]} />
              )}
            </View>
          ))}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Step 1 — Objetivo */}
          {step === 1 && (
            <View>
              <Text style={styles.title}>Qual seu objetivo?</Text>
              <Text style={styles.subtitle}>O que você vai fazer agora?</Text>

              <View style={styles.optionList}>
                {OBJECTIVES.map((obj) => {
                  const isSelected = objective === obj.id;
                  return (
                    <Pressable
                      key={obj.id}
                      onPress={() => setObjective(obj.id)}
                      style={({ pressed }) => [
                        styles.objectiveCard,
                        isSelected && styles.objectiveCardSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={[styles.objectiveIcon, isSelected && styles.objectiveIconSelected]}>
                        <Text style={styles.objectiveEmoji}>{obj.emoji}</Text>
                      </View>
                      <View style={styles.objectiveInfo}>
                        <Text style={[styles.objectiveLabel, isSelected && styles.textSelected]}>
                          {obj.label}
                        </Text>
                        <Text style={styles.objectiveDesc}>{obj.desc}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Step 2 — Energia */}
          {step === 2 && (
            <View>
              <Text style={styles.title}>Nível de Energia</Text>
              <Text style={styles.subtitle}>Quanta intensidade você quer?</Text>

              <View style={styles.energyCard}>
                {ENERGY_LEVELS.map((level) => {
                  const isSelected = energy === level.id;
                  return (
                    <Pressable
                      key={level.id}
                      onPress={() => setEnergy(level.id)}
                      style={({ pressed }) => [
                        styles.energyOption,
                        isSelected && { borderColor: level.color, backgroundColor: `${level.color}15` },
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={[styles.energyDot, { backgroundColor: level.color }, !isSelected && styles.energyDotInactive]} />
                      <View>
                        <Text style={[styles.energyLabel, isSelected && { color: level.color }]}>
                          {level.label}
                        </Text>
                        <Text style={styles.energyRange}>{level.range}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Step 3 — Humor */}
          {step === 3 && (
            <View>
              <Text style={styles.title}>Como você se sente?</Text>
              <Text style={styles.subtitle}>Seu humor atual molda a recomendação.</Text>

              <View style={styles.moodGrid}>
                {MOODS.map((m) => {
                  const isSelected = mood === m.id;
                  return (
                    <Pressable
                      key={m.id}
                      onPress={() => setMood(m.id)}
                      style={({ pressed }) => [
                        styles.moodCard,
                        isSelected && styles.moodCardSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.moodEmoji}>{m.emoji}</Text>
                      <Text style={[styles.moodLabel, isSelected && styles.textSelected]}>
                        {m.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Botões de navegação */}
        <View style={styles.footer}>
          {step > 1 && (
            <Pressable
              style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
              onPress={() => setStep(step - 1)}
            >
              <Text style={styles.btnSecondaryText}>Voltar</Text>
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.btnPrimary,
              step > 1 && styles.btnPrimaryFlex,
              !isStepValid() && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={handleNext}
            disabled={!isStepValid()}
          >
            <LinearGradient
              colors={isStepValid() ? [colors.primary, colors.secondary] : ['#333', '#333']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Text style={styles.btnText}>
                {step < 3 ? 'Avançar' : 'Gerar Minha Vibe'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  progressBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  progressSegmentWrapper: {
    flex: 1,
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: radius.full,
  },
  progressInactive: {
    backgroundColor: colors.surface,
  },
  scroll: {
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },

  // Step 1
  optionList: {
    gap: spacing.md,
  },
  objectiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: colors.surface,
  },
  objectiveCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(124,58,237,0.10)',
  },
  objectiveIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  objectiveIconSelected: {
    backgroundColor: colors.primary,
  },
  objectiveEmoji: {
    fontSize: 22,
  },
  objectiveInfo: {
    flex: 1,
  },
  objectiveLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  objectiveDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  textSelected: {
    color: colors.textPrimary,
  },

  // Step 2
  energyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: spacing.md,
    gap: spacing.sm,
  },
  energyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  energyDot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
  },
  energyDotInactive: {
    opacity: 0.3,
  },
  energyLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  energyRange: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Step 3
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  moodCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  moodCardSelected: {
    borderColor: colors.secondary,
    backgroundColor: 'rgba(34,211,238,0.10)',
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  btnPrimary: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  btnPrimaryFlex: {
    flex: 1,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  btnText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  btnSecondary: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
  },
  btnSecondaryText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingSpinner: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  loadingEmoji: {
    position: 'absolute',
    fontSize: 32,
  },
  loadingTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.8,
  },
});