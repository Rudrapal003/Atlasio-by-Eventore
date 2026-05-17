const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .web.jsx, .native.jsx etc.
config.resolver.sourceExts = [
  'web.js', 'web.jsx', 'web.ts', 'web.tsx',
  'native.js', 'native.jsx', 'native.ts', 'native.tsx',
  ...config.resolver.sourceExts
];

module.exports = config;
