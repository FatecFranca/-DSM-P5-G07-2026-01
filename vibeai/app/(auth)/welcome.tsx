import React from 'react';
import { ImageBackground, View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path } from 'react-native-svg';

const PRIMARY   = '#7C3AED';
const SECONDARY = '#22D3EE';
const TEXT_SEC  = '#A7B0C0';
const WELCOME_BG = require('@/assets/images/welcome-bg.png');

function VibeIcon() {
  return (
    <Svg width={36} height={36} viewBox="0 0 24 24" fill="white">
      <Path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 14.5c-2.485 0-4.5-2.015-4.5-4.5S9.515 7.5 12 7.5s4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5zm0-7a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
    </Svg>
  );
}

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={WELCOME_BG}
        resizeMode="stretch"
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>

          {/* Logo */}
          <View style={styles.logoShadow}>
            <LinearGradient
              colors={[PRIMARY, SECONDARY]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoBox}
            >
              <VibeIcon />
            </LinearGradient>
          </View>

          {/* Titulo com gradiente branco para cinza */}
          <MaskedView
            style={{ marginBottom: 12 }}
            maskElement={
              <Text style={styles.title}>Descubra sua Vibe</Text>
            }
          >
            <LinearGradient
              colors={['#FFFFFF', '#9CA3AF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.title, { opacity: 0 }]}>
                Descubra sua Vibe
              </Text>
            </LinearGradient>
          </MaskedView>

          {/* Subtitulo */}
          <Text style={styles.subtitle}>
            Descubra músicas com inteligência artificial, adaptadas ao seu momento.
          </Text>

          {/* Botoes */}
          <View style={styles.buttons}>

            <View style={styles.btnPrimaryGlow}>
              <Pressable
                style={({ pressed }) => [styles.btnPrimaryHit, pressed && styles.pressed]}
                onPress={() => router.push('/(auth)/login')}
              >
                <LinearGradient
                  colors={[PRIMARY, SECONDARY]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.btnGradient}
                >
                  <Text style={styles.btnPrimaryText}>Entrar</Text>
                </LinearGradient>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.btnSecondaryText}>Criar conta</Text>
            </Pressable>

          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F1A',
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  logoShadow: {
    marginBottom: 26,
    borderRadius: 18,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 38,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    color: TEXT_SEC,
    textAlign: 'center',
    marginBottom: 34,
    lineHeight: 25,
    maxWidth: 330,
  },
  buttons: {
    width: '100%',
    maxWidth: 390,
    gap: 16,
  },
  btnPrimaryGlow: {
    width: '100%',
    borderRadius: 999,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 22,
    elevation: 14,
  },
  btnPrimaryHit: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  btnGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    fontSize: 17,
  },
  btnSecondary: {
    width: '100%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  btnSecondaryText: {
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    fontSize: 17,
  },
  pressed: {
    opacity: 0.8,
  },
});
