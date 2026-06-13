import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { GigCategory } from '../types';
import { theme } from '../constants/theme';

interface Props {
  visible: boolean;
  categories: GigCategory[];
  onAdd: (label: string, categoryId: string) => void;
  onAddCategory: (name: string) => GigCategory;
  onClose: () => void;
}

export function AddItemModal({ visible, categories, onAdd, onAddCategory, onClose }: Props) {
  const [label, setLabel] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    categories[0]?.id ?? null
  );
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  function handleAdd() {
    const trimmed = label.trim();
    if (!trimmed || !selectedCategoryId) return;
    onAdd(trimmed, selectedCategoryId);
    setLabel('');
  }

  function handleAddCategory() {
    const name = newCatName.trim();
    if (!name) return;
    const cat = onAddCategory(name);
    setSelectedCategoryId(cat.id);
    setNewCatName('');
    setAddingCat(false);
  }

  function handleClose() {
    setLabel('');
    setNewCatName('');
    setAddingCat(false);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheet}
      >
        <View style={styles.handle} />
        <Text style={styles.title}>Add Item</Text>

        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="Item name"
          placeholderTextColor={theme.colors.textSecondary}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
          autoFocus
        />

        <Text style={styles.sectionLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              style={[styles.chip, selectedCategoryId === cat.id && styles.chipActive]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text
                style={[styles.chipText, selectedCategoryId === cat.id && styles.chipTextActive]}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
          <Pressable style={styles.chip} onPress={() => setAddingCat(true)}>
            <Text style={styles.chipText}>+ New</Text>
          </Pressable>
        </ScrollView>

        {addingCat && (
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={newCatName}
              onChangeText={setNewCatName}
              placeholder="Category name"
              placeholderTextColor={theme.colors.textSecondary}
              returnKeyType="done"
              onSubmitEditing={handleAddCategory}
            />
            <Pressable style={styles.addCatBtn} onPress={handleAddCategory}>
              <Text style={styles.addCatBtnText}>Add</Text>
            </Pressable>
          </View>
        )}

        <Pressable
          style={[styles.btn, (!label.trim() || !selectedCategoryId) && styles.btnDisabled]}
          onPress={handleAdd}
          disabled={!label.trim() || !selectedCategoryId}
        >
          <Text style={styles.btnText}>Add Item</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing.md,
    paddingBottom: 40,
    gap: theme.spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.font.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sectionLabel: {
    fontSize: theme.font.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    fontSize: theme.font.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceElevated,
  },
  chips: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceElevated,
  },
  chipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.font.sm,
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  addCatBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
  },
  addCatBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: theme.font.md,
  },
  btn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: '#fff',
    fontSize: theme.font.md,
    fontWeight: '700',
  },
});
