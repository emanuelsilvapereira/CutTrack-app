import React, { useState, useEffect } from 'react';
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
import { useFood } from '@/hooks/useFood';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { NumericInput } from '@/components/ui/NumericInput';
import type { Food } from '@/types';

export default function FoodDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const foodId = parseInt(id || '0');

  const { getFoodById, updateFood, deleteFood } = useFood();

  const [food, setFood] = useState<Food | null>(null);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState<number | null>(null);
  const [protein, setProtein] = useState<number | null>(null);
  const [carbs, setCarbs] = useState<number | null>(null);
  const [fat, setFat] = useState<number | null>(null);
  const [defaultUnit, setDefaultUnit] = useState('g');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFood();
  }, [foodId]);

  const loadFood = async () => {
    try {
      setLoading(true);
      const data = await getFoodById(foodId);
      if (data) {
        setFood(data);
        setName(data.name);
        setCalories(data.calories);
        setProtein(data.protein);
        setCarbs(data.carbs);
        setFat(data.fat);
        setDefaultUnit(data.defaultUnit);
      }
    } catch (e) {
      console.error('Load food error:', e);
    } finally {
      setLoading(false);
    }
  };

  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave || !food) return;

    try {
      setSaving(true);
      await updateFood(food.id, {
        name: name.trim(),
        calories,
        protein,
        carbs,
        fat,
        defaultUnit,
      });
      router.back();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar o alimento.');
      console.error('Update food error:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!food) return;

    Alert.alert(
      'Excluir Alimento',
      `Tem certeza que deseja excluir "${food.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteFood(food.id);
            if (success) {
              router.back();
            } else {
              Alert.alert('Aviso', 'Este alimento está sendo usado em uma refeição e não pode ser excluído.');
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.secondaryText }}>Carregando...</Text>
      </View>
    );
  }

  if (!food) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.secondaryText }}>Alimento não encontrado</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Editar Alimento',
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
          title="Salvar Alterações"
          onPress={handleSave}
          disabled={!canSave || saving}
          loading={saving}
          style={styles.saveButton}
        />

        <PrimaryButton
          title="Excluir Alimento"
          onPress={handleDelete}
          variant="outline"
          style={styles.deleteButton}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  deleteButton: {
    marginTop: 12,
  },
});
