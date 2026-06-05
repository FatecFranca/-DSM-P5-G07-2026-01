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

const MOCK_TRACKS: Record<string, any> = {
  t1: { id: 't1', title: 'Midnight City', artist: 'M83', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=120&q=80', energy: 85, valence: 60, danceability: 70, acousticness: 5, instrumentalness: 40 },
  t2: { id: 't2', title: 'Starboy', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1571444857442-8af5a5cd41c8?w=120&q=80', energy: 70, valence: 50, danceability: 80, acousticness: 10, instrumentalness: 5 },
  t3: { id: 't3', title: 'Lost in Yesterday', artist: 'Tame Impala', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&q=80', energy: 65, valence: 75, danceability: 75, acousticness: 20, instrumentalness: 15 },
  t4: { id: 't4', title: 'Levitating', artist: 'Dua Lipa', cover: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5287f?w=120&q=80', energy: 80, valence: 90, danceability: 85, acousticness: 5, instrumentalness: 0 },
  t5: { id: 't5', title: 'Blinding Lights', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=120&q=80', energy: 90, valence: 85, danceability: 80, acousticness: 5, instrumentalness: 0 },
};

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
  const track = trackId ? MOCK_TRACKS[trackId] : null;

  if (!track) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Faixa nao encontrada.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const radarData: RadarItem[] = [
    { label: 'Energia', value: track.energy },
    { label: 'Valência', value: track.valence },
    { label: 'Dança', value: track.danceability },
    { label: 'Acústico', value: track.acousticness },
    { label: 'Instrumental', value: track.instrumentalness },
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
            Recomendada por ter <Text style={styles.highlight}>{track.energy}% de energia</Text> e{' '}
            <Text style={styles.highlight}>{topAttribute.label} destacado</Text>, ideal para o seu objetivo atual.
            A batida ajuda a manter o foco constante.
          </Text>

          <View style={styles.tags}>
            <View style={styles.tagPrimary}>
              <Text style={styles.tagPrimaryText}>Foco</Text>
            </View>
            <View style={styles.tagSecondary}>
              <Text style={styles.tagSecondaryText}>Media Energia</Text>
            </View>
            <View style={styles.tagAccent}>
              <Text style={styles.tagAccentText}>Neutro</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
