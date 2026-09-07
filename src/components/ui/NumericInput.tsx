import React, { useState, useCallback } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

interface NumericInputProps {
  value?: number;
  onValueChange?: (value: number) => void;
  placeholder?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function NumericInput({
  value: controlledValue,
  onValueChange,
  placeholder = '0',
  unit,
  min,
  max,
  step = 1,
}: NumericInputProps) {
  const { colors } = useTheme();
  const [internalValue, setInternalValue] = useState('');

  const displayValue = controlledValue !== undefined ? String(controlledValue) : internalValue;

  const parseValue = useCallback((text: string): number | null => {
    const cleaned = text.replace(',', '.').replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }, []);

  const handleChangeText = useCallback(
    (text: string) => {
      const filtered = text.replace(/[^0-9.,\-]/g, '');
      setInternalValue(filtered);

      const parsed = parseValue(filtered);
      if (parsed !== null) {
        onValueChange?.(parsed);
      }
    },
    [onValueChange, parseValue],
  );

  const handleIncrement = useCallback(() => {
    const current = parseValue(displayValue) ?? 0;
    const newValue = current + step;
    if (max !== undefined && newValue > max) return;
    setInternalValue(String(newValue));
    onValueChange?.(newValue);
  }, [displayValue, step, max, parseValue, onValueChange]);

  const handleDecrement = useCallback(() => {
    const current = parseValue(displayValue) ?? 0;
    const newValue = current - step;
    if (min !== undefined && newValue < min) return;
    setInternalValue(String(newValue));
    onValueChange?.(newValue);
  }, [displayValue, step, min, parseValue, onValueChange]);

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={handleDecrement}
      >
        <Text style={[styles.buttonText, { color: colors.primaryText }]}>−</Text>
      </Pressable>
      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.primaryText }]}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          value={displayValue}
          onChangeText={handleChangeText}
          keyboardType="numeric"
          selectTextOnFocus
        />
        {unit && (
          <Text style={[styles.unit, { color: colors.muted }]}>{unit}</Text>
        )}
      </View>
      <Pressable
        style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={handleIncrement}
      >
        <Text style={[styles.buttonText, { color: colors.primaryText }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    padding: 0,
  },
  unit: {
    fontSize: 14,
    marginLeft: 4,
  },
});
