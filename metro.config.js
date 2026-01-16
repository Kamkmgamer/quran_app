/* global __dirname */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add path alias support for @/
config.resolver.alias = {
  '@': path.resolve(__dirname),
};

// Configure SVG transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

const { assetExts, sourceExts } = config.resolver;

config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: true,
  assetExts: assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...sourceExts, 'svg', 'cjs', 'mjs'],
};

module.exports = config;
