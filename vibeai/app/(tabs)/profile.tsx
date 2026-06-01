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
import { colors, spacing, radius, fontSize } from '@/constants/theme';
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
    // chamada de API para anonimizar dados (LGPD) entra aqui futuramente
    router.replace('/(auth)/welcome');
  };

  const initials = user?.name?.[0]?.toUpperCase() || 'U';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Título */}
        <Text style={styles.pageTitle}>Perfil</Text>

        {/* Avatar e dados do usuário */}
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

        {/* Ações */}
        <View style={styles.actions}>

          <Pressable
            style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
            onPress={handleRedoOnboarding}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>⚙️</Text>
            </View>
            <Text style={styles.actionLabel}>Refazer preferências</Text>
            <Text style={styles.actionChevron}>›</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
            onPress={handleLogout}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>🚪</Text>
            </View>
            <Text style={styles.actionLabel}>Sair da conta</Text>
            <Text style={styles.actionChevron}>›</Text>
          </Pressable>

        </View>

        {/* Excluir conta */}
        <Pressable
          style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
          onPress={() => setDeleteModalOpen(true)}
        >
          <Text style={styles.deleteText}>Excluir minha conta</Text>
        </Pressable>

      </ScrollView>

      {/* Modal de confirmação de exclusão */}
      <Modal
        visible={deleteModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            {/* Ícone de aviso */}
            <View style={styles.modalIcon}>
              <Text style={styles.modalIconText}>⚠️</Text>
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  pageTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconText: {
    fontSize: 18,
  },
  actionLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  actionChevron: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  deleteButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  deleteText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.danger,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.80)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: 'rgba(239,68,68,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalIconText: {
    fontSize: 22,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modalDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  modalActions: {
    gap: spacing.sm,
  },
  btnDelete: {
    width: '100%',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.danger,
    alignItems: 'center',
  },
  btnDeleteText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  btnCancel: {
    width: '100%',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  btnCancelText: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.7,
  },
});