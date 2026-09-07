import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '@/theme';
import { useFood } from '@/hooks/useFood';
import { SearchInput } from '@/components/ui/SearchInput';
import { FoodCard } from '@/components/cards/FoodCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import type { Food } from '@/types';

export default function FoodListScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { foods, loading, search, deleteFood } = useFood();

  const handleSearch = useCallback(
    (query: string) => {
      search(query);
    },
    [search],
  );

  const handlePress = useCallback(
    (food: Food) => {
      router.push(`/food/${food.id}`);
    },
    [router],
  );

  const handleLongPress = useCallback(
    (food: Food) => {
      Alert.alert(
        'Alimento',
        `O que deseja fazer com "${food.name}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Editar',
            onPress: () => router.push(`/food/${food.id}`),
          },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteFood(food.id);
              } catch(e) {
                Alert.alert('Aviso', 'Este alimento está sendo usado em uma refeição e não pode ser excluído.');
              }
            },
          },
        ],
      );
    },
    [router, deleteFood],
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Meus Alimentos',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primaryText,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Buscar alimentos..."
            onSearch={handleSearch}
          />
        </View>

        {foods.length === 0 && !loading ? (
          <EmptyState
            icon="nutrition-outline"
            title="Nenhum alimento"
            message="Adicione alimentos ao seu banco pessoal para usá-los nas refeições."
            actionLabel="Adicionar Alimento"
            onAction={() => router.push('/food/create')}
          />
        ) : (
          <FlatList
            data={foods}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                <FoodCard
                  food={item}
                  onPress={handlePress}
                  onLongPress={handleLongPress}
                />
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        )}

        <View style={styles.fabContainer}>
          <PrimaryButton
            title="+ Novo Alimento"
            onPress={() => router.push('/food/create')}
            style={styles.fab}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: 12,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  fab: {
    width: '100%',
  },
});
