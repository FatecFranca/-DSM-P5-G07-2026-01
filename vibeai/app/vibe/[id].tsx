import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ImageBackground,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, fontSize } from '@/constants/theme';

const MOCK_VIBES: Record<string, any> = {
  '1': {
    id: '1',
    title: 'Foco Absoluto',
    desc: 'Instrumental para trabalho',
    energy: 'Médio',
    mood: 'Foco',
    gradientColors: ['#7C3AED', '#4338CA'],
    image: 'https://images.unsplash.com/photo-1529421308418-eab98863cee4?w=800&q=80',
  },
  '2': {
    id: '2',
    title: 'Treino Pesado',
    desc: 'Beats intensos para suar',
    energy: 'Alto',
    mood: 'Animado',
    gradientColors: ['#F472B6', '#BE185D'],
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80',
  },
  '3': {
    id: '3',
    title: 'Relax no fim do dia',
    desc: 'Acústico e chill',
    energy: 'Baixo',
    mood: 'Relax',
    gradientColors: ['#22D3EE', '#0369A1'],
    image: 'https://images.unsplash.com/photo-1573603088895-d399fbee9653?w=800&q=80',
  },
};

const MOCK_TRACKS = [
  { id: 't1', title: 'Midnight City', artist: 'M83', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80', energy: 85, valence: 60, danceability: 70, acousticness: 5, instrumentalness: 40 },
  { id: 't2', title: 'Starboy', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1571444857442-8af5a5cd41c8?w=100&q=80', energy: 70, valence: 50, danceability: 80, acousticness: 10, instrumentalness: 5 },
  { id: 't3', title: 'Lost in Yesterday', artist: 'Tame Impala', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80', energy: 65, valence: 75, danceability: 75, acousticness: 20, instrumentalness: 15 },
  { id: 't4', title: 'Levitating', artist: 'Dua Lipa', cover: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5287f?w=100&q=80', energy: 80, valence: 90, danceability: 85, acousticness: 5, instrumentalness: 0 },
  { id: 't5', title: 'Blinding Lights', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=100&q=80', energy: 90, valence: 85, danceability: 80, acousticness: 5, instrumentalness: 0 },
];

export default function VibeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vibe = id ? MOCK_VIBES[id] : null;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* Header com imagem */}
        <View style={styles.header}>
          <ImageBackground
            source={{ uri: vibe?.image }}
            style={styles.headerImage}
          >
            <LinearGradient
                colors={
                (vibe?.gradientColors
                    ? [...vibe.gradientColors, 'transparent']
                    : [colors.primary, colors.secondary, 'transparent']
                ) as unknown as [string, string, ...string[]]
                }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'transparent', colors.background]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Botão voltar */}
            <SafeAreaView>
              <Pressable
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
                onPress={() => router.back()}
              >
                <Text style={styles.backArrow}>←</Text>
              </Pressable>
            </SafeAreaView>

            {/* Título */}
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>
                {vibe?.title || `Vibe #${id}`}
              </Text>
              <Text style={styles.headerSubtitle}>
                {vibe?.desc || 'Gerada por IA'} • {MOCK_TRACKS.length} faixas
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* Conteúdo */}
        <View style={styles.content}>

          {/* Botões de ação */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.btnSecondary, styles.btnFlex, pressed && styles.pressed]}
              onPress={() => {/* regenerar vibe futuramente */}}
            >
              <Text style={styles.btnSecondaryIcon}>↻</Text>
              <Text style={styles.btnSecondaryText}>Nova recomendação</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.btnOutline, pressed && styles.pressed]}
              onPress={() => {/* opções futuramente */}}
            >
              <Text style={styles.btnOutlineText}>⋮</Text>
            </Pressable>
          </View>

          {/* Lista de faixas */}
          <View style={styles.trackList}>
            {MOCK_TRACKS.map((track, index) => (
              <Pressable
                key={track.id}
                style={({ pressed }) => [styles.trackRow, pressed && styles.trackRowPressed]}
                onPress={() => {
                  router.push({
                    pathname: '/vibe/dna',
                    params: { trackId: track.id },
                  });
                }}
              >
                {/* Número */}
                <Text style={styles.trackNumber}>{index + 1}</Text>

                {/* Capa */}
                <Image
                  source={{ uri: track.cover }}
                  style={styles.trackCover}
                />

                {/* Info */}
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>
                    {track.artist}
                  </Text>
                </View>

                {/* DNA button */}
                <Pressable
                  style={({ pressed }) => [styles.dnaButton, pressed && styles.pressed]}
                  onPress={() => {
                    router.push({
                      pathname: '/vibe/dna',
                      params: { trackId: track.id },
                    });
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.dnaIcon}>📊</Text>
                </Pressable>

              </Pressable>
            ))}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 256,
  },
  headerImage: {
    flex: 1,
    justifyContent: 'space-between',
  },
  backButton: {
    margin: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  headerContent: {
    padding: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.80)',
  },
  content: {
    padding: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  btnFlex: {
    flex: 1,
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: colors.surface,
  },
  btnSecondaryIcon: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  btnSecondaryText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  btnOutline: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  trackList: {
    gap: spacing.xs,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  trackRowPressed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  trackNumber: {
    width: 16,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  trackCover: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
  },
  trackInfo: {
    flex: 1,
    minWidth: 0,
  },
  trackTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  dnaButton: {
    padding: spacing.xs,
  },
  dnaIcon: {
    fontSize: 18,
  },
  pressed: {
    opacity: 0.7,
  },
});