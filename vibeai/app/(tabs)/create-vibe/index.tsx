import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/constants/theme';
import { useVibeStore } from '@/store/vibeStore';

type ObjectiveIconName = 'focus' | 'energy' | 'calm' | 'mood';

const OBJECTIVES: Array<{ id: string; label: string; icon: ObjectiveIconName }> = [
  { id: 'focus', label: 'Me ajudar a focar', icon: 'focus' },
  { id: 'workout', label: 'Me dar energia', icon: 'energy' },
  { id: 'relax', label: 'Me acalmar', icon: 'calm' },
  { id: 'mood', label: 'Melhorar meu humor', icon: 'mood' },
];

const MOODS = [
  { id: 'happy', label: 'Feliz/Animado' },
  { id: 'neutral', label: 'Neutro' },
  { id: 'anxious', label: 'Ansioso/Tenso' },
  { id: 'sad', label: 'Melancólico/Triste' },
];

const ENERGY_LEVELS = [
  { id: 'low', label: 'Baixa', color: colors.secondary },
  { id: 'medium', label: 'Média', color: colors.primary },
  { id: 'high', label: 'Alta', color: colors.accent },
];

export default function CreateVibeScreen() {
  const { setVibeRequest } = useVibeStore();
  const [step, setStep] = useState(1);
  const [objective, setObjective] = useState('');
  const [energy, setEnergy] = useState('');
  const [mood, setMood] = useState('');
  const [generating, setGenerating] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!generating) {
      spinValue.stopAnimation();
      spinValue.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      })
    );

    animation.start();
    return () => animation.stop();
  }, [generating, spinValue]);

  const isStepValid = () => {
    if (step === 1) return !!objective;
    if (step === 2) return !!mood;
    if (step === 3) return !!energy;
    return false;
  };

  const handleGenerate = () => {
    setGenerating(true);
    setVibeRequest({ objective, energyLevel: energy, mood });
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
    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingRing}>
          <Animated.View style={[styles.loadingArc, { transform: [{ rotate: spin }] }]} />
          <View style={styles.loadingIcon}>
            <AiIcon />
          </View>
        </View>
        <Text style={styles.loadingTitle}>A IA está criando sua vibe...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.progressBar}>
          {[1, 2, 3].map((segment) => (
            <View key={segment} style={styles.progressSegmentWrapper}>
              {segment <= step ? (
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
          {step === 1 && (
            <View>
              <Text style={styles.title}>O que você quer que a música faça por você agora?</Text>
              <Text style={styles.subtitle}>Objetivo da Música</Text>

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
                        <ObjectiveIcon name={obj.icon} selected={isSelected} />
                      </View>
                      <Text style={[styles.objectiveLabel, isSelected && styles.textSelected]}>
                        {obj.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.title}>Como você está se sentindo agora?</Text>
              <Text style={styles.subtitle}>Seu humor atual molda a recomendação.</Text>

              <View style={styles.moodGrid}>
                {MOODS.map((item) => {
                  const isSelected = mood === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setMood(item.id)}
                      style={({ pressed }) => [
                        styles.moodCard,
                        isSelected && styles.moodCardSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <MoodIcon mood={item.id} selected={isSelected} />
                      <Text style={[styles.moodLabel, isSelected && styles.textSelected]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={styles.title}>Qual energia você quer para a playlist?</Text>
              <Text style={styles.subtitle}>Intensidade da Música</Text>

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
                      <View style={[
                        styles.energyIcon,
                        isSelected && { backgroundColor: level.color },
                      ]}>
                        <EnergyIcon level={level.id} selected={isSelected} />
                      </View>
                      <Text style={[styles.energyLabel, isSelected && { color: colors.textPrimary }]}>
                        {level.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

        </ScrollView>

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
              colors={isStepValid() ? [colors.primary, colors.secondary] : ['#333842', '#333842']}
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

function ObjectiveIcon({ name, selected }: { name: ObjectiveIconName; selected: boolean }) {
  const stroke = selected ? colors.textPrimary : colors.textSecondary;

  if (name === 'focus') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={3} stroke={stroke} strokeWidth={2} />
        <Path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Path d="M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === 'energy') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
      </Svg>
    );
  }

  if (name === 'calm') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M19 14.5A7.5 7.5 0 119.5 5 6.5 6.5 0 0019 14.5z" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={stroke} strokeWidth={2} />
      <Path d="M8 14s1.2 2 4 2 4-2 4-2M9 10h.01M15 10h.01" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function EnergyIcon({ level, selected }: { level: string; selected: boolean }) {
  const stroke = selected ? colors.textPrimary : colors.textSecondary;

  if (level === 'low') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d="M5 14c2.5-3 4.5-3 7 0s4.5 3 7 0" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  if (level === 'medium') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d="M4 16h3l2-6 4 10 3-8h4" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

function MoodIcon({ mood, selected }: { mood: string; selected: boolean }) {
  const stroke = selected ? colors.textPrimary : colors.textSecondary;

  if (mood === 'happy') {
    return (
      <Svg width={34} height={34} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={9} stroke={stroke} strokeWidth={1.8} />
        <Path d="M8.5 10h.01M15.5 10h.01M8 14c1 1.5 2.3 2.2 4 2.2s3-.7 4-2.2" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    );
  }

  if (mood === 'neutral') {
    return (
      <Svg width={34} height={34} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={9} stroke={stroke} strokeWidth={1.8} />
        <Path d="M8.5 10h.01M15.5 10h.01M8.5 15h7" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    );
  }

  if (mood === 'anxious') {
    return (
      <Svg width={34} height={34} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={9} stroke={stroke} strokeWidth={1.8} />
        <Path d="M8.5 11h.01M15.5 11h.01" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M8 8.3c1-.8 2-.8 3 0M13 8.3c1-.8 2-.8 3 0" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M9 16c.8-.7 1.8-1.1 3-1.1s2.2.4 3 1.1" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    );
  }

  return (
    <Svg width={34} height={34} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={stroke} strokeWidth={1.8} />
      <Path d="M8.5 10.5h.01M15.5 10.5h.01" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M8.5 16.5c.9-1.1 2-1.7 3.5-1.7s2.6.6 3.5 1.7" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M17 12.5c.9 1.1 1.3 1.9 1.3 2.6a1.3 1.3 0 01-2.6 0c0-.7.4-1.5 1.3-2.6z" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" />
    </Svg>
  );
}

function AiIcon() {
  return (
    <Svg width={34} height={34} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3l1.25 4.25L17.5 8.5l-4.25 1.25L12 14l-1.25-4.25L6.5 8.5l4.25-1.25L12 3z"
        stroke={colors.secondary}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 13l.75 2.25L21 16l-2.25.75L18 19l-.75-2.25L15 16l2.25-.75L18 13zM6 14l.55 1.45L8 16l-1.45.55L6 18l-.55-1.45L4 16l1.45-.55L6 14z"
        stroke={colors.secondary}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 36,
  },
  progressSegmentWrapper: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 999,
  },
  progressInactive: {
    backgroundColor: colors.surface,
  },
  scroll: {
    paddingBottom: 32,
  },
  title: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 29,
    lineHeight: 35,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    lineHeight: 25,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  optionList: {
    gap: 16,
  },
  objectiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 82,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: colors.surface,
  },
  objectiveCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(124,58,237,0.16)',
  },
  objectiveIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  objectiveIconSelected: {
    backgroundColor: colors.primary,
  },
  objectiveLabel: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  textSelected: {
    color: colors.textPrimary,
  },
  energyCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    gap: 10,
  },
  energyOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 120,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  energyIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  moodCard: {
    width: '47.5%',
    height: 118,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  moodCardSelected: {
    borderColor: colors.secondary,
    backgroundColor: 'rgba(34,211,238,0.10)',
  },
  moodLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    lineHeight: 21,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 24,
    paddingTop: 16,
  },
  btnPrimary: {
    flex: 1,
    borderRadius: 999,
    overflow: 'hidden',
  },
  btnPrimaryFlex: {
    flex: 1,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  btnText: {
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
  },
  btnSecondary: {
    paddingHorizontal: 24,
    height: 56,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
  },
  btnSecondaryText: {
    color: colors.primary,
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  loadingArc: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: 'rgba(124,58,237,0.20)',
    borderTopColor: colors.primary,
    borderRightColor: colors.secondary,
  },
  loadingIcon: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 25,
    lineHeight: 32,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
