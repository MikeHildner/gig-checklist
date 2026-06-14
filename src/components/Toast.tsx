import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../constants/theme';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  message: string | null;
}

/** A brief, non-interactive confirmation pill anchored near the bottom. */
export function Toast({ message }: Props) {
  const theme = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  if (!message) return null;
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={styles.pill}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 96,
      alignItems: 'center',
    },
    pill: {
      backgroundColor: theme.colors.brandBg,
      borderRadius: 99,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
    },
    text: {
      color: theme.colors.onBrand,
      fontSize: theme.font.sm,
      fontWeight: '600',
    },
  });
