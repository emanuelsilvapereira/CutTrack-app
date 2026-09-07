import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { userRepository } from '@/database/repositories';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import type { UserGoal } from '@/types';

const GOALS: { value: UserGoal; label: string; description: string }[] = [
  { value: 'loss', label: 'Perder peso', description: 'Reduzir gordura corporal' },
  { value: 'maintain', label: 'Manter peso', description: 'Manter composição atual' },
  { value: 'gain', label: 'Ganhar peso', description: 'Aumentar massa muscular' },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [initialWeight, setInitialWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [height, setHeight] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [goal, setGoal] = useState<UserGoal>('loss');
  const [calorieTarget, setCalorieTarget] = useState('');
  const [loading, setLoading] = useState(false);

  const canProceed = () => {
    switch (step) {
      case 0: return name.trim().length > 0;
      case 1: return initialWeight.length > 0 && goalWeight.length > 0;
      case 2: return true;
      case 3: return true;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      await userRepository.createUser({
        name: name.trim(),
        initialWeight: parseFloat(initialWeight) || 0,
        goalWeight: parseFloat(goalWeight) || 0,
        height: height ? parseFloat(height) : null,
        birthDate: birthDate || null,
        goal,
        calorieTarget: calorieTarget ? parseInt(calorieTarget) : null,
      });
      await userRepository.completeOnboarding();
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Onboarding error:', e);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.title, { color: colors.primaryText }]}>Qual seu nome?</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              Vamos personalizar sua experiência
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
              placeholder="Seu nome"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
              autoFocus
              autoCapitalize="words"
            />
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.title, { color: colors.primaryText }]}>Seus pesos</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              Qual seu peso atual e objetivo?
            </Text>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>Peso atual (kg)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
                placeholder="0.0"
                placeholderTextColor={colors.muted}
                value={initialWeight}
                onChangeText={setInitialWeight}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>Peso objetivo (kg)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
                placeholder="0.0"
                placeholderTextColor={colors.muted}
                value={goalWeight}
                onChangeText={setGoalWeight}
                keyboardType="numeric"
              />
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.title, { color: colors.primaryText }]}>Seu objetivo</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              O que você quer alcançar?
            </Text>
            {GOALS.map((g) => (
              <Pressable
                key={g.value}
                style={[
                  styles.goalOption,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  goal === g.value && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => setGoal(g.value)}
              >
                <Text style={[styles.goalLabel, { color: colors.primaryText }]}>{g.label}</Text>
                <Text style={[styles.goalDescription, { color: colors.secondaryText }]}>
                  {g.description}
                </Text>
              </Pressable>
            ))}
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.title, { color: colors.primaryText }]}>Dados opcionais</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              Esses dados ajudam a personalizar seu plano
            </Text>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>Altura (cm)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
                placeholder="175"
                placeholderTextColor={colors.muted}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>Meta calórica diária</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
                placeholder="2000"
                placeholderTextColor={colors.muted}
                value={calorieTarget}
                onChangeText={setCalorieTarget}
                keyboardType="numeric"
              />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress */}
        <View style={styles.progress}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                { backgroundColor: i <= step ? colors.primary : colors.border },
              ]}
            />
          ))}
        </View>

        {renderStep()}
      </ScrollView>

      <View style={styles.buttons}>
        {step > 0 && (
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.primary }]}>Voltar</Text>
          </Pressable>
        )}
        <PrimaryButton
          title={step < 3 ? 'Próximo' : 'Começar'}
          onPress={handleNext}
          disabled={!canProceed() || loading}
          loading={loading}
          style={styles.nextButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    padding: 24,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  goalOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
  },
  buttons: {
    padding: 24,
    paddingBottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
  },
});
