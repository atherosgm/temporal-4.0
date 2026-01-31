const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Esta línea es la clave para solucionar el error de Windows
config.resolver.unstable_enablePackageExports = false;

module.exports = config;