import React, { useState, useCallback } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: (query: string) => void;
}

export function SearchInput({
  placeholder = 'Buscar...',
  value: controlledValue,
  onChangeText,
  onSearch,
}: SearchInputProps) {
  const { colors } = useTheme();
  const [internalValue, setInternalValue] = useState('');

  const value = controlledValue ?? internalValue;

  const handleChangeText = useCallback(
    (text: string) => {
      onChangeText?.(text);
      if (controlledValue === undefined) {
        setInternalValue(text);
      }
    },
    [controlledValue, onChangeText],
  );

  const handleEndEditing = useCallback(() => {
    onSearch?.(value);
  }, [onSearch, value]);

  const handleClear = useCallback(() => {
    onChangeText?.('');
    if (controlledValue === undefined) {
      setInternalValue('');
    }
    onSearch?.('');
  }, [controlledValue, onChangeText, onSearch]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TextInput
        style={[styles.input, { color: colors.primaryText }]}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={handleChangeText}
        onEndEditing={handleEndEditing}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={handleClear} style={styles.clearButton}>
          <View style={[styles.clearIcon, { backgroundColor: colors.muted }]}>
            <View style={[styles.clearX, { backgroundColor: colors.surface }]} />
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  clearIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearX: {
    width: 10,
    height: 2,
    borderRadius: 1,
    position: 'absolute',
  },
});
