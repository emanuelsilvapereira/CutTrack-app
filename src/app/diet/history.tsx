import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { dietRepository } from '@/database/repositories';
import { formatShortDate } from '@/utils/dates';
import type { Diet } from '@/types';

export default function DietHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, typography, spacing, radius, shadows } = useTheme();

  const [diets, setDiets] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const all = await dietRepository.getAllDiets();
        setDiets(all);
      } catch (e) {
        console.error('Load diets error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <LoadingState fullScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
              Histórico de dietas
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['2xl'] }}>
          {diets.length === 0 ? (
            <EmptyState
              icon="nutrition-outline"
              title="Nenhuma dieta registrada"
              message="Suas dietas aparecerão aqui."
            />
          ) : (
            <View style={{ gap: spacing.md }}>
              {diets.map((diet, index) => {
                const isActive = !diet.endDate;
                return (
                  <View
                    key={diet.id}
                    style={[
                      styles.dietCard,
                      {
                        backgroundColor: colors.surface,
                        borderRadius: radius.lg,
                        padding: spacing.xl,
                        ...shadows.sm,
                        borderLeftWidth: isActive ? 3 : 0,
                        borderLeftColor: colors.primary,
                      },
                    ]}
                  >
                    {isActive && (
                      <View style={[styles.activeBadge, { backgroundColor: colors.primaryLight, borderRadius: radius.sm, marginBottom: spacing.md }]}>
                        <Text style={[typography.labelMedium, { color: colors.primary }]}>
                          Dieta atual
                        </Text>
                      </View>
                    )}
                    <Text style={[typography.headlineSmall, { color: colors.primaryText }]}>
                      {diet.name}
                    </Text>
                    {diet.calories && (
                      <Text style={[typography.bodyMedium, { color: colors.secondaryText, marginTop: spacing.xs }]}>
                        {diet.calories} kcal
                      </Text>
                    )}
                    <Text style={[typography.bodySmall, { color: colors.muted, marginTop: spacing.sm }]}>
                      {formatShortDate(diet.startDate)} → {diet.endDate ? formatShortDate(diet.endDate) : 'atual'}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
  dietCard: {},
  activeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
