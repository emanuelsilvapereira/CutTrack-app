import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, View } from 'react-native';
import { useTheme } from '@/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'filled' | 'outline';
  style?: ViewStyle;
  icon?: React.ReactNode;
  textColor?: string;
}

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'filled',
  style,
  icon,
  textColor,
}: PrimaryButtonProps) {
  const { colors, typography, radius, componentSizes } = useTheme();

  const isFilled = variant === 'filled';
  const isDisabled = disabled || loading;
  
  const resolvedTextColor = textColor || (isFilled ? colors.white : colors.primary);

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
          borderColor: textColor || colors.primary,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={resolvedTextColor} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text
            style={[
              typography.titleMedium,
              {
                color: resolvedTextColor,
              },
            ]}
          >
            {title}
          </Text>
        </View>
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
