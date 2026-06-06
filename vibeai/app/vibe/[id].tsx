import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ImageBackground,
  Image,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useVibeStore } from '@/store/vibeStore';
import { getPlaylistArtwork } from '@/services/api';
import { Playlist, Track } from '@/types';

export default function VibeDetailScreen() {
  const { id, fromGenerated } = useLocalSearchParams<{ id: string; fromGenerated?: string }>();
  const { token } = useAuthStore();
  const {
    playlists,
    currentPlaylist,
    loadPlaylistDetails,
    deletePlaylist,
    setCurrentTrack,
    error,
  } = useVibeStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const playlist = currentPlaylist?.id === id
    ? currentPlaylist
    : playlists.find((item) => item.id === id);

  useEffect(() => {
    if (!token || !id) {
      router.replace('/(auth)/login');
      return;
    }

    loadPlaylistDetails(token, id)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [id, token, loadPlaylistDetails]);

  const handleBack = () => {
    if (fromGenerated === '1') {
      router.replace('/(tabs)');
      return;
    }

    router.back();
  };

  const handleDeleteVibe = async () => {
    if (!token || !id) return;

    try {
      await deletePlaylist(token, id);
      setDeleteModalOpen(false);
      router.replace('/(tabs)');
    } catch {
      setDeleteModalOpen(false);
    }
  };

  const handleOpenDna = (track: Track) => {
    setCurrentTrack(track);
    router.push({ pathname: '/vibe/dna', params: { trackId: track.id, playlistId: playlist?.id } });
  };

  if (loading || !playlist) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{error || 'Carregando vibe...'}</Text>
      </View>
    );
  }

  const artwork = getPlaylistArtwork(playlist);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ImageBackground
          source={{ uri: artwork.image }}
          style={styles.hero}
          imageStyle={styles.heroImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[...artwork.gradientColors, 'rgba(11,15,26,0.08)'] as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.colorOverlay]}
          />
          <LinearGradient
            colors={['rgba(11,15,26,0.08)', 'rgba(11,15,26,0.38)', colors.background]}
            locations={[0, 0.48, 1]}
            style={StyleSheet.absoluteFill}
          />

          <SafeAreaView style={styles.heroSafe}>
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              onPress={handleBack}
            >
              <BackIcon />
            </Pressable>

            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>{playlist.name}</Text>
              <Text style={styles.heroSubtitle}>
                {getEnergyLabel(playlist.energyLevel)} energia • {playlist.totalTracks} faixas
              </Text>
            </View>
          </SafeAreaView>
        </ImageBackground>

        <View style={styles.content}>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.deleteVibeButton, pressed && styles.pressed]}
              onPress={() => setDeleteModalOpen(true)}
            >
              <TrashIcon />
            </Pressable>
          </View>

          <View style={styles.trackList}>
            {playlist.tracks.map((track, index) => (
              <Pressable
                key={`${track.id}-${index}`}
                style={({ pressed }) => [styles.trackRow, pressed && styles.trackRowPressed]}
                onPress={() => handleOpenDna(track)}
              >
                <Text style={styles.trackNumber}>{index + 1}</Text>
                <Image source={{ uri: track.cover }} style={styles.trackCover} />

                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.dnaButton, pressed && styles.pressed]}
                  onPress={() => handleOpenDna(track)}
                  hitSlop={10}
                >
                  <DnaIcon />
                </Pressable>
              </Pressable>
            ))}
          </View>
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
              <TrashIcon />
            </View>

            <Text style={styles.modalTitle}>Excluir vibe?</Text>
            <Text style={styles.modalDescription}>
              Essa vibe será removida da sua Home. Você poderá criar uma nova recomendação quando quiser.
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.btnDelete, pressed && styles.pressed]}
                onPress={handleDeleteVibe}
              >
                <Text style={styles.btnDeleteText}>Sim, excluir vibe</Text>
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
    </View>
  );
}

function getEnergyLabel(energy: Playlist['energyLevel']) {
  const labels = {
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta',
  };
  return labels[energy] ?? energy;
}

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 19l-7-7 7-7" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function TrashIcon() {
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"
        stroke={colors.danger}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DnaIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 12h3l1.6-5 3.2 11 2.8-8 1.9 4H21"
        stroke={colors.textSecondary}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  scroll: {
    paddingBottom: 34,
  },
  hero: {
    height: 334,
  },
  heroImage: {
    opacity: 0.74,
  },
  colorOverlay: {
    opacity: 0.76,
  },
  heroSafe: {
    flex: 1,
    justifyContent: 'space-between',
  },
  backButton: {
    marginTop: 12,
    marginLeft: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.34)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  heroTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 34,
    lineHeight: 41,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 23,
    color: 'rgba(255,255,255,0.88)',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30,
  },
  deleteVibeButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: colors.danger,
    backgroundColor: 'rgba(239,68,68,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackList: {
    gap: 12,
  },
  trackRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  trackRowPressed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  trackNumber: {
    width: 24,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  trackCover: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  trackInfo: {
    flex: 1,
    minWidth: 0,
  },
  trackTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 17,
    lineHeight: 22,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  trackArtist: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  dnaButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
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
