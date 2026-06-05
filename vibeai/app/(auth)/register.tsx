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
import { MOCK_AUTH, useAuthStore } from '@/store/authStore';

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
  const { setUser, setToken } = useAuthStore();

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
      setUser({
        id: `mock-user-${Date.now()}`,
        name: name.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        birthDate,
        createdAt: new Date().toISOString(),
      });
      setToken(MOCK_AUTH.token);
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
          {/* Botao voltar */}
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <BackIcon />
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>Sua jornada musical começa aqui</Text>
          </View>

          {/* Formulario */}
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
                  <EyeIcon visible={showPassword} />
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
                  <EyeIcon visible={showConfirmPassword} />
                </Pressable>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

          </View>

          {/* Botao cadastrar */}
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

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
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
    marginBottom: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 30,
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
  form: {
    gap: 16,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfField: {
    flex: 1,
    gap: 6,
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
    marginTop: 14,
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
