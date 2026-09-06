import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useUser } from '@/hooks/useUser';
import { useWeight } from '@/hooks/useWeight';
import { useMeasurements } from '@/hooks/useMeasurements';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard } from '@/components/cards/StatCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { calculateMovingAverage } from '@/utils/calculations';
import { formatDayMonth } from '@/utils/dates';
import { MEASUREMENT_LABELS } from '@/types';
import type { TimeFilter } from '@/types';

const FILTERS: { label: string; value: TimeFilter }[] = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '1A', value: '1y' },
  { label: 'Tudo', value: 'all' },
];

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing, radius, shadows } = useTheme();

  const { user } = useUser();
  const { records, stats, loading, filter, setFilter, reload: reloadWeight } = useWeight(
    user?.initialWeight ?? 117,
    user?.goalWeight ?? 90,
  );
  const { latestByType, reload: reloadMeasurements } = useMeasurements();

  const [refreshing, setRefreshing] = React.useState(false);

  const reload = useCallback(async () => {
    await Promise.all([reloadWeight(), reloadMeasurements()]);
  }, [reloadWeight, reloadMeasurements]);

  const reloadRef = React.useRef(reload);
  reloadRef.current = reload;

  useFocusEffect(
    useCallback(() => {
      reloadRef.current();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const sorted = [...records].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    );
    return sorted.map((r) => ({
      date: r.recordedAt,
      value: r.weight,
      label: formatDayMonth(r.recordedAt),
    }));
  }, [records]);

  const movingAvg = useMemo(() => {
    return calculateMovingAverage(records);
  }, [records]);

  if (loading && !refreshing) {
    return <LoadingState fullScreen />;
  }

  const unit = user?.weightUnit ?? 'kg';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: spacing['5xl'] },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={{ paddingHorizontal: spacing.xl }}>
          <Text style={[typography.displaySmall, { color: colors.primaryText }]}>
            Evolução
          </Text>

          {stats?.current && (
            <View style={{ marginTop: spacing.lg }}>
              <Text style={[typography.number, { color: colors.primaryText }]}>
                {stats.current.toFixed(1)}
                <Text style={[typography.headlineMedium, { color: colors.secondaryText }]}> {unit}</Text>
              </Text>
              {stats.weeklyChange !== null && (
                <View style={styles.changeRow}>
                  <Ionicons
                    name={stats.weeklyChange <= 0 ? 'arrow-down' : 'arrow-up'}
                    size={14}
                    color={stats.weeklyChange <= 0 ? colors.success : colors.error}
                  />
                  <Text style={[typography.bodyMedium, { color: stats.weeklyChange <= 0 ? colors.success : colors.error, marginLeft: 4 }]}>
                    {Math.abs(stats.weeklyChange).toFixed(1)} {unit} nos últimos 30 dias
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Filters */}
        <View style={[styles.filterRow, { paddingHorizontal: spacing.xl, marginTop: spacing['2xl'] }]}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setFilter(f.value)}
              accessibilityRole="tab"
              accessibilityState={{ selected: filter === f.value }}
              style={[
                styles.filterButton,
                {
                  backgroundColor: filter === f.value ? colors.primary : colors.surface,
                  borderRadius: radius.sm,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                },
              ]}
            >
              <Text
                style={[
                  typography.labelMedium,
                  { color: filter === f.value ? colors.white : colors.secondaryText },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart Area */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['2xl'] }}>
          <SectionHeader title="GRÁFICO DE PESO" />
          {chartData.length > 1 ? (
            <View
              style={[
                styles.chartContainer,
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius.lg,
                  padding: spacing.lg,
                  ...shadows.sm,
                },
              ]}
            >
              {/* Simple SVG-free chart using View bars */}
              <View style={styles.chartArea}>
                {(() => {
                  const values = chartData.map((d) => d.value);
                  const min = Math.min(...values) - 0.5;
                  const max = Math.max(...values) + 0.5;
                  const range = max - min || 1;
                  const chartHeight = 160;
                  const pointWidth = Math.max(2, (screenWidth - 100) / chartData.length);

                  return (
                    <View style={{ height: chartHeight, flexDirection: 'row', alignItems: 'flex-end' }}>
                      {chartData.map((point, i) => {
                        const height = ((point.value - min) / range) * chartHeight;
                        const isLast = i === chartData.length - 1;
                        return (
                          <View
                            key={`${point.date}-${i}`}
                            style={{
                              width: pointWidth,
                              alignItems: 'center',
                              height: chartHeight,
                              justifyContent: 'flex-end',
                            }}
                          >
                            <View
                              style={{
                                width: Math.max(3, pointWidth - 2),
                                height: Math.max(2, height),
                                backgroundColor: isLast ? colors.primary : colors.primaryMuted,
                                borderRadius: 2,
                              }}
                            />
                          </View>
                        );
                      })}
                    </View>
                  );
                })()}
                {/* Axis labels */}
                <View style={[styles.axisRow, { marginTop: spacing.sm }]}>
                  <Text style={[typography.labelSmall, { color: colors.muted, textTransform: 'none' }]}>
                    {chartData[0]?.label}
                  </Text>
                  <Text style={[typography.labelSmall, { color: colors.muted, textTransform: 'none' }]}>
                    {chartData[chartData.length - 1]?.label}
                  </Text>
                </View>
              </View>

              {/* Moving average indicator */}
              {movingAvg.length > 0 && (
                <View style={[styles.trendRow, { marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.md }]}>
                  <Text style={[typography.bodySmall, { color: colors.secondaryText }]}>
                    Tendência (média 7 dias)
                  </Text>
                  <Text style={[typography.titleMedium, { color: colors.primaryText }]}>
                    {movingAvg[movingAvg.length - 1]?.value.toFixed(1)} {unit}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <EmptyState
              icon="bar-chart-outline"
              title="Dados insuficientes"
              message="Registre mais pesos para visualizar o gráfico de evolução."
            />
          )}
        </View>

        {/* Stats */}
        {stats && (
          <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['2xl'] }}>
            <SectionHeader title="ESTATÍSTICAS" />
            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <StatCard
                  label="Perda total"
                  value={stats.totalLoss > 0 ? `-${stats.totalLoss.toFixed(1)} ${unit}` : `${stats.totalLoss.toFixed(1)} ${unit}`}
                  color={stats.totalLoss > 0 ? colors.success : colors.primaryText}
                />
                <StatCard
                  label="Restante"
                  value={`${stats.remaining.toFixed(1)} ${unit}`}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <StatCard
                  label="Menor peso"
                  value={stats.lowestWeight ? `${stats.lowestWeight.toFixed(1)} ${unit}` : '—'}
                />
                <StatCard
                  label="Maior peso"
                  value={stats.highestWeight ? `${stats.highestWeight.toFixed(1)} ${unit}` : '—'}
                />
              </View>
              {stats.weeklyAverage !== null && (
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <StatCard
                    label="Média semanal"
                    value={`-${Math.abs(stats.weeklyAverage).toFixed(1)} ${unit}`}
                    subtitle="perda por semana"
                    color={colors.success}
                  />
                  <View style={{ flex: 1 }} />
                </View>
              )}
            </View>
          </View>
        )}

        {/* Body Measurements */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['3xl'] }}>
          <SectionHeader title="MEDIDAS CORPORAIS" />
          {latestByType.length > 0 ? (
            <View style={{ gap: spacing.sm }}>
              {latestByType.map((m) => (
                <View
                  key={m.id}
                  style={[
                    styles.measurementRow,
                    {
                      backgroundColor: colors.surface,
                      borderRadius: radius.md,
                      padding: spacing.lg,
                      ...shadows.sm,
                    },
                  ]}
                >
                  <View>
                    <Text style={[typography.titleMedium, { color: colors.primaryText }]}>
                      {MEASUREMENT_LABELS[m.type] ?? m.type}
                    </Text>
                    <Text style={[typography.bodySmall, { color: colors.muted }]}>
                      {formatDayMonth(m.recordedAt)}
                    </Text>
                  </View>
                  <Text style={[typography.numberSmall, { color: colors.primaryText }]}>
                    {m.value} {m.unit}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="resize-outline"
              title="Nenhuma medida registrada"
              message="Registre suas medidas corporais para acompanhar sua evolução."
            />
          )}
        </View>

        {/* Weight History */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['3xl'] }}>
          <SectionHeader title="HISTÓRICO DE PESO" />
          {records.length > 0 ? (
            <View style={[styles.historyCard, { backgroundColor: colors.surface, borderRadius: radius.lg, ...shadows.sm, overflow: 'hidden' }]}>
              {records.slice(0, 10).map((record, index) => {
                const prev = records[index + 1];
                const diff = prev ? record.weight - prev.weight : null;
                return (
                  <View
                    key={record.id}
                    style={[
                      styles.historyRow,
                      {
                        padding: spacing.lg,
                        borderBottomWidth: index < Math.min(records.length, 10) - 1 ? 1 : 0,
                        borderBottomColor: colors.borderLight,
                      },
                    ]}
                  >
                    <Text style={[typography.bodyMedium, { color: colors.secondaryText, width: 50 }]}>
                      {formatDayMonth(record.recordedAt)}
                    </Text>
                    <Text style={[typography.titleLarge, { color: colors.primaryText, flex: 1 }]}>
                      {record.weight.toFixed(1)} {unit}
                    </Text>
                    {diff !== null && (
                      <Text
                        style={[
                          typography.bodySmall,
                          {
                            color: diff < 0 ? colors.success : diff > 0 ? colors.error : colors.muted,
                          },
                        ]}
                      >
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          ) : null}
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
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {},
  chartContainer: {},
  chartArea: {},
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyCard: {},
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
