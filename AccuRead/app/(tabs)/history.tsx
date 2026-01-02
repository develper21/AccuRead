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
