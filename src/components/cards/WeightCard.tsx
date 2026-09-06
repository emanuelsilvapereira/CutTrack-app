import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { WeightStats } from '@/types';

interface WeightCardProps {
  stats: WeightStats;
  unit?: string;
  onPress?: () => void;
}

export function WeightCard({ stats, unit = 'kg', onPress }: WeightCardProps) {
  const { colors, typography, spacing, radius, shadows } = useTheme();

  const progressPercent = Math.round(stats.progress * 100);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Peso atual: ${stats.current?.toFixed(1) ?? '—'} ${unit}`}
      disabled={!onPress}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            padding: spacing.xl,
            ...shadows.md,
          },
        ]}
      >
        {/* Label */}
        <Text style={[typography.labelSmall, { color: colors.muted }]}>
          PESO ATUAL
        </Text>

        {/* Big number */}
        <View style={styles.weightRow}>
          <Text style={[typography.number, { color: colors.primaryText }]}>
            {stats.current?.toFixed(1) ?? '—'}
          </Text>
          <Text style={[typography.headlineMedium, { color: colors.secondaryText, marginLeft: 6 }]}>
            {unit}
          </Text>
        </View>

        {/* Weekly change */}
        {stats.weeklyChange !== null && (
          <View style={styles.changeRow}>
            <Ionicons
              name={stats.weeklyChange <= 0 ? 'arrow-down' : 'arrow-up'}
              size={14}
              color={stats.weeklyChange <= 0 ? colors.success : colors.error}
            />
            <Text
              style={[
                typography.bodyMedium,
                {
                  color: stats.weeklyChange <= 0 ? colors.success : colors.error,
                  marginLeft: 4,
                },
              ]}
            >
              {Math.abs(stats.weeklyChange).toFixed(1)} {unit} esta semana
            </Text>
          </View>
        )}

        {/* Progress bar */}
        <View style={[styles.progressSection, { marginTop: spacing.xl }]}>
          <View style={styles.progressLabelRow}>
            <Text style={[typography.bodySmall, { color: colors.secondaryText }]}>
              Progresso
            </Text>
            <Text style={[typography.labelMedium, { color: colors.primary }]}>
              {progressPercent}%
            </Text>
          </View>
          <View
            style={[
              styles.progressTrack,
              {
                backgroundColor: colors.borderLight,
                borderRadius: radius.full,
                height: 6,
                marginTop: spacing.sm,
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radius.full,
                  width: `${Math.min(100, progressPercent)}%`,
                  height: '100%',
                },
              ]}
            />
          </View>
        </View>

        {/* Goal info */}
        <View style={[styles.goalRow, { marginTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.lg }]}>
          <View style={styles.goalItem}>
            <Text style={[typography.bodySmall, { color: colors.muted }]}>Inicial</Text>
            <Text style={[typography.titleMedium, { color: colors.primaryText }]}>
              {stats.initial.toFixed(1)}
            </Text>
          </View>
          <View style={styles.goalItem}>
            <Text style={[typography.bodySmall, { color: colors.muted }]}>Meta</Text>
            <Text style={[typography.titleMedium, { color: colors.primary }]}>
              {stats.goal.toFixed(1)}
            </Text>
          </View>
          <View style={styles.goalItem}>
            <Text style={[typography.bodySmall, { color: colors.muted }]}>Faltam</Text>
            <Text style={[typography.titleMedium, { color: colors.primaryText }]}>
              {stats.remaining.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {},
  weightRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  progressSection: {},
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTrack: {
    overflow: 'hidden',
  },
  progressFill: {},
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalItem: {
    alignItems: 'center',
  },
});
