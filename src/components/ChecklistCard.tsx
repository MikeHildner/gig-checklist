import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GigChecklist } from '../types';
import { AppTheme } from '../constants/theme';
import { useTheme } from '../theme/ThemeContext';
import { formatLastPacked } from '../utils/formatDate';

interface Props {
  list: GigChecklist;
  onPress: () => void;
  onLongPress: () => void;
}

export function ChecklistCard({ list, onPress, onLongPress }: Props) {
  const theme = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const total = list.items.length;
  const checked = list.items.filter((i) => i.checked).length;
  const pct = total === 0 ? 0 : checked / total;
  const allDone = total > 0 && checked === total;

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: theme.colors.border }}
    >
      <View style={styles.top}>
        <Text style={styles.name}>{list.name}</Text>
        <Text style={[styles.badge, allDone && styles.badgeDone]}>
          {allDone ? 'Ready ✓' : `${checked}/${total}`}
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct * 100}%` as any }, allDone && styles.barDone]} />
      </View>
      <View style={styles.subRow}>
        <Text style={styles.sub}>
          {list.categories.length} {list.categories.length === 1 ? 'category' : 'categories'} · {total} items
        </Text>
        {list.lastPackedAt ? (
          <Text style={styles.lastPacked}>Last packed {formatLastPacked(list.lastPackedAt)}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: theme.spacing.sm,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: theme.font.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  badge: {
    fontSize: theme.font.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  badgeDone: {
    color: theme.colors.checked,
    backgroundColor: theme.colors.checkedLight,
  },
  barTrack: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  barDone: {
    backgroundColor: theme.colors.checked,
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sub: {
    flexShrink: 1,
    fontSize: theme.font.sm,
    color: theme.colors.textSecondary,
  },
  lastPacked: {
    fontSize: theme.font.sm,
    color: theme.colors.primaryText,
    fontWeight: '600',
  },
});

