import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GigItem } from '../types';
import { theme } from '../constants/theme';

interface Props {
  item: GigItem;
  onToggle: () => void;
  onLongPress: () => void;
}

export function ItemRow({ item, onToggle, onLongPress }: Props) {
  return (
    <Pressable
      style={[styles.row, item.checked && styles.rowChecked]}
      onPress={onToggle}
      onLongPress={onLongPress}
      android_ripple={{ color: theme.colors.border }}
    >
      <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
        {item.checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.body}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, item.checked && styles.labelChecked]}>
            {item.label}
          </Text>
          {item.quantity && item.quantity > 1 ? (
            <View style={styles.qtyBadge}>
              <Text style={styles.qtyText}>×{item.quantity}</Text>
            </View>
          ) : null}
        </View>
        {item.note ? (
          <Text style={[styles.note, item.checked && styles.noteChecked]}>{item.note}</Text>
        ) : null}
      </View>
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
  body: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  label: {
    flexShrink: 1,
    fontSize: theme.font.md,
    color: theme.colors.text,
  },
  labelChecked: {
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  qtyBadge: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  qtyText: {
    fontSize: theme.font.sm,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  note: {
    fontSize: theme.font.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  noteChecked: {
    textDecorationLine: 'line-through',
  },
});
