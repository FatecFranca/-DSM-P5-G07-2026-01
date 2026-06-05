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
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/constants/theme';

const MOCK_VIBES: Record<string, any> = {
  '1': {
    id: '1',
    title: 'Foco Absoluto',
    desc: 'Instrumental para trabalho',
    gradientColors: ['#7C3AED', '#4338CA'],
    image: 'https://images.unsplash.com/photo-1529421308418-eab98863cee4?w=1080&q=85',
  },
  '2': {
    id: '2',
    title: 'Treino Pesado',
    desc: 'Beats intensos para suar',
    gradientColors: ['#F472B6', '#BE185D'],
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1080&q=85',
  },
  '3': {
    id: '3',
    title: 'Relax no fim do dia',
    desc: 'Acustico e chill',
    gradientColors: ['#22D3EE', '#0369A1'],
    image: 'https://images.unsplash.com/photo-1573603088895-d399fbee9653?w=1080&q=85',
  },
  generated: {
    id: 'generated',
    title: 'Sua Vibe Gerada',
    desc: 'Criada pela IA para o seu momento',
    gradientColors: ['#7C3AED', '#22D3EE'],
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1080&q=85',
  },
};

const MOCK_TRACKS = [
  { id: 't1', title: 'Midnight City', artist: 'M83', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=120&q=80' },
  { id: 't2', title: 'Starboy', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1571444857442-8af5a5cd41c8?w=120&q=80' },
  { id: 't3', title: 'Lost in Yesterday', artist: 'Tame Impala', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&q=80' },
  { id: 't4', title: 'Levitating', artist: 'Dua Lipa', cover: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5287f?w=120&q=80' },
  { id: 't5', title: 'Blinding Lights', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=120&q=80' },
];

export default function VibeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vibe = id ? MOCK_VIBES[id] ?? MOCK_VIBES.generated : MOCK_VIBES.generated;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ImageBackground
          source={{ uri: vibe.image }}
          style={styles.hero}
          imageStyle={styles.heroImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[...vibe.gradientColors, 'rgba(11,15,26,0.08)'] as any}
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
              onPress={() => router.back()}
            >
              <BackIcon />
            </Pressable>

            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>{vibe.title}</Text>
              <Text style={styles.heroSubtitle}>
                {vibe.desc} • {MOCK_TRACKS.length} faixas
              </Text>
            </View>
          </SafeAreaView>
        </ImageBackground>

        <View style={styles.content}>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.regenerateButton, pressed && styles.pressed]}
              onPress={() => {}}
            >
              <RefreshIcon />
              <Text style={styles.regenerateText}>Gerar nova recomendação</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
              onPress={() => {}}
            >
              <MenuIcon />
            </Pressable>
          </View>

          <View style={styles.trackList}>
            {MOCK_TRACKS.map((track, index) => (
              <Pressable
                key={track.id}
                style={({ pressed }) => [styles.trackRow, pressed && styles.trackRowPressed]}
                onPress={() => router.push({ pathname: '/vibe/dna', params: { trackId: track.id } })}
              >
                <Text style={styles.trackNumber}>{index + 1}</Text>
                <Image source={{ uri: track.cover }} style={styles.trackCover} />

                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.dnaButton, pressed && styles.pressed]}
                  onPress={() => router.push({ pathname: '/vibe/dna', params: { trackId: track.id } })}
                  hitSlop={10}
                >
                  <DnaIcon />
                </Pressable>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 19l-7-7 7-7" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function RefreshIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M20 12a8 8 0 10-2.35 5.65M20 12v5h-5" stroke={colors.textPrimary} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function MenuIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={5} r={1.4} fill={colors.primary} />
      <Circle cx={12} cy={12} r={1.4} fill={colors.primary} />
      <Circle cx={12} cy={19} r={1.4} fill={colors.primary} />
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
    gap: 12,
    marginBottom: 30,
  },
  regenerateButton: {
    flex: 1,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: colors.surface,
  },
  regenerateText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    lineHeight: 21,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  menuButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.primary,
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
  pressed: {
    opacity: 0.72,
  },
});
