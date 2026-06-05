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
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

const MOCK_VIBES = [
  {
    id: '1',
    title: 'Foco Absoluto',
    desc: 'Instrumental para trabalho',
    energy: 'Medio',
    mood: 'Foco',
    gradientColors: ['#7C3AED', '#4338CA'] as const,
    image: 'https://images.unsplash.com/photo-1529421308418-eab98863cee4?w=900&q=85',
  },
  {
    id: '2',
    title: 'Treino Pesado',
    desc: 'Beats intensos para suar',
    energy: 'Alto',
    mood: 'Animado',
    gradientColors: ['#F472B6', '#BE185D'] as const,
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=900&q=85',
  },
  {
    id: '3',
    title: 'Relax no fim do dia',
    desc: 'Acustico e chill',
    energy: 'Baixo',
    mood: 'Relax',
    gradientColors: ['#22D3EE', '#0369A1'] as const,
    image: 'https://images.unsplash.com/photo-1573603088895-d399fbee9653?w=900&q=85',
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
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Vibes de hoje</Text>

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
                resizeMode="cover"
              >
                <LinearGradient
                  colors={[...vibe.gradientColors, 'rgba(11,15,26,0.10)'] as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, styles.colorOverlay]}
                />
                <LinearGradient
                  colors={['rgba(11,15,26,0.04)', 'rgba(11,15,26,0.50)', 'rgba(11,15,26,0.96)']}
                  locations={[0, 0.52, 1]}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.cardContent}>
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

                <View style={styles.arrowButton}>
                  <ArrowRightIcon />
                </View>
              </ImageBackground>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ArrowRightIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12h14M13 6l6 6-6 6"
        stroke={colors.textPrimary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
    paddingTop: 22,
    paddingBottom: 108,
  },
  header: {
    marginBottom: 36,
  },
  greeting: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 31,
    lineHeight: 37,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 22,
    lineHeight: 29,
    color: colors.textPrimary,
    marginBottom: 20,
  },
  vibeList: {
    gap: 16,
  },
  card: {
    height: 192,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  cardImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardImageStyle: {
    opacity: 0.78,
  },
  colorOverlay: {
    opacity: 0.76,
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingRight: 78,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderRadius: 8,
  },
  tagText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 11,
    lineHeight: 13,
    color: colors.textPrimary,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 21,
    lineHeight: 27,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.82)',
  },
  arrowButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.86,
  },
});
