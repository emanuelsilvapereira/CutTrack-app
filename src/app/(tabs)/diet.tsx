import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/theme';
import { useDiet } from '@/hooks/useDiet';
import { useMealLog } from '@/hooks/useMealLog';
import { MealCard } from '@/components/cards/MealCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatShortDate } from '@/utils/dates';

export default function DietScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, typography, spacing, radius, shadows } = useTheme();

  const { activeDiet, loading, reload: reloadDiet } = useDiet();
  const { mealsWithStatus, reload: reloadMealLog, toggleMeal } = useMealLog(
    activeDiet?.meals,
  );

  const [refreshing, setRefreshing] = React.useState(false);

  const reload = useCallback(async () => {
    await Promise.all([reloadDiet(), reloadMealLog()]);
  }, [reloadDiet, reloadMealLog]);

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

  if (loading && !refreshing) {
    return <LoadingState fullScreen />;
  }

  if (!activeDiet) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <EmptyState
          icon="restaurant-outline"
          title="Nenhuma dieta ativa"
          message="Adicione uma dieta para ver suas refeições e acompanhar seu progresso."
        />
      </View>
    );
  }

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
            Minha dieta
          </Text>

          <View style={[styles.dietInfo, { marginTop: spacing.lg }]}>
            {activeDiet.calories && (
              <View style={[styles.caloriesBadge, { backgroundColor: colors.primaryLight, borderRadius: radius.sm }]}>
                <Text style={[typography.titleMedium, { color: colors.primary }]}>
                  {activeDiet.calories} kcal
                </Text>
              </View>
            )}
            <Text style={[typography.bodySmall, { color: colors.secondaryText, marginTop: spacing.sm }]}>
              Desde {formatShortDate(activeDiet.startDate)}
            </Text>
          </View>
        </View>

        {/* Meals */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['3xl'] }}>
          <SectionHeader title="REFEIÇÕES" />
          <View style={{ gap: spacing.lg }}>
            {mealsWithStatus.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onPress={() => router.push(`/meal/${meal.id}`)}
                onToggle={() => toggleMeal(meal.id)}
              />
            ))}
          </View>
        </View>

        {/* Diet History Link */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['3xl'] }}>
          <SectionHeader
            title="HISTÓRICO"
            right={
              <Text
                onPress={() => router.push('/diet/history')}
                style={[typography.labelMedium, { color: colors.primary }]}
              >
                Ver tudo →
              </Text>
            }
          />
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
  dietInfo: {},
  caloriesBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
