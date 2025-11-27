import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface VerseMarkerProps {
  verseNumber: number;
  size?: number;
  color?: string;
}

export default function VerseMarker({
  verseNumber,
  size = 30,
  color = '#065F46',
}: VerseMarkerProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 35 35" fill="none">
        {/* Outer decorative circle */}
        <Circle cx="17.5" cy="17.5" r="16" stroke={color} strokeWidth="1.5" />

        {/* Inner decorative petals/scallops */}
        <Path
          d="M17.5 2.5 C20 2.5 22 5 22 8 C22 5 25 5 27.5 5 C25 8 27 10 30 10 C27 12 28 15 30.5 17.5 C28 20 27 23 30 25 C27 25 25 28 22 28 C22 31 20 32.5 17.5 32.5 C15 32.5 13 31 13 28 C10 28 8 25 5 25 C8 23 7 20 4.5 17.5 C7 15 8 12 5 10 C8 10 10 8 13 8 C13 5 15 2.5 17.5 2.5 Z"
          stroke={color}
          strokeWidth="0.5"
          opacity="0.5"
        />
      </Svg>
      <View style={styles.numberContainer}>
        <Text
          style={[
            styles.number,
            {
              color,
              fontSize: size * 0.45,
              lineHeight: size * 0.5, // Adjust line height to center vertically
            },
          ]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {verseNumber}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    // Important for inline flow in Text
    transform: [{ translateY: 4 }],
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
    fontFamily: 'System', // Use system font or a specific Arabic number font if available
  },
});
