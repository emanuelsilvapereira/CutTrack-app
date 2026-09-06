import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useUser } from '@/hooks/useUser';
import { useWeight } from '@/hooks/useWeight';
import { useDiet } from '@/hooks/useDiet';
import { useMealLog } from '@/hooks/useMealLog';
import { WeightCard } from '@/components/cards/WeightCard';
import { MealCard } from '@/components/cards/MealCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { getGreeting, formatFriendlyDate, formatTime } from '@/utils/dates';

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, typography, spacing, radius, shadows } = useTheme();

  const { user, loading: userLoading, reload: reloadUser } = useUser();
  const { stats, loading: weightLoading, reload: reloadWeight } = useWeight(
    user?.initialWeight ?? 117,
    user?.goalWeight ?? 90,
  );
  const { activeDiet, loading: dietLoading, reload: reloadDiet } = useDiet();
  const { mealsWithStatus, nextMeal, allCompleted, adherence, loading: mealLogLoading, reload: reloadMealLog, toggleMeal } = useMealLog(
    activeDiet?.meals,
  );

  const loading = userLoading || weightLoading || dietLoading;
  const [refreshing, setRefreshing] = React.useState(false);

  const reload = useCallback(async () => {
    await Promise.all([reloadUser(), reloadWeight(), reloadDiet(), reloadMealLog()]);
  }, [reloadUser, reloadWeight, reloadDiet, reloadMealLog]);

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
        <View style={[styles.header, { paddingHorizontal: spacing.xl }]}>
          <View>
            <Text style={[typography.headlineMedium, { color: colors.primaryText }]}>
              {getGreeting()}
            </Text>
            {user?.name ? (
              <Text style={[typography.displaySmall, { color: colors.primaryText, marginTop: 2 }]}>
                {user.name}
              </Text>
            ) : null}
            <Text style={[typography.bodyMedium, { color: colors.secondaryText, marginTop: spacing.xs }]}>
              {formatFriendlyDate()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/weight/add')}
            accessibilityLabel="Registrar peso"
            accessibilityRole="button"
            style={[
              styles.addButton,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.full,
                width: 44,
                height: 44,
              },
            ]}
          >
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Weight Card */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['2xl'] }}>
          {stats && (
            <WeightCard
              stats={stats}
              unit={user?.weightUnit ?? 'kg'}
              onPress={() => router.push('/weight/add')}
            />
          )}
        </View>

        {/* Meals */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['3xl'] }}>
          <SectionHeader title="REFEIÇÕES DE HOJE" />

          {mealsWithStatus.length > 0 ? (
            <View style={{ gap: spacing.sm }}>
              {mealsWithStatus.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  compact
                  onPress={() => router.push(`/meal/${meal.id}`)}
                  onToggle={() => toggleMeal(meal.id)}
                />
              ))}
            </View>
          ) : (
            <View style={[styles.emptyMeals, { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.xl }]}>
              <Text style={[typography.bodyMedium, { color: colors.secondaryText, textAlign: 'center' }]}>
                Nenhuma dieta ativa.{'\n'}Configure uma dieta para ver suas refeições.
              </Text>
            </View>
          )}
        </View>

        {/* Next Meal */}
        {mealsWithStatus.length > 0 && (
          <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['2xl'] }}>
            <SectionHeader title="PRÓXIMA REFEIÇÃO" />
            <View style={[styles.nextMealCard, { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, ...shadows.sm }]}>
              {allCompleted ? (
                <View style={styles.allCompletedRow}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={[typography.bodyLarge, { color: colors.success, marginLeft: spacing.sm }]}>
                    Todas as refeições de hoje foram concluídas!
                  </Text>
                </View>
              ) : nextMeal ? (
                <TouchableOpacity
                  onPress={() => router.push(`/meal/${nextMeal.id}`)}
                  activeOpacity={0.7}
                >
                  <Text style={[typography.labelSmall, { color: colors.muted }]}>
                    {formatTime(nextMeal.time)}
                  </Text>
                  <Text style={[typography.headlineSmall, { color: colors.primaryText, marginTop: spacing.xs }]}>
                    {nextMeal.name}
                  </Text>
                  <View style={[styles.nextMealAction, { marginTop: spacing.md }]}>
                    <Text style={[typography.labelMedium, { color: colors.primary }]}>
                      Ver refeição
                    </Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                  </View>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}

        {/* Adherence */}
        {adherence && (
          <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['2xl'] }}>
            <SectionHeader title="ADERÊNCIA" />
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={[styles.adherenceCard, { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, ...shadows.sm }]}>
                <Text style={[typography.numberSmall, { color: colors.primaryText }]}>
                  {adherence.daysCompleted} / {adherence.daysTotal}
                </Text>
                <Text style={[typography.bodySmall, { color: colors.secondaryText, marginTop: 2 }]}>
                  dias
                </Text>
                <Text style={[typography.labelMedium, { color: colors.primary, marginTop: spacing.xs }]}>
                  {adherence.daysPercentage}%
                </Text>
              </View>
              <View style={[styles.adherenceCard, { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, ...shadows.sm }]}>
                <Text style={[typography.numberSmall, { color: colors.primaryText }]}>
                  {adherence.mealsCompleted} / {adherence.mealsTotal}
                </Text>
                <Text style={[typography.bodySmall, { color: colors.secondaryText, marginTop: 2 }]}>
                  refeições
                </Text>
                <Text style={[typography.labelMedium, { color: colors.primary, marginTop: spacing.xs }]}>
                  {adherence.mealsPercentage}%
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMeals: {},
  nextMealCard: {},
  nextMealAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  allCompletedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adherenceCard: {
    flex: 1,
  },
});
