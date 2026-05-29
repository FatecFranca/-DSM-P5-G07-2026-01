// app/(auth)/forgot-password.tsx
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, fontSize } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'E-mail obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'E-mail inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!code.trim()) newErrors.code = 'Código obrigatório';
    if (newPassword.length < 8 || !/\d/.test(newPassword)) {
      newErrors.newPassword = 'Mínimo 8 caracteres e 1 número';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = () => {
    if (validateStep1()) {
      // chamada de API entra aqui futuramente
      setStep(2);
    }
  };

  const handleResetPassword = () => {
    if (validateStep2()) {
      // chamada de API entra aqui futuramente
      router.replace('/(auth)/login');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Botão voltar */}
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>

          {step === 1 ? (
            <>
              {/* Header step 1 */}
              <View style={styles.header}>
                <Text style={styles.title}>Esqueci minha senha</Text>
                <Text style={styles.subtitle}>Enviaremos um código para o seu e-mail.</Text>
              </View>

              {/* Formulário step 1 */}
              <View style={styles.form}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>E-mail</Text>
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="seu@email.com"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
                onPress={handleSendCode}
              >
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.btnGradient}
                >
                  <Text style={styles.btnText}>Enviar código</Text>
                </LinearGradient>
              </Pressable>
            </>
          ) : (
            <>
              {/* Ícone sucesso */}
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Text style={styles.successEmoji}>✓</Text>
                </View>
                <Text style={styles.title}>Código enviado!</Text>
                <Text style={styles.subtitle}>
                  Insira o código que enviamos para {email || 'seu e-mail'}.
                </Text>
              </View>

              {/* Formulário step 2 */}
              <View style={styles.form}>

                {/* Código */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Código</Text>
                  <TextInput
                    style={[styles.input, styles.codeInput, errors.code && styles.inputError]}
                    placeholder="000000"
                    placeholderTextColor={colors.textSecondary}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="numeric"
                    maxLength={6}
                    textAlign="center"
                  />
                  {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
                </View>

                {/* Nova senha */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Nova Senha</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[styles.input, styles.inputWithAction, errors.newPassword && styles.inputError]}
                      placeholder="••••••••"
                      placeholderTextColor={colors.textSecondary}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <Pressable
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                    </Pressable>
                  </View>
                  {errors.newPassword
                    ? <Text style={styles.errorText}>{errors.newPassword}</Text>
                    : <Text style={styles.hint}>Mínimo 8 caracteres e 1 número.</Text>
                  }
                </View>

              </View>

              <Pressable
                style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
                onPress={handleResetPassword}
              >
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.btnGradient}
                >
                  <Text style={styles.btnText}>Redefinir Senha</Text>
                </LinearGradient>
              </Pressable>
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  successContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: 'rgba(34,197,94,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  successEmoji: {
    fontSize: 28,
    color: colors.success,
    fontWeight: '700',
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inputError: {
    borderColor: colors.danger,
  },
  codeInput: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    letterSpacing: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputWithAction: {
    paddingRight: spacing.xxl + spacing.md,
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: 16,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.danger,
  },
  btnPrimary: {
    width: '100%',
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.xl,
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