import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Não foi possível carregar os dados.',
  onRetry,
}: ErrorStateProps) {
  const { colors, typography, spacing, radius } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.muted} />
      <Text
        style={[
          typography.bodyLarge,
          { color: colors.secondaryText, textAlign: 'center', marginTop: spacing.lg },
        ]}
      >
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Tentar novamente"
          style={[
            styles.retryButton,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              marginTop: spacing.xl,
            },
          ]}
        >
          <Text style={[typography.labelMedium, { color: colors.primary }]}>
            Tentar novamente
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
  retryButton: {},
});
