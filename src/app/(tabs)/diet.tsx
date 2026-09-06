import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useDiet } from '@/hooks/useDiet';
import { useMealLog } from '@/hooks/useMealLog';
import { MealCard } from '@/components/cards/MealCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatShortDate, getLocalDateString } from '@/utils/dates';

export default function DietScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, typography, spacing, radius, shadows } = useTheme();

  const { activeDiet, loading, reload: reloadDiet, deleteDiet, duplicateDiet, closeDiet } = useDiet();
  const { mealsWithStatus, reload: reloadMealLog, toggleMeal } = useMealLog(
    activeDiet?.meals,
  );

  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleEdit = () => {
    if (activeDiet) {
      router.push(`/diet/edit/${activeDiet.id}`);
    }
    setShowMenu(false);
  };

  const handleDuplicate = async () => {
    if (activeDiet) {
      try {
        await duplicateDiet(activeDiet.id, `${activeDiet.name} (Cópia)`);
        Alert.alert('Sucesso', 'Dieta duplicada com sucesso!');
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível duplicar a dieta.');
      }
    }
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (activeDiet) {
      try {
        await deleteDiet(activeDiet.id);
        Alert.alert('Sucesso', 'Dieta excluída com sucesso!');
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível excluir a dieta.');
      }
    }
    setShowDeleteConfirm(false);
    setShowMenu(false);
  };

  const handleClose = async () => {
    if (activeDiet) {
      try {
        await closeDiet(activeDiet.id, getLocalDateString());
        Alert.alert('Sucesso', 'Dieta encerrada!');
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível encerrar a dieta.');
      }
    }
    setShowMenu(false);
  };

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
          actionLabel="Criar Dieta"
          onAction={() => router.push('/diet/create')}
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
          <View style={styles.headerRow}>
            <Text style={[typography.displaySmall, { color: colors.primaryText }]}>
              Minha dieta
            </Text>
            <Pressable
              onPress={() => setShowMenu(!showMenu)}
              style={[styles.menuButton, { backgroundColor: colors.surface }]}
            >
              <Ionicons name="ellipsis-vertical" size={20} color={colors.primaryText} />
            </Pressable>
          </View>

          {/* Menu dropdown */}
          {showMenu && (
            <View style={[styles.menu, { backgroundColor: colors.surface, ...shadows.md }]}>
              <Pressable style={styles.menuItem} onPress={handleEdit}>
                <Ionicons name="pencil" size={18} color={colors.primary} />
                <Text style={[styles.menuText, { color: colors.primaryText }]}>Editar Dieta</Text>
              </Pressable>
              <Pressable style={styles.menuItem} onPress={handleDuplicate}>
                <Ionicons name="copy" size={18} color={colors.primary} />
                <Text style={[styles.menuText, { color: colors.primaryText }]}>Duplicar</Text>
              </Pressable>
              <Pressable style={styles.menuItem} onPress={handleClose}>
                <Ionicons name="pause-circle" size={18} color={colors.warning} />
                <Text style={[styles.menuText, { color: colors.primaryText }]}>Encerrar</Text>
              </Pressable>
              <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
              <Pressable style={styles.menuItem} onPress={() => setShowDeleteConfirm(true)}>
                <Ionicons name="trash" size={18} color={colors.error} />
                <Text style={[styles.menuText, { color: colors.error }]}>Excluir</Text>
              </Pressable>
            </View>
          )}

          <View style={[styles.dietInfo, { marginTop: spacing.lg }]}>
            <Text style={[typography.titleLarge, { color: colors.primaryText, marginBottom: spacing.sm }]}>
              {activeDiet.name}
            </Text>
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
            {activeDiet.notes && (
              <Text style={[typography.bodySmall, { color: colors.secondaryText, marginTop: spacing.sm, fontStyle: 'italic' }]}>
                {activeDiet.notes}
              </Text>
            )}
          </View>
        </View>

        {/* Meals */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['3xl'] }}>
          <View style={styles.sectionHeaderRow}>
            <SectionHeader title="REFEIÇÕES" />
            <Pressable
              onPress={() => router.push({ pathname: '/diet/meal/create', params: { dietId: activeDiet.id } })}
            >
              <Ionicons name="add-circle" size={28} color={colors.primary} />
            </Pressable>
          </View>
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

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Excluir Dieta"
        message="Tem certeza que deseja excluir esta dieta? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    position: 'absolute',
    right: 24,
    top: 60,
    borderRadius: 12,
    padding: 8,
    minWidth: 180,
    zIndex: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
  },
  dietInfo: {},
  caloriesBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
