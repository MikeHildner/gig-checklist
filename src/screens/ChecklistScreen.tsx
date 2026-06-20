import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useLayoutEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionSheet } from '../components/ActionSheet';
import { AddItemModal } from '../components/AddItemModal';
import { CategorySection } from '../components/CategorySection';
import { EditItemModal } from '../components/EditItemModal';
import { EditNameModal } from '../components/EditNameModal';
import { Toast } from '../components/Toast';
import { AppTheme } from '../constants/theme';
import { useChecklists } from '../context/ChecklistContext';
import { useShareList } from '../hooks/useShareList';
import { useTheme } from '../theme/ThemeContext';
import { GigItem, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Checklist'>;

type RenameTarget =
  | { kind: 'list'; id: string; value: string }
  | { kind: 'category'; id: string; value: string };

const RENAME_TITLE: Record<RenameTarget['kind'], string> = {
  list: 'Rename Checklist',
  category: 'Rename Category',
};

export function ChecklistScreen({ route, navigation }: Props) {
  const { listId } = route.params;
  const {
    lists,
    toggleItem,
    addItem,
    updateItem,
    moveItem,
    moveItemToCategory,
    deleteItem,
    addCategory,
    renameCategory,
    moveCategory,
    deleteCategory,
    renameList,
    resetSession,
  } = useChecklists();
  const list = lists.find((l) => l.id === listId);
  const theme = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const { share, toast } = useShareList();

  // Keep the latest list available to the (memoized) header button.
  const listRef = React.useRef(list);
  listRef.current = list;

  const [showAdd, setShowAdd] = useState(false);
  const [itemMenu, setItemMenu] = useState<GigItem | null>(null);
  const [editItem, setEditItem] = useState<GigItem | null>(null);
  const [moveTarget, setMoveTarget] = useState<GigItem | null>(null);
  const [categoryMenu, setCategoryMenu] = useState<{ id: string; name: string } | null>(null);
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const listName = list?.name;
  useLayoutEffect(() => {
    if (!listName) return;
    navigation.setOptions({
      title: listName,
      headerRight: () => (
        <View style={styles.headerRow}>
          <Pressable
            hitSlop={8}
            onPress={() => {
              if (listRef.current) share(listRef.current);
            }}
          >
            <Text style={styles.headerBtnText}>Share</Text>
          </Pressable>
          <Pressable
            hitSlop={8}
            onPress={() => setRenameTarget({ kind: 'list', id: listId, value: listName })}
          >
            <Text style={styles.headerBtnText}>Rename</Text>
          </Pressable>
        </View>
      ),
    });
  }, [listName, listId, navigation, styles, share]);

  if (!list) return null;

  const total = list.items.length;
  const checked = list.items.filter((i) => i.checked).length;

  const uncategorisedItems = list.items.filter(
    (i) => !list.categories.find((c) => c.id === i.categoryId)
  );

  // Position of the long-pressed item within its category (for move up/down).
  const menuCatItems = itemMenu
    ? list.items.filter((i) => i.categoryId === itemMenu.categoryId)
    : [];
  const menuIdx = itemMenu ? menuCatItems.findIndex((i) => i.id === itemMenu.id) : -1;
  const itemMenuOtherCats = itemMenu
    ? list.categories.filter((c) => c.id !== itemMenu.categoryId)
    : [];
  const moveTargetCats = moveTarget
    ? list.categories.filter((c) => c.id !== moveTarget.categoryId)
    : [];

  // Position of the long-pressed category (for move up/down).
  const catMenuIdx = categoryMenu
    ? list.categories.findIndex((c) => c.id === categoryMenu.id)
    : -1;

  function handleRenameSave(value: string) {
    if (!renameTarget) return;
    if (renameTarget.kind === 'list') renameList(listId, value);
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
                if (item) setItemMenu(item);
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
              if (item) setItemMenu(item);
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
        onAdd={(label, catId, quantity, note) => {
          addItem(listId, label, catId, quantity, note);
        }}
        onAddCategory={(name) => addCategory(listId, name)}
        onClose={() => setShowAdd(false)}
      />

      {/* Long-press an item → Edit / Move / Delete */}
      <ActionSheet
        visible={itemMenu !== null}
        title={itemMenu?.label}
        actions={[
          { label: 'Edit', onPress: () => setEditItem(itemMenu) },
          ...(menuIdx > 0
            ? [{ label: 'Move up', onPress: () => itemMenu && moveItem(listId, itemMenu.id, 'up') }]
            : []),
          ...(menuIdx !== -1 && menuIdx < menuCatItems.length - 1
            ? [{ label: 'Move down', onPress: () => itemMenu && moveItem(listId, itemMenu.id, 'down') }]
            : []),
          ...(itemMenuOtherCats.length > 0
            ? [{ label: 'Move to category…', onPress: () => setMoveTarget(itemMenu) }]
            : []),
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

      {/* "Move to category…" → pick the destination category */}
      <ActionSheet
        visible={moveTarget !== null}
        title={moveTarget ? `Move "${moveTarget.label}" to…` : ''}
        actions={moveTargetCats.map((c) => ({
          label: c.name,
          onPress: () => {
            if (moveTarget) moveItemToCategory(listId, moveTarget.id, c.id);
          },
        }))}
        onClose={() => setMoveTarget(null)}
      />

      <EditItemModal
        visible={editItem !== null}
        item={editItem}
        onSave={(fields) => {
          if (editItem) updateItem(listId, editItem.id, fields);
        }}
        onClose={() => setEditItem(null)}
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
          ...(catMenuIdx > 0
            ? [{ label: 'Move up', onPress: () => categoryMenu && moveCategory(listId, categoryMenu.id, 'up') }]
            : []),
          ...(catMenuIdx !== -1 && catMenuIdx < list.categories.length - 1
            ? [{ label: 'Move down', onPress: () => categoryMenu && moveCategory(listId, categoryMenu.id, 'down') }]
            : []),
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

      <Toast message={toast} />
    </SafeAreaView>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
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
    color: theme.colors.onPrimary,
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
