import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useFood } from '@/hooks/useFood';
import type { Food } from '@/types';
import { SearchInput } from './SearchInput';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

interface FoodSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (food: Food) => void;
  onCreateNew?: () => void;
}

export function FoodSelector({ visible, onClose, onSelect, onCreateNew }: FoodSelectorProps) {
  const { colors, typography, spacing } = useTheme();
  const { foods, loading, error, search } = useFood('');
  const [filter, setFilter] = useState<'all' | 'custom'>('all');

  // Trigger search on mount and reset when closed
  useEffect(() => {
    if (visible) {
      search('');
    }
  }, [visible, search]);

  const filteredFoods = useMemo(() => {
    if (filter === 'all') return foods;
    return foods.filter((f: Food) => f.isUserCreated);
  }, [foods, filter]);

  const renderItem = ({ item }: { item: Food }) => (
    <TouchableOpacity 
      style={[styles.foodItem, { borderBottomColor: colors.border }]} 
      onPress={() => onSelect(item)}
    >
      <View style={styles.foodInfo}>
        <Text style={[styles.foodName, { color: colors.primaryText }]}>{item.name}</Text>
        <Text style={[styles.foodDetails, { color: colors.secondaryText }]}>
          {item.calories ? Math.round(item.calories) : 0} kcal | 
          P: {item.protein ?? 0}g | 
          C: {item.carbs ?? 0}g | 
          G: {item.fat ?? 0}g
          {item.source ? ` • ${item.source}` : ''}
        </Text>
      </View>
      <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.primaryText }]}>Adicionar Alimento</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.primaryText} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
          <SearchInput 
            placeholder="Buscar alimentos..." 
            onChangeText={(text) => search(text)}
          />
          
          <View style={styles.filters}>
            <TouchableOpacity 
              style={[
                styles.filterBtn, 
                filter === 'all' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setFilter('all')}
            >
              <Text style={[
                styles.filterText, 
                filter === 'all' ? { color: colors.white } : { color: colors.secondaryText }
              ]}>Todos</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.filterBtn, 
                filter === 'custom' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setFilter('custom')}
            >
              <Text style={[
                styles.filterText, 
                filter === 'custom' ? { color: colors.white } : { color: colors.secondaryText }
              ]}>Meus Alimentos</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listContainer}>
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={() => search('')} />
          ) : filteredFoods.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                Nenhum alimento encontrado.
              </Text>
              {onCreateNew && (
                <TouchableOpacity style={[styles.createBtn, { backgroundColor: colors.primary }]} onPress={onCreateNew}>
                  <Ionicons name="add" size={20} color={colors.white} />
                  <Text style={[styles.createBtnText, { color: colors.white }]}>Criar Novo Alimento</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredFoods}
              keyExtractor={item => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
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
  searchSection: {
    padding: 16,
  },
  filters: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  foodInfo: {
    flex: 1,
    marginRight: 16,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  foodDetails: {
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
