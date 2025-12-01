import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface InlineAyahNumberProps {
  verseNumber: number;
  size?: number;
  color?: string;
}

function toArabicNumerals(n: number): string {
  return n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
}

export default function InlineAyahNumber({
  verseNumber,
  size = 16,
  color = '#065F46',
}: InlineAyahNumberProps) {
  const numberText = toArabicNumerals(verseNumber);

  return (
    <Text
      style={[
        styles.wrapper,
        {
          fontSize: size,
          color,
        },
      ]}
    >
      {' '}﴿{numberText}﴾{' '}
    </Text>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    fontFamily: 'System',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
