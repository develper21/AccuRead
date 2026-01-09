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

import React from 'react';
import { View, StyleSheet } from 'react-native';
import HistoryScreenComponent from '../../screens/HistoryScreen';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <HistoryScreenComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
