import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  color?: string;
}

export function StatCard({ label, value, subtitle, color }: StatCardProps) {
  const { colors, typography, spacing, radius, shadows } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          padding: spacing.lg,
          ...shadows.sm,
        },
      ]}
    >
      <Text style={[typography.numberSmall, { color: color ?? colors.primaryText }]}>
        {value}
      </Text>
      <Text style={[typography.bodySmall, { color: colors.secondaryText, marginTop: 2 }]}>
        {label}
      </Text>
      {subtitle && (
        <Text style={[typography.bodySmall, { color: colors.muted, marginTop: 2 }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
});
