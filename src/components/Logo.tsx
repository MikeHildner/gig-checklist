import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../constants/theme';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  size?: number;
}

/** App mark + two-tone "GigChecklist" wordmark, for the branded header. */
export function Logo({ size = 30 }: Props) {
  const theme = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.row}>
      <Image
        source={require('../../assets/icon.png')}
        style={[styles.mark, { width: size, height: size, borderRadius: size * 0.26 }]}
      />
      <Text style={styles.word}>
        <Text style={styles.gig}>Gig</Text>
        <Text style={styles.check}>Checklist</Text>
      </Text>
    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  mark: {
    backgroundColor: theme.colors.brandBg,
  },
  word: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  gig: {
    color: theme.colors.onBrand,
  },
  check: {
    color: theme.colors.primary,
  },
});
