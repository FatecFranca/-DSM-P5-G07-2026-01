import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { reset: resetOnboarding } = useOnboardingStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/welcome');
  };

  const handleRedoOnboarding = () => {
    resetOnboarding();
    router.replace('/(onboarding)/step-1-genres');
  };

  const handleDeleteAccount = () => {
    setDeleteModalOpen(false);
    logout();
    resetOnboarding();
    router.replace('/(auth)/welcome');
  };

  const initials = user?.name?.[0]?.toUpperCase() || 'U';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.pageTitle}>Perfil</Text>

        <View style={styles.avatarSection}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'usuario@email.com'}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
            onPress={handleRedoOnboarding}
          >
            <View style={styles.actionIcon}>
              <SettingsIcon />
            </View>
            <Text style={styles.actionLabel}>Refazer preferências</Text>
            <ChevronIcon />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
            onPress={handleLogout}
          >
            <View style={styles.actionIcon}>
              <LogoutIcon />
            </View>
            <Text style={styles.actionLabel}>Sair da conta</Text>
            <ChevronIcon />
          </Pressable>
        </View>

        <View style={styles.deleteArea}>
          <Pressable
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
            onPress={() => setDeleteModalOpen(true)}
          >
            <Text style={styles.deleteText}>Excluir minha conta</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={deleteModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <WarningIcon />
            </View>

            <Text style={styles.modalTitle}>Excluir conta?</Text>
            <Text style={styles.modalDescription}>
              Essa ação é irreversível. Todos os seus dados, histórico de vibes e preferências serão anonimizados e apagados permanentemente de nossos servidores (LGPD).
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.btnDelete, pressed && styles.pressed]}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.btnDeleteText}>Sim, excluir conta</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.btnCancel, pressed && styles.pressed]}
                onPress={() => setDeleteModalOpen(false)}
              >
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SettingsIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke={colors.secondary} strokeWidth={2} />
      <Path
        d="M19.4 15a1.7 1.7 0 00.34 1.88l.04.04a2 2 0 01-2.83 2.83l-.04-.04A1.7 1.7 0 0015 19.4a1.7 1.7 0 00-1 .6V20a2 2 0 01-4 0v-.05a1.7 1.7 0 00-1-.6 1.7 1.7 0 00-1.88.34l-.04.04a2 2 0 01-2.83-2.83l.04-.04A1.7 1.7 0 004.6 15a1.7 1.7 0 00-.6-1H4a2 2 0 010-4h.05a1.7 1.7 0 00.6-1 1.7 1.7 0 00-.34-1.88l-.04-.04a2 2 0 012.83-2.83l.04.04A1.7 1.7 0 009 4.6a1.7 1.7 0 001-.6V4a2 2 0 014 0v.05a1.7 1.7 0 001 .6 1.7 1.7 0 001.88-.34l.04-.04a2 2 0 012.83 2.83l-.04.04A1.7 1.7 0 0019.4 9c.2.37.4.7.6 1H20a2 2 0 010 4h-.05c-.2.3-.4.63-.55 1z"
        stroke={colors.secondary}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LogoutIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M10 7V5a2 2 0 012-2h7v18h-7a2 2 0 01-2-2v-2" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M15 12H3M7 8l-4 4 4 4" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function WarningIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path d="M12 8v5M12 17h.01" stroke={colors.danger} strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M10.3 4.5a2 2 0 013.4 0l8 14A2 2 0 0120 21H4a2 2 0 01-1.7-3l8-13.5z" stroke={colors.danger} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 112,
  },
  pageTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 30,
    lineHeight: 38,
    color: colors.textPrimary,
    marginBottom: 36,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 54,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  avatarText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 38,
    color: colors.textPrimary,
  },
  userName: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 21,
    lineHeight: 27,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  actions: {
    gap: 16,
  },
  actionRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    lineHeight: 23,
    color: colors.textPrimary,
  },
  deleteArea: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 70,
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  deleteText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    lineHeight: 21,
    color: colors.danger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.80)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  modalIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(239,68,68,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 24,
    lineHeight: 31,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  modalDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 28,
  },
  modalActions: {
    gap: 14,
  },
  btnDelete: {
    width: '100%',
    height: 58,
    borderRadius: 999,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.26,
    shadowRadius: 18,
    elevation: 8,
  },
  btnDeleteText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  btnCancel: {
    width: '100%',
    height: 54,
    borderRadius: 999,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.72,
  },
});
