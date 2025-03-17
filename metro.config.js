const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts = [...defaultConfig.resolver.assetExts, 'png'];

module.exports = mergeConfig(defaultConfig, {});
