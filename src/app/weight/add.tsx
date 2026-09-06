import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { weightRepository } from '@/database/repositories';
import { getLocalDateString, formatShortDate } from '@/utils/dates';

export default function AddWeightScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, typography, spacing, radius, shadows } = useTheme();

  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(getLocalDateString());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const parsed = parseFloat(weight.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0 || parsed > 500) {
      Alert.alert('Valor inválido', 'Insira um peso válido (ex: 114,0).');
      return;
    }

    try {
      setSaving(true);
      await weightRepository.create({ weight: parsed, recordedAt: date });
      setSaved(true);
      setTimeout(() => {
        router.back();
      }, 800);
    } catch (e) {
      console.error('Save weight error:', e);
      Alert.alert('Erro', 'Não foi possível salvar o peso.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.content, { paddingTop: insets.top + spacing.lg, paddingHorizontal: spacing.xl }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={28} color={colors.primaryText} />
          </TouchableOpacity>
        </View>

        <Text style={[typography.displaySmall, { color: colors.primaryText, marginTop: spacing['2xl'] }]}>
          Registrar peso
        </Text>
        <Text style={[typography.bodyLarge, { color: colors.secondaryText, marginTop: spacing.sm }]}>
          Quanto você está pesando?
        </Text>

        {/* Weight Input */}
        <View style={[styles.inputSection, { marginTop: spacing['4xl'] }]}>
          <View style={[styles.inputRow, { borderBottomWidth: 2, borderBottomColor: colors.primary, paddingBottom: spacing.sm }]}>
            <TextInput
              style={[typography.number, { color: colors.primaryText, flex: 1, padding: 0, textAlign: 'center' }]}
              value={weight}
              onChangeText={setWeight}
              placeholder="114,0"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              autoFocus
              maxLength={6}
              accessibilityLabel="Peso em quilogramas"
            />
            <Text style={[typography.headlineMedium, { color: colors.secondaryText }]}>
              kg
            </Text>
          </View>
        </View>

        {/* Date */}
        <View style={[styles.dateSection, { marginTop: spacing['3xl'] }]}>
          <Text style={[typography.labelMedium, { color: colors.secondaryText, marginBottom: spacing.sm }]}>
            Data
          </Text>
          <View style={[styles.dateCard, { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, ...shadows.sm }]}>
            <Ionicons name="calendar-outline" size={20} color={colors.secondaryText} />
            <Text style={[typography.bodyLarge, { color: colors.primaryText, marginLeft: spacing.md }]}>
              {formatShortDate(date)}
            </Text>
          </View>
        </View>

        {/* Save button */}
        <View style={{ marginTop: spacing['4xl'] }}>
          {saved ? (
            <View style={[styles.savedRow, { backgroundColor: colors.successLight, borderRadius: radius.md, padding: spacing.lg }]}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={[typography.titleMedium, { color: colors.success, marginLeft: spacing.sm }]}>
                Peso registrado!
              </Text>
            </View>
          ) : (
            <PrimaryButton
              title="Salvar peso"
              onPress={handleSave}
              loading={saving}
              disabled={!weight.trim()}
            />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  inputSection: {
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    maxWidth: 250,
    width: '100%',
  },
  dateSection: {},
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
