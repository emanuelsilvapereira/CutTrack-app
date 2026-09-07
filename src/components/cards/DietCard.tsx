import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import type { Diet } from '@/types';

interface DietCardProps {
  diet: Diet;
  isActive?: boolean;
  onPress?: (diet: Diet) => void;
  onLongPress?: (diet: Diet) => void;
}

export function DietCard({ diet, isActive = false, onPress, onLongPress }: DietCardProps) {
  const { colors } = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: isActive ? colors.primary : colors.border },
        isActive && styles.activeBorder,
      ]}
      onPress={() => onPress?.(diet)}
      onLongPress={() => onLongPress?.(diet)}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: colors.primaryText }]} numberOfLines={1}>
            {diet.name}
          </Text>
          {isActive && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.badgeText, { color: colors.white }]}>Ativa</Text>
            </View>
          )}
        </View>
        {diet.calories && (
          <Text style={[styles.calories, { color: colors.primary }]}>
            {diet.calories} kcal/dia
          </Text>
        )}
      </View>

      <View style={styles.dates}>
        <Text style={[styles.dateText, { color: colors.muted }]}>
          {formatDate(diet.startDate)}
        </Text>
        {diet.endDate && (
          <>
            <Text style={[styles.dateSeparator, { color: colors.muted }]}> → </Text>
            <Text style={[styles.dateText, { color: colors.muted }]}>
              {formatDate(diet.endDate)}
            </Text>
          </>
        )}
      </View>

      {diet.notes && (
        <Text style={[styles.notes, { color: colors.muted }]} numberOfLines={2}>
          {diet.notes}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  activeBorder: {
    borderWidth: 2,
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  calories: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  dates: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
  },
  dateSeparator: {
    fontSize: 13,
  },
  notes: {
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
