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

const STYLES = ['Trabalho/Estudo', 'Treino', 'Relax', 'Variado'];

export default function Step2ListeningScreen() {
  const { setListeningStyle } = useOnboardingStore();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    setListeningStyle(selected);
    router.push('/(onboarding)/step-3-format');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Barra de progresso */}
        <View style={styles.progressBar}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.progressSegmentWrapper}>
              {s <= 2 ? (
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

        {/* Header */}
        <Text style={styles.title}>Estilo de escuta</Text>
        <Text style={styles.subtitle}>Como é o seu dia a dia com a música?</Text>

        {/* Cards de estilo */}
        <View style={styles.grid}>
          {STYLES.map((style) => {
            const isSelected = selected === style;
            return (
              <Pressable
                key={style}
                onPress={() => setSelected(style)}
                style={({ pressed }) => [
                  styles.card,
                  isSelected && styles.cardSelected,
                  pressed && styles.pressed,
                ]}
              >
                {isSelected && (
                  <LinearGradient
                    colors={['rgba(124,58,237,0.20)', 'rgba(34,211,238,0.20)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <Text style={[styles.cardText, isSelected && styles.cardTextSelected]}>
                  {style}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Botão continuar */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.btnPrimary,
              !selected && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={handleContinue}
            disabled={!selected}
          >
            <LinearGradient
              colors={selected ? [colors.primary, colors.secondary] : ['#333', '#333']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Text style={styles.btnText}>Continuar</Text>
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
    backgroundColor: 'rgba(255,255,255,0.10)',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    flex: 1,
  },
  card: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.secondary,
  },
  cardText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cardTextSelected: {
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
  pressed: {
    opacity: 0.8,
  },
});