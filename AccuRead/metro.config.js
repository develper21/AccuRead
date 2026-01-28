/**
 * Copyright (c) 2025 develper21
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * 
 * IMPORTANT: Removal of this header violates the license terms.
 * This code remains the property of develper21 and is protected
 * under intellectual property laws.
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.sourceExts = [
    ...config.resolver.sourceExts,
    'mjs',
    'cjs',
];

// Ensure proper asset extensions
config.resolver.assetExts = [
    ...config.resolver.assetExts,
    'db',
    'mp3',
    'ttf',
    'obj',
    'png',
    'jpg',
];

// Add node_modules resolution
config.resolver.nodeModulesPaths = [
    path.resolve(__dirname, 'node_modules'),
];

// Watchman configuration
config.watchFolders = [__dirname];

module.exports = config;
