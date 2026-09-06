import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { measurementRepository } from '@/database/repositories';
import { getLocalDateString, formatShortDate } from '@/utils/dates';
import { MEASUREMENT_LABELS, type MeasurementType } from '@/types';

const MEASUREMENT_TYPES: MeasurementType[] = ['waist', 'chest', 'arm', 'thigh', 'hip'];

export default function AddMeasurementScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, typography, spacing, radius, shadows } = useTheme();

  const [selectedType, setSelectedType] = useState<MeasurementType>('waist');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(getLocalDateString());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const parsed = parseFloat(value.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0 || parsed > 300) {
      Alert.alert('Valor inválido', 'Insira um valor válido (ex: 102).');
      return;
    }

    try {
      setSaving(true);
      await measurementRepository.create({
        type: selectedType,
        value: parsed,
        unit: 'cm',
        recordedAt: date,
      });
      setSaved(true);
      setTimeout(() => {
        router.back();
      }, 800);
    } catch (e) {
      console.error('Save measurement error:', e);
      Alert.alert('Erro', 'Não foi possível salvar a medida.');
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
          { paddingTop: insets.top + spacing.lg, paddingHorizontal: spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
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
          Registrar medida
        </Text>

        {/* Type selector */}
        <Text style={[typography.labelMedium, { color: colors.secondaryText, marginTop: spacing['3xl'], marginBottom: spacing.md }]}>
          Tipo
        </Text>
        <View style={styles.typeRow}>
          {MEASUREMENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setSelectedType(type)}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedType === type }}
              style={[
                styles.typeButton,
                {
                  backgroundColor: selectedType === type ? colors.primary : colors.surface,
                  borderRadius: radius.sm,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  ...shadows.sm,
                },
              ]}
            >
              <Text
                style={[
                  typography.labelMedium,
                  { color: selectedType === type ? colors.white : colors.secondaryText },
                ]}
              >
                {MEASUREMENT_LABELS[type]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Value Input */}
        <Text style={[typography.labelMedium, { color: colors.secondaryText, marginTop: spacing['3xl'], marginBottom: spacing.md }]}>
          Valor
        </Text>
        <View style={[styles.inputRow, { borderBottomWidth: 2, borderBottomColor: colors.primary, paddingBottom: spacing.sm }]}>
          <TextInput
            style={[typography.numberMedium, { color: colors.primaryText, flex: 1, padding: 0, textAlign: 'center' }]}
            value={value}
            onChangeText={setValue}
            placeholder="102"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            maxLength={6}
            accessibilityLabel="Valor da medida em centímetros"
          />
          <Text style={[typography.headlineMedium, { color: colors.secondaryText }]}>
            cm
          </Text>
        </View>

        {/* Date */}
        <Text style={[typography.labelMedium, { color: colors.secondaryText, marginTop: spacing['3xl'], marginBottom: spacing.md }]}>
          Data
        </Text>
        <View style={[styles.dateCard, { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, ...shadows.sm }]}>
          <Ionicons name="calendar-outline" size={20} color={colors.secondaryText} />
          <Text style={[typography.bodyLarge, { color: colors.primaryText, marginLeft: spacing.md }]}>
            {formatShortDate(date)}
          </Text>
        </View>

        {/* Save button */}
        <View style={{ marginTop: spacing['4xl'] }}>
          {saved ? (
            <View style={[styles.savedRow, { backgroundColor: colors.successLight, borderRadius: radius.md, padding: spacing.lg }]}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={[typography.titleMedium, { color: colors.success, marginLeft: spacing.sm }]}>
                Medida registrada!
              </Text>
            </View>
          ) : (
            <PrimaryButton
              title="Salvar medida"
              onPress={handleSave}
              loading={saving}
              disabled={!value.trim()}
            />
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    maxWidth: 250,
    alignSelf: 'center',
    width: '100%',
  },
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
