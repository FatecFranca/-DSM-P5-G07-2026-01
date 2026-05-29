import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, fontSize } from '@/constants/theme';
import { useOnboardingStore } from '@/store/onboardingStore';

const VOCAL_OPTIONS = ['Instrumental', 'Misto', 'Com vocal'];

export default function Step3FormatScreen() {
  const { setVocalPreference, completeOnboarding } = useOnboardingStore();
  const [selected, setSelected] = useState('Misto');

  const handleFinish = () => {
    setVocalPreference(selected);
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Barra de progresso */}
        <View style={styles.progressBar}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.progressSegmentWrapper}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressSegment}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <Text style={styles.title}>Preferência vocal</Text>
        <Text style={styles.subtitle}>O que você prefere ouvir?</Text>

        {/* Opções de rádio */}
        <View style={styles.options}>
          {VOCAL_OPTIONS.map((option) => {
            const isSelected = selected === option;
            return (
              <Pressable
                key={option}
                onPress={() => setSelected(option)}
                style={({ pressed }) => [
                  styles.optionRow,
                  isSelected && styles.optionRowSelected,
                  pressed && styles.pressed,
                ]}
              >
                {/* Radio button */}
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Botão finalizar */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
            onPress={handleFinish}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Text style={styles.btnText}>Finalizar e ir para Home</Text>
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
  options: {
    flex: 1,
    gap: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  optionRowSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(124,58,237,0.10)',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
  },
  optionText: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: colors.textPrimary,
  },
  footer: {
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  btnPrimary: {
    width: '100%',
    borderRadius: radius.md,
    overflow: 'hidden',
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
  pressed: {
    opacity: 0.8,
  },
});