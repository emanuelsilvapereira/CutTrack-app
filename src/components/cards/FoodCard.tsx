import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import type { Food } from '@/types';

interface FoodCardProps {
  food: Food;
  onPress?: (food: Food) => void;
  onLongPress?: (food: Food) => void;
  compact?: boolean;
}

export function FoodCard({ food, onPress, onLongPress, compact = false }: FoodCardProps) {
  const { colors } = useTheme();

  if (compact) {
    return (
      <Pressable
        style={[styles.compactContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => onPress?.(food)}
        onLongPress={() => onLongPress?.(food)}
      >
        <Text style={[styles.compactName, { color: colors.primaryText }]} numberOfLines={1}>
          {food.name}
        </Text>
        <Text style={[styles.compactCalories, { color: colors.primary }]}>
          {food.calories ? `${Math.round(food.calories)} kcal` : '—'}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => onPress?.(food)}
      onLongPress={() => onLongPress?.(food)}
    >
      <View style={styles.header}>
        <Text style={[styles.name, { color: colors.primaryText }]} numberOfLines={1}>
          {food.name}
        </Text>
        <Text style={[styles.unit, { color: colors.muted }]}>
          por {food.defaultUnit}
        </Text>
      </View>

      <View style={styles.macros}>
        <MacroItem label="Calorias" value={food.calories} unit="kcal" color={colors.primary} />
        <MacroItem label="Proteína" value={food.protein} unit="g" color={colors.success} />
        <MacroItem label="Carbos" value={food.carbs} unit="g" color={colors.warning} />
        <MacroItem label="Gordura" value={food.fat} unit="g" color={colors.error} />
      </View>
    </Pressable>
  );
}

function MacroItem({ label, value, color }: {
  label: string;
  value: number | null;
  unit: string;
  color: string;
}) {
  return (
    <View style={styles.macroItem}>
      <Text style={[styles.macroValue, { color }]}>
        {value !== null ? `${value.toFixed(1)}` : '—'}
      </Text>
      <Text style={[styles.macroLabel, { color: '#8E8E93' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  unit: {
    fontSize: 12,
    marginLeft: 8,
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  macroLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  compactCalories: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
});
