import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface VerseMarkerProps {
  verseNumber: number;
  size?: number;
  color?: string;
}

export default function VerseMarker({
  verseNumber,
  size = 35,
  color = '#065F46',
}: VerseMarkerProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 35 35" fill="none">
        <Circle cx="17.5" cy="17.5" r="17" stroke={color} strokeWidth="1" />
        <Path
          d="M17.5 4.5V2.5M17.5 32.5V30.5M30.5 17.5H32.5M2.5 17.5H4.5M26.6924 8.30761L28.1066 6.8934M6.8934 28.1066L8.30761 26.6924M26.6924 26.6924L28.1066 28.1066M6.8934 6.8934L8.30761 8.30761"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.numberContainer}>
        <Text style={[styles.number, { color, fontSize: size * 0.4 }]}>{verseNumber}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    display: 'flex',
  },
  numberContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  number: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
