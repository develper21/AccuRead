import React from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreenComponent from '../../screens/HomeScreen';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <HomeScreenComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
