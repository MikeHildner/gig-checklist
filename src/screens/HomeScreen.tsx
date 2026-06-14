import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionSheet } from '../components/ActionSheet';
import { ChecklistCard } from '../components/ChecklistCard';
import { EditNameModal } from '../components/EditNameModal';
import { Logo } from '../components/Logo';
import { NewListModal } from '../components/NewListModal';
import { Toast } from '../components/Toast';
import { AppTheme } from '../constants/theme';
import { useChecklists } from '../context/ChecklistContext';
import { useShareList } from '../hooks/useShareList';
import { useTheme, useThemeMode } from '../theme/ThemeContext';
import { GigChecklist, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const MODE_LABEL = { system: 'Auto', light: 'Light', dark: 'Dark' } as const;

export function HomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const { mode, cycleMode } = useThemeMode();
  const { share, toast } = useShareList();
  const { lists, createList, renameList, duplicateList, deleteList, loading } = useChecklists();
  const [showNew, setShowNew] = useState(false);
  const [menuList, setMenuList] = useState<GigChecklist | null>(null);
  const [confirmDeleteList, setConfirmDeleteList] = useState<GigChecklist | null>(null);
  const [renameTarget, setRenameTarget] = useState<GigChecklist | null>(null);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeTop} edges={['top']}>
        <View style={styles.header}>
          <Logo />
          <View style={styles.headerActions}>
            <Pressable style={styles.themeBtn} onPress={cycleMode} hitSlop={6}>
              <Text style={styles.themeBtnText}>{MODE_LABEL[mode]}</Text>
            </Pressable>
            <Pressable style={styles.addBtn} onPress={() => setShowNew(true)}>
              <Text style={styles.addBtnText}>+ New</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>My Checklists</Text>

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
      </View>

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
            label: 'Duplicate',
            onPress: () => {
              if (menuList) duplicateList(menuList.id);
            },
          },
          {
            label: 'Share as text',
            onPress: () => {
              if (menuList) share(menuList);
            },
          },
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

      <Toast message={toast} />
    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.brandBg,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  themeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  themeBtnText: {
    color: theme.colors.onBrand,
    fontWeight: '600',
    fontSize: theme.font.sm,
  },
  safeTop: {
    backgroundColor: theme.colors.brandBg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
  },
  sectionLabel: {
    fontSize: theme.font.sm,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
  },
  addBtnText: {
    color: theme.colors.onPrimary,
    fontWeight: '800',
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
