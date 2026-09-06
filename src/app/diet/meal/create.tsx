import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '@/theme';
import { mealRepository } from '@/database/repositories';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export default function CreateMealScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { dietId } = useLocalSearchParams<{ dietId: string }>();

  const [name, setName] = useState('');
  const [time, setTime] = useState('12:00');
  const [loading, setLoading] = useState(false);

  const canSave = name.trim().length > 0 && time.length === 5;

  const handleSave = async () => {
    if (!canSave || !dietId) return;

    try {
      setLoading(true);
      await mealRepository.create(parseInt(dietId), {
        name: name.trim(),
        time,
        order: 0,
      });
      router.back();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível criar a refeição.');
      console.error('CreateMeal error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nova Refeição',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primaryText,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>Nome da refeição</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
            placeholder="Ex: Almoço"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>Horário</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
            placeholder="12:00"
            placeholderTextColor={colors.muted}
            value={time}
            onChangeText={setTime}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <PrimaryButton
          title="Criar Refeição"
          onPress={handleSave}
          disabled={!canSave || loading}
          loading={loading}
          style={styles.saveButton}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 16,
  },
});
