const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    resolver: {
        resolveRequest: (context, moduleName, platform, realModuleName) => {
            if (moduleName === 'crypto' || moduleName === 'msrcrypto') {
                // when importing crypto, resolve to react-native-quick-crypto
                return context.resolveRequest(
                    context,
                    'react-native-quick-crypto',
                    platform,
                )
            }
            // otherwise chain to the standard Metro resolver.
            return context.resolveRequest(context, moduleName, platform)
        },
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
