import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, fontSize } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

const MOCK_VIBES = [
  {
    id: '1',
    title: 'Foco Absoluto',
    desc: 'Instrumental para trabalho',
    energy: 'Médio',
    mood: 'Foco',
    gradientColors: ['#7C3AED', '#4338CA'] as const,
    image: 'https://images.unsplash.com/photo-1529421308418-eab98863cee4?w=800&q=80',
  },
  {
    id: '2',
    title: 'Treino Pesado',
    desc: 'Beats intensos para suar',
    energy: 'Alto',
    mood: 'Animado',
    gradientColors: ['#F472B6', '#BE185D'] as const,
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80',
  },
  {
    id: '3',
    title: 'Relax no fim do dia',
    desc: 'Acústico e chill',
    energy: 'Baixo',
    mood: 'Relax',
    gradientColors: ['#22D3EE', '#0369A1'] as const,
    image: 'https://images.unsplash.com/photo-1573603088895-d399fbee9653?w=800&q=80',
  },
];

export default function HomeScreen() {
  const { user } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia,';
    if (hour < 18) return 'Boa tarde,';
    return 'Boa noite,';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}
            onPress={() => {/* busca futuramente */}}
          >
            <Text style={styles.searchIcon}>🔍</Text>
          </Pressable>
        </View>

        {/* Título seção */}
        <Text style={styles.sectionTitle}>Vibes de hoje</Text>

        {/* Cards de vibe */}
        <View style={styles.vibeList}>
          {MOCK_VIBES.map((vibe) => (
            <Pressable
              key={vibe.id}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              onPress={() => router.push(`/vibe/${vibe.id}`)}
            >
              <ImageBackground
                source={{ uri: vibe.image }}
                style={styles.cardImage}
                imageStyle={styles.cardImageStyle}
              >
                {/* Gradiente de cor da vibe */}
                <LinearGradient
                  colors={[...vibe.gradientColors, 'transparent'] as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, { opacity: 0.80 }]}
                />

                {/* Gradiente escuro de baixo */}
                <LinearGradient
                  colors={['transparent', 'rgba(11,15,26,0.5)', colors.background]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />

                {/* Conteúdo */}
                <View style={styles.cardContent}>
                  {/* Tags */}
                  <View style={styles.tags}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{vibe.energy} Energia</Text>
                    </View>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{vibe.mood}</Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>{vibe.title}</Text>
                  <Text style={styles.cardDesc} numberOfLines={1}>{vibe.desc}</Text>
                </View>

                {/* Botão seta */}
                <View style={styles.arrowButton}>
                  <Text style={styles.arrowText}>→</Text>
                </View>

              </ImageBackground>
            </Pressable>
          ))}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  vibeList: {
    gap: spacing.md,
  },
  card: {
    height: 192,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cardImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardImageStyle: {
    opacity: 0.60,
  },
  cardContent: {
    padding: spacing.lg,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: radius.sm,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardDesc: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.80)',
  },
  arrowButton: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});