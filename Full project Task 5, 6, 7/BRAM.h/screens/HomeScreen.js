import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const ICONS = [
  { label: 'Flood', icon: require('../assets/flood-icon-vector.jpg'), type: 'Flood' },
  { label: 'Fire', icon: require('../assets/fire-icon-1513x2048-1ztytpky.png'), type: 'Fire' },
  { label: 'Landslide', icon: require('../assets/OIP (1).jpeg'), type: 'Landslide' },
  { label: 'Earthquake', icon: require('../assets/earth.jpeg'), type: 'Earthquake' },
];

export default function HomeScreen({ navigation }) {
  // Split icons into two rows
  const firstRow = ICONS.slice(0, 2);
  const secondRow = ICONS.slice(2, 4);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to B.R.A.M</Text>
      <View style={styles.iconRow}>
        {firstRow.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.iconContainer}
            onPress={() => navigation.navigate('Report', { type: item.type })}
          >
            <View style={styles.iconCard}>
              <Image source={item.icon} style={styles.icon} />
            </View>
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.iconRow}>
        {secondRow.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.iconContainer}
            onPress={() => navigation.navigate('Report', { type: item.type })}
          >
            <View style={styles.iconCard}>
              <Image source={item.icon} style={styles.icon} />
            </View>
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: '#f2f6fc',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#1a237e',
    letterSpacing: 1,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  iconCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  icon: {
    width: 70,
    height: 70,
    borderRadius: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3949ab',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
