import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionSheet } from '../components/ActionSheet';
import { ChecklistCard } from '../components/ChecklistCard';
import { EditNameModal } from '../components/EditNameModal';
import { NewListModal } from '../components/NewListModal';
import { theme } from '../constants/theme';
import { useChecklists } from '../context/ChecklistContext';
import { GigChecklist, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { lists, createList, renameList, deleteList, loading } = useChecklists();
  const [showNew, setShowNew] = useState(false);
  const [menuList, setMenuList] = useState<GigChecklist | null>(null);
  const [confirmDeleteList, setConfirmDeleteList] = useState<GigChecklist | null>(null);
  const [renameTarget, setRenameTarget] = useState<GigChecklist | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>My Checklists</Text>
        <Pressable style={styles.addBtn} onPress={() => setShowNew(true)}>
          <Text style={styles.addBtnText}>+ New</Text>
        </Pressable>
      </View>

      {!loading && lists.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No checklists yet</Text>
          <Text style={styles.emptySub}>Tap "+ New" to create your first gig list.</Text>
        </View>
      )}

      <FlatList
        data={lists}
        keyExtractor={(l) => l.id}
        renderItem={({ item }) => (
          <ChecklistCard
            list={item}
            onPress={() => navigation.navigate('Checklist', { listId: item.id })}
            onLongPress={() => setMenuList(item)}
          />
        )}
        contentContainerStyle={styles.list}
      />

      <NewListModal
        visible={showNew}
        onCreate={createList}
        onClose={() => setShowNew(false)}
      />

      {/* Long-press a card → Rename / Delete */}
      <ActionSheet
        visible={menuList !== null}
        title={menuList?.name}
        actions={[
          { label: 'Rename', onPress: () => setRenameTarget(menuList) },
          {
            label: 'Delete',
            destructive: true,
            onPress: () => setConfirmDeleteList(menuList),
          },
        ]}
        onClose={() => setMenuList(null)}
      />

      <ActionSheet
        visible={confirmDeleteList !== null}
        title={`Delete "${confirmDeleteList?.name}"?`}
        message="This removes the checklist and all its items. This cannot be undone."
        actions={[
          {
            label: 'Delete checklist',
            destructive: true,
            onPress: () => {
              if (confirmDeleteList) deleteList(confirmDeleteList.id);
            },
          },
        ]}
        onClose={() => setConfirmDeleteList(null)}
      />

      <EditNameModal
        visible={renameTarget !== null}
        title="Rename Checklist"
        initialValue={renameTarget?.name ?? ''}
        placeholder="Checklist name"
        onSave={(name) => {
          if (renameTarget) renameList(renameTarget.id, name);
        }}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  heading: {
    fontSize: theme.font.xl,
    fontWeight: '800',
    color: theme.colors.text,
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: theme.font.md,
  },
  list: {
    paddingBottom: 40,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.font.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  emptySub: {
    fontSize: theme.font.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
