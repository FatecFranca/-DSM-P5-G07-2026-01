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
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { colors, spacing, radius, fontSize } from '@/constants/theme';

const MOCK_TRACKS: Record<string, any> = {
  t1: { id: 't1', title: 'Midnight City', artist: 'M83', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80', energy: 85, valence: 60, danceability: 70, acousticness: 5, instrumentalness: 40 },
  t2: { id: 't2', title: 'Starboy', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1571444857442-8af5a5cd41c8?w=100&q=80', energy: 70, valence: 50, danceability: 80, acousticness: 10, instrumentalness: 5 },
  t3: { id: 't3', title: 'Lost in Yesterday', artist: 'Tame Impala', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80', energy: 65, valence: 75, danceability: 75, acousticness: 20, instrumentalness: 15 },
  t4: { id: 't4', title: 'Levitating', artist: 'Dua Lipa', cover: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5287f?w=100&q=80', energy: 80, valence: 90, danceability: 85, acousticness: 5, instrumentalness: 0 },
  t5: { id: 't5', title: 'Blinding Lights', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=100&q=80', energy: 90, valence: 85, danceability: 80, acousticness: 5, instrumentalness: 0 },
};

// Componente do gráfico radar feito com SVG puro
function RadarChart({ data }: { data: { label: string; value: number }[] }) {
  const size = 240;
  const center = size / 2;
  const maxRadius = 90;
  const levels = 4;
  const total = data.length;

  // Calcula coordenadas de cada eixo
  const getCoords = (index: number, radius: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // Polígono dos dados reais
  const dataPoints = data
    .map((d, i) => {
      const r = (d.value / 100) * maxRadius;
      const { x, y } = getCoords(i, r);
      return `${x},${y}`;
    })
    .join(' ');

  // Polígonos de grade (níveis)
  const gridPolygons = Array.from({ length: levels }, (_, level) => {
    const r = (maxRadius / levels) * (level + 1);
    return Array.from({ length: total }, (_, i) => {
      const { x, y } = getCoords(i, r);
      return `${x},${y}`;
    }).join(' ');
  });

  return (
    <Svg width={size} height={size}>
      {/* Grade de fundo */}
      {gridPolygons.map((points, i) => (
        <Polygon
          key={`grid-${i}`}
          points={points}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
      ))}

      {/* Linhas dos eixos */}
      {data.map((_, i) => {
        const { x, y } = getCoords(i, maxRadius);
        return (
          <Line
            key={`axis-${i}`}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        );
      })}

      {/* Polígono dos dados */}
      <Polygon
        points={dataPoints}
        fill={`${colors.primary}80`}
        stroke={colors.primary}
        strokeWidth={2}
      />

      {/* Pontos nos vértices */}
      {data.map((d, i) => {
        const r = (d.value / 100) * maxRadius;
        const { x, y } = getCoords(i, r);
        return (
          <Circle
            key={`dot-${i}`}
            cx={x}
            cy={y}
            r={4}
            fill={colors.secondary}
          />
        );
      })}

      {/* Labels */}
      {data.map((d, i) => {
        const { x, y } = getCoords(i, maxRadius + 18);
        return (
          <SvgText
            key={`label-${i}`}
            x={x}
            y={y}
            fill={colors.textSecondary}
            fontSize={11}
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {d.label}
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
        <Text style={styles.emptyText}>Faixa não encontrada.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const radarData = [
    { label: 'Energia', value: track.energy },
    { label: 'Valence', value: track.valence },
    { label: 'Dança', value: track.danceability },
    { label: 'Acústico', value: track.acousticness },
    { label: 'Instrumental', value: track.instrumentalness },
  ];

  const getTopAttribute = () => {
    const top = radarData.reduce((a, b) => (a.value > b.value ? a : b));
    return top;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <Text style={styles.sparkle}>✦</Text>
            <Text style={styles.title}>DNA da Faixa</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        {/* Card da faixa */}
        <View style={styles.trackCard}>
          <Image source={{ uri: track.cover }} style={styles.trackCover} />
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle}>{track.title}</Text>
            <Text style={styles.trackArtist}>{track.artist}</Text>
          </View>
        </View>

        {/* Gráfico radar */}
        <View style={styles.chartContainer}>
          <RadarChart data={radarData} />
        </View>

        {/* Barras de atributos */}
        <View style={styles.barsContainer}>
          {radarData.map((item) => (
            <View key={item.label} style={styles.barRow}>
              <Text style={styles.barLabel}>{item.label}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${item.value}%` },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>{item.value}%</Text>
            </View>
          ))}
        </View>

        {/* Explicação */}
        <View style={styles.explanationCard}>
          <Text style={styles.explanationTitle}>Por que foi recomendada?</Text>
          <Text style={styles.explanationText}>
            Recomendada por ter{' '}
            <Text style={styles.highlight}>{track.energy}% de energia</Text>
            {' '}e{' '}
            <Text style={styles.highlight}>{getTopAttribute().label} destacado</Text>
            , ideal para o seu objetivo atual. A batida ajuda a manter o foco constante.
          </Text>

          {/* Tags de contexto */}
          <View style={styles.tags}>
            <View style={styles.tagPrimary}>
              <Text style={styles.tagPrimaryText}>Foco</Text>
            </View>
            <View style={styles.tagSecondary}>
              <Text style={styles.tagSecondaryText}>Média Energia</Text>
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sparkle: {
    fontSize: 18,
    color: colors.secondary,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: spacing.xl,
  },
  trackCover: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  trackArtist: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  barsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barLabel: {
    width: 80,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  barValue: {
    width: 36,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  explanationCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  explanationTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  explanationText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  highlight: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagPrimary: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: `${colors.primary}33`,
    borderRadius: radius.full,
  },
  tagPrimaryText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  tagSecondary: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: `${colors.secondary}33`,
    borderRadius: radius.full,
  },
  tagSecondaryText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.secondary,
  },
  tagAccent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: `${colors.accent}33`,
    borderRadius: radius.full,
  },
  tagAccentText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.accent,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  backLink: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});