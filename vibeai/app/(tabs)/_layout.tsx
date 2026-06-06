import { Tabs, router } from 'expo-router';
import { ColorValue, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/constants/theme';

type IconName = 'home' | 'plus' | 'profile';
type TabRoute = {
  key: string;
  name: string;
  params?: object;
};
type CustomTabBarProps = {
  state: {
    index: number;
    routes: TabRoute[];
  };
};

const TABS = [
  { routeName: 'index', href: '/(tabs)', label: 'Home', icon: 'home' },
  { routeName: 'create-vibe', href: '/(tabs)/create-vibe', label: 'Criar Vibe', icon: 'plus' },
  { routeName: 'profile', href: '/(tabs)/profile', label: 'Perfil', icon: 'profile' },
] as const;

function CustomTabBar({ state }: CustomTabBarProps) {
  const currentRouteName = state.routes[state.index]?.name;

  return (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const focused =
          currentRouteName === tab.routeName ||
          currentRouteName?.startsWith(`${tab.routeName}/`);
        const color = focused ? colors.primary : colors.textSecondary;

        const onPress = () => {
          if (!focused) router.replace(tab.href as any);
        };

        return (
          <Pressable
            key={tab.routeName}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            onPress={onPress}
            style={({ pressed }) => [
              styles.tabItem,
              pressed && styles.pressed,
            ]}
          >
            <TabSvgIcon name={tab.icon} color={color} />
            <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TabSvgIcon({ name, color }: { name: IconName; color: ColorValue }) {
  if (name === 'home') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M3 10.5L12 3l9 7.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M5 10v10h14V10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M9 20v-6h6v6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (name === 'plus') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
        <Path d="M12 8v8M8 12h8" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={2} />
      <Path d="M4 21c1.2-4 4-6 8-6s6.8 2 8 6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="create-vibe" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 8,
    paddingBottom: 10,
  },
  tabItem: {
    width: '33.3333%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 13,
    color: colors.textSecondary,
  },
  tabLabelFocused: {
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
  },
  pressed: {
    opacity: 0.75,
  },
});
