import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GigCategory, GigItem } from '../types';
import { ItemRow } from './ItemRow';
import { theme } from '../constants/theme';

interface Props {
  category: GigCategory;
  items: GigItem[];
  onToggle: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

export function CategorySection({ category, items, onToggle, onDelete }: Props) {
  const checked = items.filter((i) => i.checked).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{category.name.toUpperCase()}</Text>
        <Text style={styles.progress}>
          {checked}/{items.length}
        </Text>
      </View>
      {items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          onToggle={() => onToggle(item.id)}
          onDelete={() => onDelete(item.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.font.sm,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: theme.colors.textSecondary,
  },
  progress: {
    fontSize: theme.font.sm,
    color: theme.colors.textSecondary,
  },
});
