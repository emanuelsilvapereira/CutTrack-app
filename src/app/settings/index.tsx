import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { userRepository } from '@/database/repositories';
import type { User } from '@/types';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, typography, spacing, radius, shadows } = useTheme();

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [initialWeight, setInitialWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const u = await userRepository.getUser();
      if (u) {
        setUser(u);
        setName(u.name);
        setInitialWeight(u.initialWeight.toString());
        setGoalWeight(u.goalWeight.toString());
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    const parsedInitial = parseFloat(initialWeight.replace(',', '.'));
    const parsedGoal = parseFloat(goalWeight.replace(',', '.'));

    if (isNaN(parsedInitial) || parsedInitial <= 0) {
      Alert.alert('Erro', 'Peso inicial inválido.');
      return;
    }
    if (isNaN(parsedGoal) || parsedGoal <= 0) {
      Alert.alert('Erro', 'Peso objetivo inválido.');
      return;
    }

    try {
      setSaving(true);
      await userRepository.updateUser({
        name: name.trim(),
        initialWeight: parsedInitial,
        goalWeight: parsedGoal,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Save settings error:', e);
      Alert.alert('Erro', 'Não foi possível salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: spacing['5xl'] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <View style={{ paddingHorizontal: spacing.xl }}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
            <Text style={[typography.titleLarge, { color: colors.primaryText, marginLeft: spacing.sm }]}>
              Configurações
            </Text>
          </TouchableOpacity>
        </View>

        {/* Settings fields */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['3xl'] }}>
          {/* Name */}
          <Text style={[typography.labelMedium, { color: colors.secondaryText, marginBottom: spacing.sm }]}>
            Nome
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                padding: spacing.lg,
                color: colors.primaryText,
                ...typography.bodyLarge,
                ...shadows.sm,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Nome"
          />

          {/* Initial weight */}
          <Text style={[typography.labelMedium, { color: colors.secondaryText, marginBottom: spacing.sm, marginTop: spacing['2xl'] }]}>
            Peso inicial (kg)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                padding: spacing.lg,
                color: colors.primaryText,
                ...typography.bodyLarge,
                ...shadows.sm,
              },
            ]}
            value={initialWeight}
            onChangeText={setInitialWeight}
            placeholder="117"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            accessibilityLabel="Peso inicial em quilogramas"
          />

          {/* Goal weight */}
          <Text style={[typography.labelMedium, { color: colors.secondaryText, marginBottom: spacing.sm, marginTop: spacing['2xl'] }]}>
            Peso objetivo (kg)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                padding: spacing.lg,
                color: colors.primaryText,
                ...typography.bodyLarge,
                ...shadows.sm,
              },
            ]}
            value={goalWeight}
            onChangeText={setGoalWeight}
            placeholder="90"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            accessibilityLabel="Peso objetivo em quilogramas"
          />

          {/* Save button */}
          <View style={{ marginTop: spacing['3xl'] }}>
            {saved ? (
              <View style={[styles.savedRow, { backgroundColor: colors.successLight, borderRadius: radius.md, padding: spacing.lg }]}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                <Text style={[typography.titleMedium, { color: colors.success, marginLeft: spacing.sm }]}>
                  Configurações salvas!
                </Text>
              </View>
            ) : (
              <PrimaryButton
                title="Salvar configurações"
                onPress={handleSave}
                loading={saving}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {},
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {},
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
