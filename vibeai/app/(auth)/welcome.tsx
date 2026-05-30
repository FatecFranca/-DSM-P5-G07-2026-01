import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, fontSize } from '@/constants/theme';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>

      {/* Gradiente topo */}
      <LinearGradient
        colors={['rgba(124,58,237,0.20)', 'transparent']}
        style={styles.gradientTop}
      />

      {/* Brilho ciano top-right */}
      <View style={styles.glowCyan} />

      {/* Brilho rosa bottom-left */}
      <View style={styles.glowPink} />

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
              <Text style={styles.logoIcon}>♪</Text>
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
    height: '66%',
  },
  glowCyan: {
    position: 'absolute',
    top: -128,
    right: -128,
    width: 384,
    height: 384,
    borderRadius: 192,
    backgroundColor: 'rgba(34,211,238,0.20)',
    // blur não existe no RN nativo — simulamos com opacidade e tamanho
  },
  glowPink: {
    position: 'absolute',
    bottom: -128,
    left: -128,
    width: 384,
    height: 384,
    borderRadius: 192,
    backgroundColor: 'rgba(244,114,182,0.20)',
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
    marginBottom: spacing.lg,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 32,
    color: colors.textPrimary,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  buttons: {
    width: '100%',
    gap: spacing.md,
  },
  btnPrimary: {
    width: '100%',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  btnGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  btnPrimaryText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  btnSecondary: {
    width: '100%',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});