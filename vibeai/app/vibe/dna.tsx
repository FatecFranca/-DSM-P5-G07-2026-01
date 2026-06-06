import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polygon, Line, Circle, Text as SvgText, Path } from 'react-native-svg';
import { colors } from '@/constants/theme';
import { useVibeStore } from '@/store/vibeStore';
import { Track } from '@/types';

type RadarItem = {
  label: string;
  value: number;
};

function RadarChart({ data }: { data: RadarItem[] }) {
  const width = 350;
  const height = 318;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = 104;
  const labelRadius = 134;
  const levels = 4;
  const total = data.length;

  const getCoords = (index: number, radius: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const dataPoints = data
    .map((item, index) => {
      const radius = (item.value / 100) * maxRadius;
      const { x, y } = getCoords(index, radius);
      return `${x},${y}`;
    })
    .join(' ');

  const gridPolygons = Array.from({ length: levels }, (_, level) => {
    const radius = (maxRadius / levels) * (level + 1);
    return Array.from({ length: total }, (_, index) => {
      const { x, y } = getCoords(index, radius);
      return `${x},${y}`;
    }).join(' ');
  });

  return (
    <Svg width={width} height={height}>
      {gridPolygons.map((points, index) => (
        <Polygon
          key={`grid-${index}`}
          points={points}
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={1}
        />
      ))}

      {data.map((_, index) => {
        const { x, y } = getCoords(index, maxRadius);
        return (
          <Line
            key={`axis-${index}`}
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.10)"
            strokeWidth={1}
          />
        );
      })}

      <Polygon
        points={dataPoints}
        fill="rgba(124,58,237,0.58)"
        stroke={colors.primary}
        strokeWidth={2.5}
      />

      {data.map((item, index) => {
        const radius = (item.value / 100) * maxRadius;
        const { x, y } = getCoords(index, radius);
        return (
          <Circle
            key={`dot-${item.label}`}
            cx={x}
            cy={y}
            r={5}
            fill={colors.secondary}
          />
        );
      })}

      {data.map((item, index) => {
        const { x, y } = getCoords(index, labelRadius);
        return (
          <SvgText
            key={`label-${item.label}`}
            x={x}
            y={y}
            fill={colors.textSecondary}
            fontSize={12}
            fontWeight="600"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {item.label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

export default function TrackDNAScreen() {
  const { trackId } = useLocalSearchParams<{ trackId: string }>();
  const { currentTrack, currentPlaylist, playlists } = useVibeStore();
  const track = findTrack(trackId, currentTrack, currentPlaylist?.tracks, playlists.flatMap((playlist) => playlist.tracks));

  if (!track) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Faixa não encontrada.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const radarData: RadarItem[] = [
    { label: 'Energia', value: toPercent(track.features.energy) },
    { label: 'Valência', value: toPercent(track.features.valence) },
    { label: 'Dança', value: toPercent(track.features.danceability) },
    { label: 'Acústico', value: toPercent(track.features.acousticness) },
    { label: 'Instrumental', value: toPercent(track.features.instrumentalness) },
  ];

  const topAttribute = radarData.reduce((a, b) => (a.value > b.value ? a : b));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <SparkleIcon />
            <Text style={styles.title}>DNA da Faixa</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <CloseIcon />
          </Pressable>
        </View>

        <View style={styles.trackCard}>
          <Image source={{ uri: track.cover }} style={styles.trackCover} />
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle}>{track.title}</Text>
            <Text style={styles.trackArtist}>{track.artist}</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <RadarChart data={radarData} />
        </View>

        <View style={styles.barsContainer}>
          {radarData.map((item) => (
            <View key={item.label} style={styles.barRow}>
              <Text style={styles.barLabel}>{item.label}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${item.value}%` }]} />
              </View>
              <Text style={styles.barValue}>{item.value}%</Text>
            </View>
          ))}
        </View>

        <View style={styles.explanationCard}>
          <Text style={styles.explanationTitle}>Por que foi recomendada?</Text>
          <Text style={styles.explanationText}>
            Recomendada por ter <Text style={styles.highlight}>{toPercent(track.features.energy)}% de energia</Text> e{' '}
            <Text style={styles.highlight}>{topAttribute.label} destacado</Text>.
            {track.explanation ? ` ${track.explanation}` : ' A combinação de atributos combina com a sua vibe.'}
          </Text>

          <View style={styles.tags}>
            <View style={styles.tagPrimary}>
              <Text style={styles.tagPrimaryText}>{topAttribute.label}</Text>
            </View>
            <View style={styles.tagSecondary}>
              <Text style={styles.tagSecondaryText}>Popularidade {track.popularity}</Text>
            </View>
            <View style={styles.tagAccent}>
              <Text style={styles.tagAccentText}>{track.album}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function findTrack(trackId: string | undefined, currentTrack: Track | null, currentTracks: Track[] = [], allTracks: Track[] = []) {
  if (!trackId) return null;
  if (currentTrack?.id === trackId) return currentTrack;
  return currentTracks.find((track) => track.id === trackId) ?? allTracks.find((track) => track.id === trackId) ?? null;
}

function toPercent(value: number) {
  return Math.round(Math.max(0, Math.min(1, value)) * 100);
}

function SparkleIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3l1.3 4.2L17.5 8.5l-4.2 1.3L12 14l-1.3-4.2-4.2-1.3 4.2-1.3L12 3z" stroke={colors.secondary} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M18 14l.7 2.2L21 17l-2.3.8L18 20l-.8-2.2L15 17l2.2-.8L18 14z" stroke={colors.secondary} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function CloseIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6l12 12M18 6L6 18" stroke={colors.textSecondary} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 42,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  title: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 22,
    lineHeight: 29,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackCard: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 18,
  },
  trackCover: {
    width: 68,
    height: 68,
    borderRadius: 14,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 21,
    lineHeight: 27,
    color: colors.textPrimary,
    marginBottom: 3,
  },
  trackArtist: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  barsContainer: {
    gap: 11,
    marginBottom: 32,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barLabel: {
    width: 86,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  barValue: {
    width: 42,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  explanationCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  explanationTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 19,
    lineHeight: 25,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  explanationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 25,
    marginBottom: 18,
  },
  highlight: {
    fontFamily: 'Inter_800ExtraBold',
    color: colors.textPrimary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: `${colors.primary}33`,
    borderRadius: 999,
  },
  tagPrimaryText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 12,
    color: colors.primary,
  },
  tagSecondary: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: `${colors.secondary}33`,
    borderRadius: 999,
  },
  tagSecondaryText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 12,
    color: colors.secondary,
  },
  tagAccent: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: `${colors.accent}33`,
    borderRadius: 999,
    maxWidth: '100%',
  },
  tagAccentText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 12,
    color: colors.accent,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.textSecondary,
  },
  backLink: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: colors.primary,
  },
  pressed: {
    opacity: 0.72,
  },
});
