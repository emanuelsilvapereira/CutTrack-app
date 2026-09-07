import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { Food } from '@/types';
import { PrimaryButton } from './PrimaryButton';

interface FoodEditorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (food: Omit<Food, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialFood?: Food;
}

export function FoodEditor({ visible, onClose, onSave, initialFood }: FoodEditorProps) {
  const { colors, typography, spacing } = useTheme();

  const [name, setName] = useState(initialFood?.name ?? '');
  const [calories, setCalories] = useState(initialFood?.calories?.toString() ?? '');
  const [protein, setProtein] = useState(initialFood?.protein?.toString() ?? '');
  const [carbs, setCarbs] = useState(initialFood?.carbs?.toString() ?? '');
  const [fat, setFat] = useState(initialFood?.fat?.toString() ?? '');
  const [fiber, setFiber] = useState(initialFood?.fiber?.toString() ?? '');
  const [sodium, setSodium] = useState(initialFood?.sodium?.toString() ?? '');
  
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome do alimento é obrigatório.');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        name: name.trim(),
        category: initialFood?.category ?? 'Personalizado',
        source: 'Usuário',
        sourceId: null,
        sourceVersion: null,
        calories: calories ? parseFloat(calories.replace(',', '.')) : null,
        protein: protein ? parseFloat(protein.replace(',', '.')) : null,
        carbs: carbs ? parseFloat(carbs.replace(',', '.')) : null,
        fat: fat ? parseFloat(fat.replace(',', '.')) : null,
        fiber: fiber ? parseFloat(fiber.replace(',', '.')) : null,
        sodium: sodium ? parseFloat(sodium.replace(',', '.')) : null,
        defaultUnit: 'g',
        isUserCreated: true,
      });
      onClose();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar o alimento.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.primaryText }]}>
            {initialFood ? 'Editar Alimento' : 'Novo Alimento'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.primaryText} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.infoText, { color: colors.secondaryText }]}>
            Insira os valores nutricionais equivalentes a 100g ou 1 unidade do alimento.
          </Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondaryText }]}>Nome do Alimento</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
              placeholder="Ex: Arroz branco cozido"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>Calorias (kcal)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
                keyboardType="numeric"
                value={calories}
                onChangeText={setCalories}
              />
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>Proteína (g)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
                keyboardType="numeric"
                value={protein}
                onChangeText={setProtein}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>Carboidratos (g)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
                keyboardType="numeric"
                value={carbs}
                onChangeText={setCarbs}
              />
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>Gordura (g)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
                keyboardType="numeric"
                value={fat}
                onChangeText={setFat}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>Fibras (g)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
                keyboardType="numeric"
                value={fiber}
                onChangeText={setFiber}
              />
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>Sódio (mg)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
                keyboardType="numeric"
                value={sodium}
                onChangeText={setSodium}
              />
            </View>
          </View>

          <PrimaryButton
            title="Salvar Alimento"
            onPress={handleSave}
            loading={loading}
            style={{ marginTop: 16 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  content: {
    padding: 24,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
