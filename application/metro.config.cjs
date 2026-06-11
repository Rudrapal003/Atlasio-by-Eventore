const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Expo's default config already handles platform-specific extensions (.native.jsx, .android.jsx, etc.)
// as long as .jsx is in sourceExts.
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'cjs'];

module.exports = config;
