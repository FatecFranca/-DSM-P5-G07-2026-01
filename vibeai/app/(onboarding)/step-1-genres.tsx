import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, fontSize } from '@/constants/theme';
import { useOnboardingStore } from '@/store/onboardingStore';

const GENRES = [
  'Pop', 'Rock', 'Hip-Hop', 'Eletrônica', 'Indie',
  'Jazz', 'R&B', 'Clássica', 'K-Pop', 'Sertanejo', 'Funk',
];

export default function Step1GenresScreen() {
  const { setGenres } = useOnboardingStore();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const handleToggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(prev => prev.filter(g => g !== genre));
    } else if (selectedGenres.length < 5) {
      setSelectedGenres(prev => [...prev, genre]);
    }
  };

  const handleContinue = () => {
    setGenres(selectedGenres);
    router.push('/(onboarding)/step-2-listening');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Barra de progresso */}
        <View style={styles.progressBar}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.progressSegmentWrapper}>
              {s <= 1 ? (
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
          {/* Header */}
          <Text style={styles.title}>Gêneros favoritos</Text>
          <Text style={styles.subtitle}>Escolha de 1 a 5 estilos musicais.</Text>
          <Text style={styles.counter}>
            {selectedGenres.length}/5 selecionados
          </Text>

          {/* Chips de gênero */}
          <View style={styles.chipsContainer}>
            {GENRES.map((genre) => {
              const isSelected = selectedGenres.includes(genre);
              return (
                <Pressable
                  key={genre}
                  onPress={() => handleToggle(genre)}
                  style={({ pressed }) => [
                    styles.chip,
                    isSelected && styles.chipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {genre}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Botão continuar */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.btnPrimary,
              selectedGenres.length === 0 && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={handleContinue}
            disabled={selectedGenres.length === 0}
          >
            <LinearGradient
              colors={selectedGenres.length > 0
                ? [colors.primary, colors.secondary]
                : ['#333', '#333']
              }
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
    marginBottom: spacing.md,
  },
  counter: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.secondary,
    marginBottom: spacing.lg,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  chipTextSelected: {
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
    borderRadius: radius.md,
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