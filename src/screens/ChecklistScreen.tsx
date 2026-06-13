import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useLayoutEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddItemModal } from '../components/AddItemModal';
import { CategorySection } from '../components/CategorySection';
import { theme } from '../constants/theme';
import { useChecklists } from '../context/ChecklistContext';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Checklist'>;

export function ChecklistScreen({ route, navigation }: Props) {
  const { listId } = route.params;
  const { lists, toggleItem, addItem, deleteItem, addCategory, resetSession } = useChecklists();
  const list = lists.find((l) => l.id === listId);

  const [showAdd, setShowAdd] = useState(false);

  useLayoutEffect(() => {
    if (!list) return;
    navigation.setOptions({ title: list.name });
  }, [list?.name]);

  if (!list) return null;

  const total = list.items.length;
  const checked = list.items.filter((i) => i.checked).length;

  function handleReset() {
    Alert.alert('Reset Session', 'Uncheck all items and start fresh?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => resetSession(listId) },
    ]);
  }

  function handleDeleteItem(itemId: string) {
    Alert.alert('Remove Item', 'Remove this item from the list?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteItem(listId, itemId) },
    ]);
  }

  const uncategorisedItems = list.items.filter(
    (i) => !list.categories.find((c) => c.id === i.categoryId)
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${total === 0 ? 0 : (checked / total) * 100}%` as any },
            checked === total && total > 0 && styles.progressDone,
          ]}
        />
      </View>
      <View style={styles.progressLabel}>
        <Text style={styles.progressText}>
          {checked} of {total} packed
        </Text>
        {checked === total && total > 0 && (
          <Text style={styles.readyBadge}>Ready to go!</Text>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {list.categories.map((cat) => {
          const catItems = list.items.filter((i) => i.categoryId === cat.id);
          if (catItems.length === 0) return null;
          return (
            <CategorySection
              key={cat.id}
              category={cat}
              items={catItems}
              onToggle={(itemId) => toggleItem(listId, itemId)}
              onDelete={handleDeleteItem}
            />
          );
        })}

        {uncategorisedItems.length > 0 && (
          <CategorySection
            category={{ id: '__uncategorised__', name: 'Other' }}
            items={uncategorisedItems}
            onToggle={(itemId) => toggleItem(listId, itemId)}
            onDelete={handleDeleteItem}
          />
        )}

        {list.items.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No items yet.</Text>
            <Text style={styles.emptySubText}>Tap "+ Add Item" to build your list.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.toolbar}>
        <Pressable style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetBtnText}>Reset Session</Text>
        </Pressable>
        <Pressable style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>+ Add Item</Text>
        </Pressable>
      </View>

      <AddItemModal
        visible={showAdd}
        categories={list.categories}
        onAdd={(label, catId) => {
          addItem(listId, label, catId);
        }}
        onAddCategory={(name) => addCategory(listId, name)}
        onClose={() => setShowAdd(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressDone: {
    backgroundColor: theme.colors.checked,
  },
  progressLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  progressText: {
    fontSize: theme.font.sm,
    color: theme.colors.textSecondary,
  },
  readyBadge: {
    fontSize: theme.font.sm,
    fontWeight: '700',
    color: theme.colors.checked,
  },
  scroll: {
    paddingVertical: theme.spacing.md,
    paddingBottom: 100,
  },
  toolbar: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resetBtnText: {
    fontSize: theme.font.md,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  addBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  addBtnText: {
    fontSize: theme.font.md,
    fontWeight: '700',
    color: '#fff',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.font.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  emptySubText: {
    fontSize: theme.font.md,
    color: theme.colors.textSecondary,
  },
});
