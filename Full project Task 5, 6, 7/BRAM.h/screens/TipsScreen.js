import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function TipsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Disaster Safety Tips</Text>

      <View style={styles.card}>
        <Text style={styles.title}>🔥 Fire</Text>
        <Text style={styles.tip}>
          • Stay calm and evacuate immediately if instructed.{"\n"}
          • Use stairs, not elevators.{"\n"}
          • If trapped, seal doors and signal for help.{"\n"}
          • Stop, drop, and roll if your clothes catch fire.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>🏔️ Landslide</Text>
        <Text style={styles.tip}>
          • Move away from the path of a landslide as quickly as possible.{"\n"}
          • Listen for unusual sounds that might indicate moving debris.{"\n"}
          • Stay alert during heavy rainfall.{"\n"}
          • Avoid river valleys and low-lying areas.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>🌎 Earthquake</Text>
        <Text style={styles.tip}>
          • Drop, cover, and hold on.{"\n"}
          • Stay away from windows and heavy objects.{"\n"}
          • If outdoors, move to an open area away from buildings.{"\n"}
          • After shaking stops, check for injuries and hazards.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>🌊 Flood</Text>
        <Text style={styles.tip}>
          • Move to higher ground immediately.{"\n"}
          • Avoid walking or driving through flood waters.{"\n"}
          • Listen to emergency broadcasts for updates.{"\n"}
          • Disconnect electrical appliances if safe to do so.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf0fa',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 28,
    textAlign: 'center',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3949ab',
    marginBottom: 10,
  },
  tip: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});