import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

export interface SheetAction {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface Props {
  visible: boolean;
  title?: string;
  message?: string;
  actions: SheetAction[];
  onClose: () => void;
}

/**
 * A simple bottom-sheet action menu that works on iOS, Android, and web.
 * Used instead of React Native's Alert, which is a no-op on react-native-web.
 */
export function ActionSheet({ visible, title, message, actions, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        {title && <Text style={styles.title}>{title}</Text>}
        {message && <Text style={styles.message}>{message}</Text>}
        {actions.map((action, i) => (
          <Pressable
            key={i}
            style={styles.action}
            onPress={() => {
              onClose();
              action.onPress();
            }}
            android_ripple={{ color: theme.colors.border }}
          >
            <Text style={[styles.actionText, action.destructive && styles.destructive]}>
              {action.label}
            </Text>
          </Pressable>
        ))}
        <Pressable style={[styles.action, styles.cancel]} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
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
    paddingTop: theme.spacing.sm,
    paddingBottom: 40,
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
  },
  message: {
    fontSize: theme.font.sm,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  action: {
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  actionText: {
    fontSize: theme.font.md,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  destructive: {
    color: theme.colors.danger,
  },
  cancel: {
    marginTop: theme.spacing.sm,
    borderTopWidth: 0,
  },
  cancelText: {
    fontSize: theme.font.md,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
