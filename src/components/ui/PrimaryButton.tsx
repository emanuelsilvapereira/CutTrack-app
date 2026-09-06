import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'filled' | 'outline';
}

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'filled',
}: PrimaryButtonProps) {
  const { colors, typography, radius, componentSizes } = useTheme();

  const isFilled = variant === 'filled';
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
      style={[
        styles.button,
        {
          height: componentSizes.buttonHeight,
          borderRadius: radius.md,
          backgroundColor: isFilled
            ? isDisabled
              ? colors.muted
              : colors.primary
            : 'transparent',
          borderWidth: isFilled ? 0 : 2,
          borderColor: colors.primary,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isFilled ? colors.white : colors.primary} />
      ) : (
        <Text
          style={[
            typography.titleMedium,
            {
              color: isFilled ? colors.white : colors.primary,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
