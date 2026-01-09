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
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import {Theme} from '../utils/theme';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Theme.colors.background,
          },
          headerTintColor: Theme.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'AccuRead',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{
            title: 'Reading History',
            headerStyle: {
              backgroundColor: Theme.colors.background,
            },
            headerTintColor: Theme.colors.text,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
