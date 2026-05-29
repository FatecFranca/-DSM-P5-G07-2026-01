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

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Nome obrigatório';
    if (!lastName.trim()) newErrors.lastName = 'Sobrenome obrigatório';
    if (!birthDate.trim()) {
      newErrors.birthDate = 'Data de nascimento obrigatória';
    } else {
      const [day, month, year] = birthDate.split('/').map(Number);
      const birth = new Date(year, month - 1, day);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      if (isNaN(birth.getTime()) || age < 13) {
        newErrors.birthDate = 'Você deve ter pelo menos 13 anos';
      }
    }
    if (!email.trim()) newErrors.email = 'E-mail obrigatório';
    if (email !== confirmEmail) newErrors.confirmEmail = 'E-mails não coincidem';
    if (password.length < 8 || !/\d/.test(password)) {
      newErrors.password = 'Mínimo 8 caracteres e 1 número';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (validate()) {
      // chamada de API entra aqui futuramente
      router.replace('/(onboarding)/step-1-genres');
    }
  };

  const formatBirthDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
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

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>Sua jornada musical começa aqui</Text>
          </View>

          {/* Formulário */}
          <View style={styles.form}>

            {/* Nome + Sobrenome */}
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="João"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Sobrenome</Text>
                <TextInput
                  style={[styles.input, errors.lastName && styles.inputError]}
                  placeholder="Silva"
                  placeholderTextColor={colors.textSecondary}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>
            </View>

            {/* Data de Nascimento */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Data de Nascimento</Text>
              <TextInput
                style={[styles.input, errors.birthDate && styles.inputError]}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={colors.textSecondary}
                value={birthDate}
                onChangeText={(text) => setBirthDate(formatBirthDate(text))}
                keyboardType="numeric"
                maxLength={10}
              />
              {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
            </View>

            {/* Email */}
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

            {/* Confirmar Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmar E-mail</Text>
              <TextInput
                style={[styles.input, errors.confirmEmail && styles.inputError]}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textSecondary}
                value={confirmEmail}
                onChangeText={setConfirmEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.confirmEmail && <Text style={styles.errorText}>{errors.confirmEmail}</Text>}
            </View>

            {/* Senha */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.inputWithAction, errors.password && styles.inputError]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
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
              {errors.password
                ? <Text style={styles.errorText}>{errors.password}</Text>
                : <Text style={styles.hint}>Pelo menos 8 caracteres e 1 número.</Text>
              }
            </View>

            {/* Confirmar Senha */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmar Senha</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.inputWithAction, errors.confirmPassword && styles.inputError]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeText}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                </Pressable>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

          </View>

          {/* Botão cadastrar */}
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
            onPress={handleRegister}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Text style={styles.btnText}>Concluir Cadastro</Text>
            </LinearGradient>
          </Pressable>

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
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
    gap: spacing.xs,
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
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginTop: spacing.xs,
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