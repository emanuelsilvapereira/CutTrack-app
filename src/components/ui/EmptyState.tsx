import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors, typography, spacing, radius } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.muted} />
      <Text
        style={[
          typography.headlineSmall,
          { color: colors.primaryText, textAlign: 'center', marginTop: spacing.xl },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          typography.bodyMedium,
          { color: colors.secondaryText, textAlign: 'center', marginTop: spacing.sm, maxWidth: 280 },
        ]}
      >
        {message}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.primary,
              borderRadius: radius.md,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              marginTop: spacing['2xl'],
            },
          ]}
        >
          <Text style={[typography.labelMedium, { color: colors.white }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  actionButton: {},
});
