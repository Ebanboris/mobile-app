import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av';
import { Audio } from 'expo-av';
import { NotificationContext } from '../NotificationContext';
import * as Notifications from 'expo-notifications';

const DISASTER_TYPES = ['Flood', 'Fire', 'Landslide', 'Earthquake'];

// Updated base URL to your backend disasters endpoint
const API_BASE_URL = 'http://192.168.1.92:5000/api/disasters';

export default function ReportScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({
    type: '',
    location: '',
    description: '',
    media: null,
  });
  const [username, setUsername] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setHasNewPost } = useContext(NotificationContext);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Please grant media library permissions to upload images or videos.'
        );
      }
      fetchReports();
    })();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await AsyncStorage.getItem('profile');
      if (profile) {
        setUsername(JSON.parse(profile).username);
      } else {
        setUsername('');
      }
    };
    const unsubscribe = navigation.addListener('focus', loadProfile);
    return unsubscribe;
  }, [navigation]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      Alert.alert('Error', 'Failed to load disaster reports. Please check your network connection or API URL.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Media permission is needed.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets?.[0]?.uri;
      if (uri) {
        setForm({ ...form, media: uri });
      }
    }
  };

  const handleEdit = (item) => {
    setForm({
      type: item.type,
      location: item.location,
      description: item.description,
      media: item.image || null,
    });
    setEditingId(item.id);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
              });
              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete report: ${response.status} ${errorText}`);
              }
              Alert.alert('Success', 'Report deleted successfully.');
              fetchReports();
            } catch (error) {
              console.error('Error deleting report:', error);
              Alert.alert('Error', `Failed to delete report: ${error.message}`);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const playNotificationSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sound.wav')
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const handleSubmit = async () => {
    if (!form.type || !form.location || !form.description) {
      Alert.alert('Validation Error', 'Please fill all required fields (Type, Location, Description).');
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let mediaUrl = form.media;
    if (form.media && !form.media.startsWith('http') && !form.media.startsWith('file://')) {
      Alert.alert('Uploading Media', 'Please wait while your media is being uploaded...');
      try {
        mediaUrl = await uploadMedia(form.media);
        if (!mediaUrl) {
          throw new Error("Media upload returned no URL.");
        }
      } catch (uploadError) {
        console.error('Media upload failed:', uploadError);
        Alert.alert('Upload Failed', `Could not upload media: ${uploadError.message}. Please try again.`);
        return;
      }
    } else if (form.media && form.media.startsWith('file://')) {
      Alert.alert('Uploading Media', 'Please wait while your media is being uploaded...');
      try {
        mediaUrl = await uploadMedia(form.media);
        if (!mediaUrl) {
          throw new Error("Media upload returned no URL.");
        }
      } catch (uploadError) {
        console.error('Media upload failed:', uploadError);
        Alert.alert('Upload Failed', `Could not upload media: ${uploadError.message}. Please try again.`);
        return;
      }
    }

    const reportData = {
      type: form.type,
      location: form.location,
      description: form.description,
      username: username || 'Anonymous',
      date: formattedDate,
      time: formattedTime,
      image: mediaUrl,
    };

    try {
      let response;
      if (editingId) {
        response = await fetch(`${API_BASE_URL}/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to update report: ${response.status} ${errorText}`);
        }
        Alert.alert('Success', 'Disaster report updated successfully!');
      } else {
        response = await fetch(`${API_BASE_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create report: ${response.status} ${errorText}`);
        }
        Alert.alert('Success', 'Disaster report published!');
      }

      fetchReports();
      playNotificationSound();
      setHasNewPost(true);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'BRAM',
          body: editingId ? 'Your disaster report has been updated!' : 'Your disaster report has been published!',
          sound: true,
        },
        trigger: null,
      });

      handleCancel();
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Submission Failed', `There was an issue submitting your report: ${error.message}`);
    }
  };

  const uploadMedia = async (localUri) => {
    const formData = new FormData();
    const fileExtension = localUri.split('.').pop();
    const fileName = localUri.split('/').pop();

    formData.append('media', {
      uri: localUri,
      name: fileName,
      type: fileExtension === 'mp4' || fileExtension === 'mov' ? 'video/mp4' : `image/${fileExtension}`,
    });

    try {
      const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Media upload failed: ${uploadResponse.status} ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      if (uploadResult.url) {
        return uploadResult.url;
      } else {
        throw new Error('Backend did not return a valid media URL after upload.');
      }
    } catch (error) {
      console.error('Error during media upload:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setForm({ type: '', location: '', description: '', media: null });
    setEditingId(null);
  };

  const renderReport = ({ item }) => (
    <View style={styles.reportCard}>
      <Text style={styles.reportType}>{item.type}</Text>
      <Text style={styles.reportUser}>By: {item.username}</Text>
      <Text style={styles.reportLocation}>Location: {item.location}</Text>
      <Text style={styles.reportDesc}>{item.description}</Text>
      {(item.date || item.time) && (
        <Text style={styles.reportDate}>
          {item.date && `Date: ${item.date}`} {item.time && `Time: ${item.time}`}
        </Text>
      )}
      {item.image && (item.image.startsWith('http') || item.image.startsWith('file://')) ? (
        item.image.toLowerCase().endsWith('.mp4') || item.image.toLowerCase().endsWith('.mov') ? (
          <Video
            source={{ uri: item.image }}
            style={styles.reportMedia}
            useNativeControls
            resizeMode="contain"
            isLooping
          />
        ) : (
          <Image source={{ uri: item.image }} style={styles.reportMedia} />
        )
      ) : null}
      {item.username === username && (
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={{ marginRight: 16 }}>
            <Text style={{ color: '#3949ab', fontWeight: 'bold' }}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Text style={{ color: 'red', fontWeight: 'bold' }}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3949ab" />
          <Text style={{ marginTop: 10 }}>Loading reports...</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReport}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40 }}>No disaster reports yet.</Text>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (!username) {
            Alert.alert('Login Required', 'Please login or register to post a report.');
          } else {
            setModalVisible(true);
          }
        }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Disaster Report' : 'New Disaster Report'}</Text>
            <Text style={styles.label}>Type</Text>
            <View style={styles.pickerRow}>
              {DISASTER_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeBtn,
                    form.type === type && styles.typeBtnActive,
                  ]}
                  onPress={() => setForm({ ...form, type })}
                >
                  <Text style={form.type === type ? styles.typeTextActive : styles.typeText}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter location"
              value={form.location}
              onChangeText={(location) => setForm({ ...form, location })}
            />
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 60 }]}
              placeholder="Describe the disaster"
              value={form.description}
              onChangeText={(description) => setForm({ ...form, description })}
              multiline
            />
            <TouchableOpacity style={styles.mediaBtn} onPress={handlePickMedia}>
              <Ionicons name="image" size={22} color="#3949ab" />
              <Text style={styles.mediaBtnText}>
                {form.media ? 'Change Photo/Video' : 'Add Photo/Video'}
              </Text>
            </TouchableOpacity>
            {form.media && (
              (form.media.toLowerCase().endsWith('.mp4') || form.media.toLowerCase().endsWith('.mov')) ? (
                <Video
                  source={{ uri: form.media }}
                  style={styles.preview}
                  useNativeControls
                  resizeMode="contain"
                  isLooping
                />
              ) : (
                <Image source={{ uri: form.media }} style={styles.preview} />
              )
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitText}>{editingId ? 'Update' : 'Post'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f6fc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#3949ab',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    width: '90%',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3949ab',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    color: '#222',
  },
  pickerRow: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  typeBtn: {
    borderWidth: 1,
    borderColor: '#3949ab',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  typeBtnActive: {
    backgroundColor: '#3949ab',
  },
  typeText: {
    color: '#3949ab',
    fontWeight: 'bold',
  },
  typeTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f8f8ff',
    marginBottom: 8,
  },
  mediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  mediaBtnText: {
    marginLeft: 8,
    color: '#3949ab',
    fontWeight: 'bold',
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelBtn: {
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  cancelText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: '#3949ab',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    margin: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reportCard: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  reportType: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#3949ab',
  },
  reportUser: {
    fontStyle: 'italic',
    color: '#666',
    marginTop: 2,
  },
  reportLocation: {
    marginTop: 6,
    color: '#555',
  },
  reportDesc: {
    marginTop: 8,
    fontSize: 15,
    color: '#444',
  },
  reportDate: {
    marginTop: 10,
    fontSize: 13,
    color: '#999',
  },
  reportMedia: {
    marginTop: 10,
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
});
