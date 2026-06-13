import React, { useState } from 'react';
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

interface Props {
  visible: boolean;
  onCreate: (name: string) => void;
  onClose: () => void;
}

export function NewListModal({ visible, onCreate, onClose }: Props) {
  const [name, setName] = useState('');

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName('');
    onClose();
  }

  function handleClose() {
    setName('');
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
        <Text style={styles.title}>New Checklist</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Jazz Gig, Studio Session…"
          placeholderTextColor={theme.colors.textSecondary}
          returnKeyType="done"
          onSubmitEditing={handleCreate}
          autoFocus
        />
        <Pressable
          style={[styles.btn, !name.trim() && styles.btnDisabled]}
          onPress={handleCreate}
          disabled={!name.trim()}
        >
          <Text style={styles.btnText}>Create</Text>
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
