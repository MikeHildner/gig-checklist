import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GigItem } from '../types';
import { theme } from '../constants/theme';

interface Props {
  item: GigItem;
  onToggle: () => void;
  onDelete: () => void;
}

export function ItemRow({ item, onToggle, onDelete }: Props) {
  return (
    <Pressable
      style={[styles.row, item.checked && styles.rowChecked]}
      onPress={onToggle}
      onLongPress={onDelete}
      android_ripple={{ color: theme.colors.border }}
    >
      <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
        {item.checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.label, item.checked && styles.labelChecked]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  rowChecked: {
    backgroundColor: theme.colors.checkedLight,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.checked,
    borderColor: theme.colors.checked,
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  label: {
    flex: 1,
    fontSize: theme.font.md,
    color: theme.colors.text,
  },
  labelChecked: {
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
  },
});
