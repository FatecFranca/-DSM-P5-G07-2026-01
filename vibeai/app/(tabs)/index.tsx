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
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useVibeStore } from '@/store/vibeStore';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { savedVibes } = useVibeStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia,';
    if (hour < 18) return 'Boa tarde,';
    return 'Boa noite,';
  };

  const hasVibes = savedVibes.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, !hasVibes && styles.scrollEmpty]}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Suas Vibes</Text>

        {hasVibes ? (
          <View style={styles.vibeList}>
            {savedVibes.map((vibe) => (
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
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <SparkleIcon />
            </View>
            <Text style={styles.emptyTitle}>Você ainda não possui nenhuma vibe criada.</Text>
            <Text style={styles.emptyText}>
              Clique abaixo para iniciar e gerar uma playlist para o seu momento.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
              onPress={() => router.push('/(tabs)/create-vibe')}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.createButtonGradient}
              >
                <PlusIcon />
                <Text style={styles.createButtonText}>Criar Vibe</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ArrowRightIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M13 6l6 6-6 6" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PlusIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={colors.textPrimary} strokeWidth={2} />
      <Path d="M12 8v8M8 12h8" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function SparkleIcon() {
  return (
    <Svg width={34} height={34} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3l1.3 4.2L17.5 8.5l-4.2 1.3L12 14l-1.3-4.2-4.2-1.3 4.2-1.3L12 3z" stroke={colors.secondary} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M18 14l.7 2.2L21 17l-2.3.8L18 20l-.8-2.2L15 17l2.2-.8L18 14z" stroke={colors.secondary} strokeWidth={1.8} strokeLinejoin="round" />
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
  scrollEmpty: {
    flexGrow: 1,
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
    fontSize: 27,
    lineHeight: 34,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
    paddingBottom: 80,
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  emptyTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 22,
    lineHeight: 29,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  createButton: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  createButtonGradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 999,
  },
  createButtonText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 17,
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.86,
  },
});
