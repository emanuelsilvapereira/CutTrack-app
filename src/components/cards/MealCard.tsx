import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { MealWithStatus } from '@/types';
import { formatTime } from '@/utils/dates';

interface MealCardProps {
  meal: MealWithStatus;
  compact?: boolean;
  onPress?: () => void;
  onToggle?: () => void;
}

export function MealCard({ meal, compact = false, onPress, onToggle }: MealCardProps) {
  const { colors, typography, spacing, radius, shadows } = useTheme();

  const isCompleted = meal.log?.completed ?? false;

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${meal.name}, ${isCompleted ? 'concluída' : 'pendente'}`}
      >
        <View
          style={[
            styles.compactCard,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              padding: spacing.lg,
              ...shadows.sm,
              borderLeftWidth: 3,
              borderLeftColor: isCompleted ? colors.success : colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={onToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isCompleted }}
            accessibilityLabel={`Marcar ${meal.name} como ${isCompleted ? 'pendente' : 'concluída'}`}
          >
            <Ionicons
              name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={isCompleted ? colors.success : colors.muted}
            />
          </TouchableOpacity>
          <View style={[styles.compactInfo, { marginLeft: spacing.md }]}>
            <Text
              style={[
                typography.titleMedium,
                {
                  color: isCompleted ? colors.secondaryText : colors.primaryText,
                  textDecorationLine: isCompleted ? 'line-through' : 'none',
                },
              ]}
            >
              {meal.name}
            </Text>
            <Text style={[typography.bodySmall, { color: colors.muted }]}>
              {formatTime(meal.time)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </View>
      </TouchableOpacity>
    );
  }

  // Full card for Diet screen
  const totalCalories = meal.foods.reduce((sum, f) => sum + (f.calories ?? 0), 0);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${meal.name} às ${meal.time}`}
    >
      <View
        style={[
          styles.fullCard,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            padding: spacing.xl,
            ...shadows.sm,
          },
        ]}
      >
        {/* Time & Name */}
        <View style={styles.headerRow}>
          <Text style={[typography.labelMedium, { color: colors.muted }]}>
            {formatTime(meal.time)}
          </Text>
          {isCompleted && (
            <View style={[styles.completedBadge, { backgroundColor: colors.successLight, borderRadius: radius.sm }]}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={[typography.labelMedium, { color: colors.success, marginLeft: 4 }]}>
                Concluída
              </Text>
            </View>
          )}
        </View>

        <Text style={[typography.headlineSmall, { color: colors.primaryText, marginTop: spacing.xs }]}>
          {meal.name}
        </Text>

        {/* Foods preview */}
        {meal.foods.length > 0 && (
          <View style={{ marginTop: spacing.md }}>
            {meal.foods.map((food) => (
              <Text
                key={food.id}
                style={[typography.bodyMedium, { color: colors.secondaryText, marginTop: 2 }]}
              >
                {food.quantity ? `${food.quantity}${food.unit ? ` ${food.unit}` : ''} ` : ''}
                {food.name}
              </Text>
            ))}
          </View>
        )}

        {/* Calories */}
        {totalCalories > 0 && (
          <Text style={[typography.bodySmall, { color: colors.muted, marginTop: spacing.md }]}>
            ≈ {totalCalories} kcal
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactInfo: {
    flex: 1,
  },
  fullCard: {},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
