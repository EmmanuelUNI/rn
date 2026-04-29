const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    ...defaultConfig.resolver,
    blockList: [
      /android\/app\/\.cxx\/.*/,
      /node_modules\/.*\/android\/\.cxx\/.*/
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);