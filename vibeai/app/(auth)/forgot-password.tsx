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
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    if (!errors[field]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'E-mail obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email.trim())) newErrors.email = 'Informe um e-mail válido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!code.trim()) newErrors.code = 'Código obrigatório';
    if (newPassword.length < 8 || !/[A-Za-zÀ-ÿ]/.test(newPassword) || !/\d/.test(newPassword)) {
      newErrors.newPassword = 'Mínimo 8 caracteres, 1 letra e 1 número';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = () => {
    if (validateStep1()) {
      setErrors({});
      setStep(2);
    }
  };

  const handleResetPassword = () => {
    if (validateStep2()) {
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
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => (step === 2 ? setStep(1) : router.back())}
          >
            <BackIcon />
          </Pressable>

          {step === 1 ? (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Esqueci minha senha</Text>
                <Text style={styles.subtitle}>Caso o e-mail exista, enviaremos um código de recuperação.</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>E-mail</Text>
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="seu@email.com"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      clearError('email');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>
              </View>

              <PrimaryButton label="Enviar código" onPress={handleSendCode} />
            </>
          ) : (
            <>
              <View style={styles.header}>
                <View style={styles.successIcon}>
                  <CheckIcon />
                </View>
                <Text style={styles.title}>Verifique seu e-mail</Text>
                <Text style={styles.subtitle}>
                  Caso o e-mail informado exista, você receberá um código para redefinir sua senha.
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Código</Text>
                  <TextInput
                    style={[styles.input, styles.codeInput, errors.code && styles.inputError]}
                    placeholder="000000"
                    placeholderTextColor={colors.textSecondary}
                    value={code}
                    onChangeText={(value) => {
                      setCode(value);
                      clearError('code');
                    }}
                    keyboardType="numeric"
                    maxLength={6}
                    textAlign="center"
                  />
                  {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Nova senha</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[styles.input, styles.inputWithAction, errors.newPassword && styles.inputError]}
                      placeholder="••••••••"
                      placeholderTextColor={colors.textSecondary}
                      value={newPassword}
                      onChangeText={(value) => {
                        setNewPassword(value);
                        clearError('newPassword');
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <Pressable
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <EyeIcon visible={showPassword} />
                    </Pressable>
                  </View>
                  {errors.newPassword
                    ? <Text style={styles.errorText}>{errors.newPassword}</Text>
                    : <Text style={styles.hint}>Mínimo 8 caracteres, 1 letra e 1 número.</Text>
                  }
                </View>
              </View>

              <PrimaryButton label="Redefinir senha" onPress={handleResetPassword} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
      onPress={onPress}
    >
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.btnGradient}
      >
        <Text style={styles.btnText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke={colors.textSecondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={colors.success}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"
        stroke={colors.textSecondary}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12} r={3} stroke={colors.textSecondary} strokeWidth={1.8} />
      {visible && (
        <Path
          d="M4 20L20 4"
          stroke={colors.textSecondary}
          strokeWidth={2}
          strokeLinecap="round"
        />
      )}
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
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  backButton: {
    marginTop: 32,
    marginBottom: 24,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    lineHeight: 40,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    lineHeight: 25,
    color: colors.textSecondary,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34,197,94,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    borderWidth: 1,
    borderColor: 'rgba(167,176,192,0.18)',
  },
  inputError: {
    borderColor: colors.danger,
  },
  codeInput: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    letterSpacing: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputWithAction: {
    paddingRight: 52,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
  },
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    marginTop: 2,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: colors.danger,
    marginTop: 2,
  },
  btnPrimary: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 'auto',
    marginBottom: 24,
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
  pressed: {
    opacity: 0.8,
  },
});
