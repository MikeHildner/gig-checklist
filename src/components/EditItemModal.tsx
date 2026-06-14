import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { theme } from '../constants/theme';
import { GigItem } from '../types';
import { QuantityStepper } from './QuantityStepper';

interface Props {
  visible: boolean;
  item: GigItem | null;
  onSave: (fields: { label: string; quantity: number; note: string }) => void;
  onClose: () => void;
}

export function EditItemModal({ visible, item, onSave, onClose }: Props) {
  const [label, setLabel] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  // Sync fields whenever the modal opens for a given item.
  useEffect(() => {
    if (visible && item) {
      setLabel(item.label);
      setQuantity(item.quantity && item.quantity > 1 ? item.quantity : 1);
      setNote(item.note ?? '');
    }
  }, [visible, item]);

  function handleSave() {
    const trimmed = label.trim();
    if (!trimmed) return;
    onSave({ label: trimmed, quantity, note });
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheet}
      >
        <View style={styles.handle} />
        <Text style={styles.title}>Edit Item</Text>

        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="Item name"
          placeholderTextColor={theme.colors.textSecondary}
          returnKeyType="done"
          autoFocus
          selectTextOnFocus
        />

        <View style={styles.qtyRow}>
          <Text style={styles.fieldLabel}>Quantity</Text>
          <QuantityStepper value={quantity} onChange={setQuantity} />
        </View>

        <TextInput
          style={styles.input}
          value={note}
          onChangeText={setNote}
          placeholder="Note (optional)"
          placeholderTextColor={theme.colors.textSecondary}
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />

        <Pressable
          style={[styles.btn, !label.trim() && styles.btnDisabled]}
          onPress={handleSave}
          disabled={!label.trim()}
        >
          <Text style={styles.btnText}>Save</Text>
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
  fieldLabel: {
    fontSize: theme.font.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
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
  btn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: {
    color: theme.colors.onPrimary,
    fontSize: theme.font.md,
    fontWeight: '700',
  },
});
