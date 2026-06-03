import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import { useFonts, Inter_400Regular, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { colors, spacing, radius, fontSize } from '@/constants/theme';

function VibeIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="white">
      <Path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 14.5c-2.485 0-4.5-2.015-4.5-4.5S9.515 7.5 12 7.5s4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5zm0-7a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
    </Svg>
  );
}

export default function WelcomeScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>

      {/* Gradiente topo */}
      <LinearGradient
        colors={['rgba(124,58,237,0.35)', 'transparent']}
        style={styles.gradientTop}
      />

      {/* Brilho ciano top-right com blur */}
      <BlurView intensity={80} style={styles.glowCyan} />
      <View style={styles.glowCyanCore} />

      {/* Brilho rosa bottom-left com blur */}
      <BlurView intensity={80} style={styles.glowPink} />
      <View style={styles.glowPinkCore} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>

          {/* Logo */}
          <View style={styles.logoWrapper}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoBox}
            >
              <VibeIcon />
            </LinearGradient>
          </View>

          {/* Título */}
          <Text style={styles.title}>Descubra sua Vibe</Text>

          {/* Subtítulo */}
          <Text style={styles.subtitle}>
            O primeiro streaming inteligente guiado pelo seu humor e contexto.
          </Text>

          {/* Botões */}
          <View style={styles.buttons}>

            <Pressable
              style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
              onPress={() => router.push('/(auth)/login')}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                <Text style={styles.btnPrimaryText}>Entrar</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.btnSecondaryText}>Criar conta</Text>
            </Pressable>

          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  glowCyan: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 360,
    height: 360,
    borderRadius: 180,
    overflow: 'hidden',
  },
  glowCyanCore: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(34,211,238,0.22)',
  },
  glowPink: {
    position: 'absolute',
    bottom: -120,
    left: -120,
    width: 360,
    height: 360,
    borderRadius: 180,
    overflow: 'hidden',
  },
  glowPinkCore: {
    position: 'absolute',
    bottom: -120,
    left: -120,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(244,114,182,0.18)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  logoWrapper: {
    marginBottom: spacing.xl,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
    maxWidth: 280,
  },
  buttons: {
    width: '100%',
    gap: spacing.md,
  },
  btnPrimary: {
    width: '100%',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  btnGradient: {
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    borderRadius: radius.full,
  },
  btnPrimaryText: {
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
    fontSize: fontSize.md,
  },
  btnSecondary: {
    width: '100%',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.5)',
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    backgroundColor: 'rgba(124,58,237,0.08)',
  },
  btnSecondaryText: {
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
    fontSize: fontSize.md,
  },
  pressed: {
    opacity: 0.8,
  },
});