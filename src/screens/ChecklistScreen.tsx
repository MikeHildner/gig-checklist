import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useLayoutEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionSheet } from '../components/ActionSheet';
import { AddItemModal } from '../components/AddItemModal';
import { CategorySection } from '../components/CategorySection';
import { EditNameModal } from '../components/EditNameModal';
import { theme } from '../constants/theme';
import { useChecklists } from '../context/ChecklistContext';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Checklist'>;

type RenameTarget =
  | { kind: 'list'; id: string; value: string }
  | { kind: 'item'; id: string; value: string }
  | { kind: 'category'; id: string; value: string };

const RENAME_TITLE: Record<RenameTarget['kind'], string> = {
  list: 'Rename Checklist',
  item: 'Rename Item',
  category: 'Rename Category',
};

export function ChecklistScreen({ route, navigation }: Props) {
  const { listId } = route.params;
  const {
    lists,
    toggleItem,
    addItem,
    renameItem,
    deleteItem,
    addCategory,
    renameCategory,
    deleteCategory,
    renameList,
    resetSession,
  } = useChecklists();
  const list = lists.find((l) => l.id === listId);

  const [showAdd, setShowAdd] = useState(false);
  const [itemMenu, setItemMenu] = useState<{ id: string; label: string } | null>(null);
  const [categoryMenu, setCategoryMenu] = useState<{ id: string; name: string } | null>(null);
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const listName = list?.name;
  useLayoutEffect(() => {
    if (!listName) return;
    navigation.setOptions({
      title: listName,
      headerRight: () => (
        <Pressable
          hitSlop={8}
          onPress={() => setRenameTarget({ kind: 'list', id: listId, value: listName })}
        >
          <Text style={styles.headerBtnText}>Rename</Text>
        </Pressable>
      ),
    });
  }, [listName, listId, navigation]);

  if (!list) return null;

  const total = list.items.length;
  const checked = list.items.filter((i) => i.checked).length;

  const uncategorisedItems = list.items.filter(
    (i) => !list.categories.find((c) => c.id === i.categoryId)
  );

  function handleRenameSave(value: string) {
    if (!renameTarget) return;
    if (renameTarget.kind === 'list') renameList(listId, value);
    else if (renameTarget.kind === 'item') renameItem(listId, renameTarget.id, value);
    else renameCategory(listId, renameTarget.id, value);
  }

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
              onItemLongPress={(itemId) => {
                const item = catItems.find((i) => i.id === itemId);
                if (item) setItemMenu({ id: item.id, label: item.label });
              }}
              onCategoryLongPress={() => setCategoryMenu({ id: cat.id, name: cat.name })}
            />
          );
        })}

        {uncategorisedItems.length > 0 && (
          <CategorySection
            category={{ id: '__uncategorised__', name: 'Other' }}
            items={uncategorisedItems}
            onToggle={(itemId) => toggleItem(listId, itemId)}
            onItemLongPress={(itemId) => {
              const item = uncategorisedItems.find((i) => i.id === itemId);
              if (item) setItemMenu({ id: item.id, label: item.label });
            }}
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
        <Pressable style={styles.resetBtn} onPress={() => setConfirmReset(true)}>
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

      {/* Long-press an item → Rename / Delete */}
      <ActionSheet
        visible={itemMenu !== null}
        title={itemMenu?.label}
        actions={[
          {
            label: 'Rename',
            onPress: () => {
              if (itemMenu) setRenameTarget({ kind: 'item', id: itemMenu.id, value: itemMenu.label });
            },
          },
          {
            label: 'Delete',
            destructive: true,
            onPress: () => {
              if (itemMenu) deleteItem(listId, itemMenu.id);
            },
          },
        ]}
        onClose={() => setItemMenu(null)}
      />

      {/* Long-press a category header → Rename / Delete */}
      <ActionSheet
        visible={categoryMenu !== null}
        title={categoryMenu?.name}
        message="Deleting a category keeps its items, moving them to “Other”."
        actions={[
          {
            label: 'Rename',
            onPress: () => {
              if (categoryMenu)
                setRenameTarget({ kind: 'category', id: categoryMenu.id, value: categoryMenu.name });
            },
          },
          {
            label: 'Delete category',
            destructive: true,
            onPress: () => {
              if (categoryMenu) deleteCategory(listId, categoryMenu.id);
            },
          },
        ]}
        onClose={() => setCategoryMenu(null)}
      />

      <ActionSheet
        visible={confirmReset}
        title="Reset session?"
        message="Unchecks every item so you can pack fresh."
        actions={[
          { label: 'Reset', destructive: true, onPress: () => resetSession(listId) },
        ]}
        onClose={() => setConfirmReset(false)}
      />

      <EditNameModal
        visible={renameTarget !== null}
        title={renameTarget ? RENAME_TITLE[renameTarget.kind] : ''}
        initialValue={renameTarget?.value ?? ''}
        onSave={handleRenameSave}
        onClose={() => setRenameTarget(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerBtnText: {
    fontSize: theme.font.md,
    fontWeight: '600',
    color: theme.colors.primary,
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
