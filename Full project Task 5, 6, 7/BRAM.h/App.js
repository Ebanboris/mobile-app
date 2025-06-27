import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import ReportScreen from './screens/ReportScreen';
import AlertsScreen from './screens/AlertsScreen';
import ProfileScreen from './screens/ProfileScreen';
import TipsScreen from './screens/TipsScreen';

import { NotificationProvider, NotificationContext } from './NotificationContext';

const Tab = createBottomTabNavigator();

function TabBarIconWithBadge({ name, color, size, showBadge }) {
  return (
    <View>
      <Ionicons name={name} size={size} color={color} />
      {showBadge && (
        <View
          style={{
            position: 'absolute',
            right: -2,
            top: -2,
            backgroundColor: 'tomato',
            borderRadius: 6,
            width: 10,
            height: 10,
            borderWidth: 1,
            borderColor: '#fff',
          }}
        />
      )}
    </View>
  );
}

function Tabs() {
  const { hasNewPost } = useContext(NotificationContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home': iconName = 'home'; break;
            case 'Report': iconName = 'alert-circle'; break;
            case 'Alerts': iconName = 'notifications'; break;
            case 'Profile': iconName = 'person'; break;
            case 'Tips': iconName = 'bulb'; break;
          }
          if (route.name === 'Alerts') {
            return (
              <TabBarIconWithBadge
                name={iconName}
                color={color}
                size={size}
                showBadge={hasNewPost}
              />
            );
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Tips" component={TipsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <NavigationContainer>
        <Tabs />
      </NavigationContainer>
    </NotificationProvider>
  );
}
