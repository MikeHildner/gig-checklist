import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChecklistCard } from '../components/ChecklistCard';
import { NewListModal } from '../components/NewListModal';
import { theme } from '../constants/theme';
import { useChecklists } from '../context/ChecklistContext';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { lists, createList, deleteList, loading } = useChecklists();
  const [showNew, setShowNew] = useState(false);

  function handleDelete(id: string, name: string) {
    Alert.alert('Delete Checklist', `Delete "${name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteList(id) },
    ]);
  }

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
            onDelete={() => handleDelete(item.id, item.name)}
          />
        )}
        contentContainerStyle={styles.list}
      />

      <NewListModal
        visible={showNew}
        onCreate={createList}
        onClose={() => setShowNew(false)}
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
