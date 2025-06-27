import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, FlatList } from 'react-native';

const DISASTER_TYPES = [
  { type: 'Flood', icon: require('../assets/flood-icon-vector.jpg') },
  { type: 'Fire', icon: require('../assets/fire-icon-1513x2048-1ztytpky.png') },
  { type: 'Landslide', icon: require('../assets/OIP (1).jpeg') },
  { type: 'Earthquake', icon: require('../assets/earth.jpeg') },
];

const API_BASE_URL = 'http://192.168.1.92:5000/api/disasters'; // Update to your backend IP if needed

export default function AlertsScreen() {
  const [reports, setReports] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [seenCounts, setSeenCounts] = useState({});

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Failed to fetch reports');
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };
    fetchReports();
    const interval = setInterval(fetchReports, 2000); // Poll for updates
    return () => clearInterval(interval);
  }, []);

  const getReportsByType = (type) => reports.filter(r => r.type === type);

  // Split icons into two rows
  const firstRow = DISASTER_TYPES.slice(0, 2);
  const secondRow = DISASTER_TYPES.slice(2, 4);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Alerts</Text>
      <View style={styles.iconRow}>
        {firstRow.map(({ type, icon }) => {
          const hasUnseen = getReportsByType(type).length > (seenCounts[type] || 0);
          return (
            <TouchableOpacity
              key={type}
              style={styles.iconContainer}
              onPress={() => {
                setSelectedType(type);
                setSeenCounts({
                  ...seenCounts,
                  [type]: getReportsByType(type).length
                });
              }}
            >
              <View style={styles.iconCard}>
                <Image source={icon} style={styles.icon} />
                {hasUnseen && <View style={styles.dot} />}
              </View>
              <Text style={styles.label}>{type}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.iconRow}>
        {secondRow.map(({ type, icon }) => {
          const hasUnseen = getReportsByType(type).length > (seenCounts[type] || 0);
          return (
            <TouchableOpacity
              key={type}
              style={styles.iconContainer}
              onPress={() => {
                setSelectedType(type);
                setSeenCounts({
                  ...seenCounts,
                  [type]: getReportsByType(type).length
                });
              }}
            >
              <View style={styles.iconCard}>
                <Image source={icon} style={styles.icon} />
                {hasUnseen && <View style={styles.dot} />}
              </View>
              <Text style={styles.label}>{type}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Modal to show reports for selected type */}
      <Modal visible={!!selectedType} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedType} Reports</Text>
            <FlatList
              data={getReportsByType(selectedType)}
              keyExtractor={item => item.id?.toString() || Math.random().toString()}
              renderItem={({ item }) => (
                <View style={styles.reportCard}>
                  <Text style={styles.reportUser}>By: {item.username}</Text>
                  <Text style={styles.reportLocation}>Location: {item.location}</Text>
                  <Text style={styles.reportDesc}>{item.description}</Text>
                  {(item.date || item.time) && (
                    <Text style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>
                      {item.date && `Date: ${item.date}`} {item.time && `Time: ${item.time}`}
                    </Text>
                  )}
                  {item.media && (
                    <Image source={{ uri: item.media }} style={styles.reportMedia} />
                  )}
                  {item.image && (
                    <Image source={{ uri: item.image }} style={styles.reportMedia} />
                  )}
                </View>
              )}
              ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No reports yet.</Text>}
            />
            <TouchableOpacity onPress={() => setSelectedType(null)} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f6fc', paddingTop: 40 },
  header: { fontSize: 26, fontWeight: 'bold', color: '#1a237e', marginBottom: 24, textAlign: 'center' },
  iconRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 20 },
  iconContainer: { alignItems: 'center', marginHorizontal: 10 },
  iconCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    position: 'relative',
  },
  icon: { width: 60, height: 60, borderRadius: 14 },
  label: { fontSize: 15, fontWeight: '700', color: '#3949ab', marginTop: 2, letterSpacing: 0.5 },
  dot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'red',
    borderWidth: 2,
    borderColor: '#fff',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 18, padding: 20, width: '90%', maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#3949ab', marginBottom: 16, textAlign: 'center' },
  reportCard: { backgroundColor: '#f2f6fc', borderRadius: 10, padding: 10, marginBottom: 12 },
  reportUser: { color: '#666', fontSize: 13, marginBottom: 2 },
  reportLocation: { color: '#888', fontSize: 13, marginBottom: 6 },
  reportDesc: { color: '#222', fontSize: 15, marginBottom: 6 },
  reportMedia: { width: '100%', height: 120, borderRadius: 8, marginTop: 4 },
  closeBtn: { alignSelf: 'center', marginTop: 10, padding: 10 },
  closeText: { color: '#3949ab', fontWeight: 'bold', fontSize: 16 },
});
