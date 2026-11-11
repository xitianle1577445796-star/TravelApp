import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import AddTripScreen from '../screens/AddTripScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator 
        screenOptions={{ 
          headerShown: false, 
          tabBarStyle: { backgroundColor: '#F4F1EA', borderTopColor: '#D3D3D3' },
          tabBarActiveTintColor: '#2C3E50',
          tabBarInactiveTintColor: '#888888'
        }}>
        <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Shan Shui Annals' }} />
        <Tab.Screen name="AddTab" component={AddTripScreen} options={{ title: 'New Inscription' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
