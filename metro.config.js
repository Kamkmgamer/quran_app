/* global __dirname */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add path alias support for @/
config.resolver.alias = {
  '@': path.resolve(__dirname),
};

module.exports = config;
