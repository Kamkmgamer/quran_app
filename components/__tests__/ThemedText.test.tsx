import { render } from '@testing-library/react-native';
import React from 'react';

import { useThemeColor } from '../../hooks/useThemeColor';
import { ThemedText } from '../ThemedText';

// Mock the hook
jest.mock('../../hooks/useThemeColor');

const mockUseThemeColor = useThemeColor as jest.MockedFunction<typeof useThemeColor>;

describe('ThemedText', () => {
  beforeEach(() => {
    mockUseThemeColor.mockReturnValue('#000000');
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(<ThemedText>Test Text</ThemedText>);

    expect(getByText('Test Text')).toBeTruthy();
  });

  it('applies custom color when provided', () => {
    mockUseThemeColor.mockReturnValue('#FF0000');

    const { getByText } = render(<ThemedText>Test Text</ThemedText>);

    const textElement = getByText('Test Text');
    expect(textElement.props.style).toContainEqual({ color: '#FF0000' });
  });

  it('applies title style when type is title', () => {
    const { getByText } = render(<ThemedText type="title">Title Text</ThemedText>);

    const textElement = getByText('Title Text');
    expect(textElement.props.style).toContainEqual({
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 32,
    });
  });

  it('applies subtitle style when type is subtitle', () => {
    const { getByText } = render(<ThemedText type="subtitle">Subtitle Text</ThemedText>);

    const textElement = getByText('Subtitle Text');
    expect(textElement.props.style).toContainEqual({
      fontSize: 20,
      fontWeight: 'bold',
    });
  });

  it('applies defaultSemiBold style when type is defaultSemiBold', () => {
    const { getByText } = render(<ThemedText type="defaultSemiBold">SemiBold Text</ThemedText>);

    const textElement = getByText('SemiBold Text');
    expect(textElement.props.style).toContainEqual({
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
    });
  });

  it('applies link style when type is link', () => {
    const { getByText } = render(<ThemedText type="link">Link Text</ThemedText>);

    const textElement = getByText('Link Text');
    expect(textElement.props.style).toContainEqual({
      lineHeight: 30,
      fontSize: 16,
      color: '#0a7ea4',
    });
  });

  it('applies default style when type is default', () => {
    const { getByText } = render(<ThemedText type="default">Default Text</ThemedText>);

    const textElement = getByText('Default Text');
    expect(textElement.props.style).toContainEqual({
      fontSize: 16,
      lineHeight: 24,
    });
  });

  it('applies custom style when provided', () => {
    const customStyle = { fontSize: 20, color: '#FF0000' };
    const { getByText } = render(<ThemedText style={customStyle}>Custom Text</ThemedText>);

    const textElement = getByText('Custom Text');
    expect(textElement.props.style).toContainEqual(customStyle);
  });

  it('passes through other props correctly', () => {
    const { getByText } = render(
      <ThemedText numberOfLines={2} ellipsizeMode="tail">
        Long Text
      </ThemedText>,
    );

    const textElement = getByText('Long Text');
    expect(textElement.props.numberOfLines).toBe(2);
    expect(textElement.props.ellipsizeMode).toBe('tail');
  });

  it('calls useThemeColor with correct parameters', () => {
    const lightColor = '#FF0000';
    const darkColor = '#0000FF';

    render(
      <ThemedText lightColor={lightColor} darkColor={darkColor}>
        Test Text
      </ThemedText>,
    );

    expect(mockUseThemeColor).toHaveBeenCalledWith(
      { light: lightColor, dark: darkColor },
      'text',
    );
  });

  it('applies both theme color and custom styles', () => {
    mockUseThemeColor.mockReturnValue('#00FF00');
    const customStyle = { fontSize: 18 };

    const { getByText } = render(
      <ThemedText type="title" style={customStyle}>
        Styled Text
      </ThemedText>,
    );

    const textElement = getByText('Styled Text');
    expect(textElement.props.style).toContainEqual({ color: '#00FF00' });
    expect(textElement.props.style).toContainEqual({
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 32,
    });
    expect(textElement.props.style).toContainEqual(customStyle);
  });
});
