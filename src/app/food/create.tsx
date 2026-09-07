import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '@/theme';
import { useFood } from '@/hooks/useFood';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { NumericInput } from '@/components/ui/NumericInput';
import type { Food } from '@/types';

export default function CreateFoodScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { addFood: createFood } = useFood();

  const [name, setName] = useState('');
  const [calories, setCalories] = useState<number | null>(null);
  const [protein, setProtein] = useState<number | null>(null);
  const [carbs, setCarbs] = useState<number | null>(null);
  const [fat, setFat] = useState<number | null>(null);
  const [defaultUnit, setDefaultUnit] = useState('g');
  const [loading, setLoading] = useState(false);

  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;

    try {
      setLoading(true);
      await createFood({
        name: name.trim(),
        calories,
        protein,
        carbs,
        fat,
        defaultUnit,
      } as any);
      router.back();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível criar o alimento.');
      console.error('CreateFood error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Novo Alimento',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primaryText,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>Nome do alimento</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
            placeholder="Ex: Peito de Frango"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>Unidade padrão</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
            placeholder="g"
            placeholderTextColor={colors.muted}
            value={defaultUnit}
            onChangeText={setDefaultUnit}
          />
        </View>

        <View style={[styles.nutritionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.nutritionTitle, { color: colors.primaryText }]}>Valores por 100{defaultUnit}</Text>
          
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondaryText }]}>Calorias (kcal)</Text>
            <NumericInput
              value={calories ?? undefined}
              onValueChange={(v) => setCalories(v)}
              unit="kcal"
              min={0}
              step={10}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondaryText }]}>Proteína (g)</Text>
            <NumericInput
              value={protein ?? undefined}
              onValueChange={(v) => setProtein(v)}
              unit="g"
              min={0}
              step={1}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondaryText }]}>Carboidratos (g)</Text>
            <NumericInput
              value={carbs ?? undefined}
              onValueChange={(v) => setCarbs(v)}
              unit="g"
              min={0}
              step={1}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondaryText }]}>Gordura (g)</Text>
            <NumericInput
              value={fat ?? undefined}
              onValueChange={(v) => setFat(v)}
              unit="g"
              min={0}
              step={1}
            />
          </View>
        </View>

        <PrimaryButton
          title="Criar Alimento"
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
    paddingBottom: 48,
  },
  field: {
    marginBottom: 20,
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
  nutritionCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
  },
});
