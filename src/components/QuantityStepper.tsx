import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../constants/theme';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
}

export function QuantityStepper({ value, onChange, min = 1 }: Props) {
  const theme = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.btn, value <= min && styles.btnDisabled]}
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        hitSlop={6}
      >
        <Text style={styles.btnText}>−</Text>
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable style={styles.btn} onPress={() => onChange(value + 1)} hitSlop={6}>
        <Text style={styles.btnText}>+</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    lineHeight: 22,
  },
  value: {
    fontSize: theme.font.lg,
    fontWeight: '700',
    color: theme.colors.text,
    minWidth: 28,
    textAlign: 'center',
  },
});
