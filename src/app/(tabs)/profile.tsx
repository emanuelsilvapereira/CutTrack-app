import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useUser } from '@/hooks/useUser';
import { useWeight } from '@/hooks/useWeight';
import { useDiet } from '@/hooks/useDiet';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { LoadingState } from '@/components/ui/LoadingState';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, typography, spacing, radius, shadows } = useTheme();

  const { user, loading: userLoading, reload: reloadUser } = useUser();
  const { stats, reload: reloadWeight } = useWeight(user?.initialWeight ?? 117, user?.goalWeight ?? 90);
  const { activeDiet, reload: reloadDiet } = useDiet();

  const [refreshing, setRefreshing] = React.useState(false);

  const reload = useCallback(async () => {
    await Promise.all([reloadUser(), reloadWeight(), reloadDiet()]);
  }, [reloadUser, reloadWeight, reloadDiet]);

  const reloadRef = React.useRef(reload);
  reloadRef.current = reload;

  useFocusEffect(
    useCallback(() => {
      reloadRef.current();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  if (userLoading && !refreshing) {
    return <LoadingState fullScreen />;
  }

  const unit = user?.weightUnit ?? 'kg';

  const profileItems = [
    { label: 'Peso inicial', value: `${user?.initialWeight?.toFixed(1) ?? '—'} ${unit}` },
    { label: 'Peso atual', value: stats?.current ? `${stats.current.toFixed(1)} ${unit}` : '—' },
    { label: 'Peso objetivo', value: `${user?.goalWeight?.toFixed(1) ?? '—'} ${unit}` },
    { label: 'Calorias atuais', value: activeDiet?.calories ? `${activeDiet.calories} kcal` : '—' },
  ];

  const menuItems: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }> = [
    { icon: 'resize-outline', label: 'Medidas corporais', onPress: () => router.push('/measurement/add') },
    { icon: 'nutrition-outline', label: 'Histórico de dietas', onPress: () => router.push('/diet/history') },
    { icon: 'settings-outline', label: 'Configurações', onPress: () => router.push('/settings') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: spacing['5xl'] },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={{ paddingHorizontal: spacing.xl }}>
          <Text style={[typography.displaySmall, { color: colors.primaryText }]}>
            Perfil
          </Text>
        </View>

        {/* Avatar / Name */}
        <View style={[styles.nameSection, { paddingHorizontal: spacing.xl, marginTop: spacing['2xl'] }]}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: colors.primaryLight,
                borderRadius: radius.full,
                width: 64,
                height: 64,
              },
            ]}
          >
            <Ionicons name="person" size={28} color={colors.primary} />
          </View>
          <View style={{ marginLeft: spacing.lg }}>
            <Text style={[typography.headlineLarge, { color: colors.primaryText }]}>
              {user?.name || 'Seu nome'}
            </Text>
            {stats?.progress !== undefined && (
              <Text style={[typography.bodyMedium, { color: colors.secondaryText, marginTop: 2 }]}>
                {Math.round(stats.progress * 100)}% da meta atingida
              </Text>
            )}
          </View>
        </View>

        {/* Profile Stats */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['3xl'] }}>
          <SectionHeader title="DADOS PESSOAIS" />
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                ...shadows.sm,
                overflow: 'hidden',
              },
            ]}
          >
            {profileItems.map((item, index) => (
              <View
                key={item.label}
                style={[
                  styles.infoRow,
                  {
                    padding: spacing.lg,
                    borderBottomWidth: index < profileItems.length - 1 ? 1 : 0,
                    borderBottomColor: colors.borderLight,
                  },
                ]}
              >
                <Text style={[typography.bodyMedium, { color: colors.secondaryText }]}>
                  {item.label}
                </Text>
                <Text style={[typography.titleMedium, { color: colors.primaryText }]}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['3xl'] }}>
          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                ...shadows.sm,
                overflow: 'hidden',
              },
            ]}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                onPress={item.onPress}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                style={[
                  styles.menuRow,
                  {
                    padding: spacing.lg,
                    borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                    borderBottomColor: colors.borderLight,
                  },
                ]}
              >
                <Ionicons name={item.icon} size={20} color={colors.secondaryText} />
                <Text style={[typography.bodyLarge, { color: colors.primaryText, flex: 1, marginLeft: spacing.md }]}>
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </TouchableOpacity>
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
  },
  content: {},
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuCard: {},
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
