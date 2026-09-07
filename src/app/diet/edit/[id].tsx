import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '@/theme';
import { useDietEditor } from '@/hooks/useDietEditor';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { NumericInput } from '@/components/ui/NumericInput';
import { calculateDietTotals } from '@/utils/calculations';

export default function EditDietScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dietId = parseInt(id || '0');

  const {
    diet,
    loading,
    loadDiet,
    updateDietDetails,
    addMeal,
    removeMeal,
  } = useDietEditor();

  const meals = diet?.meals ?? [];
  const totalNutrition = diet ? calculateDietTotals(diet.meals) : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const [name, setName] = useState('');
  const [calories, setCalories] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (dietId) {
      loadDiet(dietId);
    }
  }, [dietId, loadDiet]);

  useEffect(() => {
    if (diet) {
      setName(diet.name);
      setCalories(diet.calories);
      setNotes(diet.notes ?? '');
    }
  }, [diet]);

  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;

    try {
      setSaving(true);
      await updateDietDetails(dietId, {
        name: name.trim(),
        calories,
        notes: notes || null,
      });
      router.back();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar a dieta.');
      console.error('EditDiet error:', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !diet) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.secondaryText }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Editar Dieta',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primaryText,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>Nome da dieta</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
            placeholder="Ex: Dieta Keto"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>Meta calórica diária</Text>
          <NumericInput
            value={calories ?? undefined}
            onValueChange={(v) => setCalories(v)}
            unit="kcal"
            min={0}
            step={50}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>Observações</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
            placeholder="Notas sobre a dieta..."
            placeholderTextColor={colors.muted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Resumo nutricional */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.primaryText }]}>Resumo Nutricional</Text>
          <View style={styles.summaryRow}>
            <SummaryItem label="Calorias" value={`${Math.round(totalNutrition.calories)} kcal`} color={colors.primary} />
            <SummaryItem label="Proteína" value={`${totalNutrition.protein.toFixed(1)}g`} color={colors.success} />
            <SummaryItem label="Carbos" value={`${totalNutrition.carbs.toFixed(1)}g`} color={colors.warning} />
            <SummaryItem label="Gordura" value={`${totalNutrition.fat.toFixed(1)}g`} color={colors.error} />
          </View>
        </View>

        {/* Lista de refeições */}
        <View style={styles.mealsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Refeições ({meals.length})</Text>
            <Pressable onPress={() => {
              addMeal(dietId, `Refeição ${meals.length + 1}`, '12:00', meals.length + 1);
            }}>
              <Text style={[styles.addButton, { color: colors.primary }]}>+ Adicionar</Text>
            </Pressable>
          </View>

          {meals.map((meal, index) => (
            <View
              key={`${meal.id}-${index}`}
              style={[styles.mealItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.mealInfo}>
                <Text style={[styles.mealName, { color: colors.primaryText }]}>{meal.name}</Text>
                <Text style={[styles.mealTime, { color: colors.muted }]}>{meal.time}</Text>
              </View>
              <View style={styles.mealActions}>
                <Pressable
                  onPress={() => router.push(`/diet/meal/${meal.id || index}/edit`)}
                  style={[styles.mealAction, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.mealActionText, { color: colors.white }]}>Editar</Text>
                </Pressable>
                <Pressable
                  onPress={() => removeMeal(dietId, meal.id)}
                  style={[styles.mealAction, { backgroundColor: colors.error }]}
                >
                  <Text style={[styles.mealActionText, { color: colors.white }]}>Remover</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <PrimaryButton
          title="Salvar Alterações"
          onPress={handleSave}
          disabled={!canSave || saving}
          loading={saving}
          style={styles.saveButton}
        />
      </ScrollView>
    </>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
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
  textArea: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  mealsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 14,
    fontWeight: '600',
  },
  mealTime: {
    fontSize: 12,
    marginTop: 2,
  },
  mealActions: {
    flexDirection: 'row',
    gap: 8,
  },
  mealAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  mealActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 8,
  },
});
