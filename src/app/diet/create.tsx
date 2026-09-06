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
import { useDiet } from '@/hooks/useDiet';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { NumericInput } from '@/components/ui/NumericInput';

export default function CreateDietScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { createDiet } = useDiet();

  const [name, setName] = useState('');
  const [calories, setCalories] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      await createDiet({
        name: name.trim(),
        calories,
        notes: notes || null,
        startDate: today,
        meals: [],
      });
      router.back();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível criar a dieta.');
      console.error('CreateDiet error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nova Dieta',
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
            autoFocus
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

        <PrimaryButton
          title="Criar Dieta"
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
  textArea: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 16,
  },
});
