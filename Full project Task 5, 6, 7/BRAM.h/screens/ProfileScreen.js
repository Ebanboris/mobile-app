import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://192.168.1.92:5000/api"; // Your backend API base URL

export default function ProfileScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState({
    username: '',
    email: '',
    location: '',
    password: '',
    confirmPassword: '',
  });
  const [mode, setMode] = useState('choose'); // 'choose', 'login', 'signup', 'edit'

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        await AsyncStorage.setItem('profile', JSON.stringify(data.profile)); // ✅ Save locally
        setProfile(data.profile);
        setIsLoggedIn(true);
        setMode('view');
        Alert.alert('Login Successful');
      } else {
        Alert.alert('Invalid credentials');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleSignup = async () => {
    if (!form.username || !form.email || !form.location || !form.password || !form.confirmPassword) {
      Alert.alert('Please fill all fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          location: form.location,
          password: form.password,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const newProfile = {
          username: form.username,
          email: form.email,
          location: form.location,
        };
        await AsyncStorage.setItem('profile', JSON.stringify(newProfile)); // ✅ Save locally
        setProfile(newProfile);
        setIsLoggedIn(true);
        setMode('view');
        Alert.alert('Signup Successful');
      } else {
        Alert.alert('Signup failed');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('profile'); // ✅ Clear from local storage
    setIsLoggedIn(false);
    setMode('choose');
    setProfile({});
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${API_URL}/users/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          location: form.location,
        }),
      });
      const data = await response.json();
      if (data.success) {
        const updatedProfile = {
          username: form.username,
          email: form.email,
          location: form.location,
        };
        await AsyncStorage.setItem('profile', JSON.stringify(updatedProfile)); // ✅ Update local storage
        setProfile(updatedProfile);
        setMode('view');
        Alert.alert("Profile updated successfully!");
      } else {
        Alert.alert("Update failed");
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  if (isLoggedIn && (mode === 'view' || mode === 'choose')) {
    return (
      <View style={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.username ? profile.username[0].toUpperCase() : ''}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile.username}</Text>
          <Text style={styles.profileInfo}>Email: {profile.email}</Text>
          <Text style={styles.profileInfo}>Location: {profile.location}</Text>
        </View>
        <Button title="Edit Profile" onPress={() => {
          setForm({
            username: profile.username,
            email: profile.email,
            location: profile.location,
            password: '',
            confirmPassword: ''
          });
          setMode('edit');
        }} />
        <View style={{ height: 10 }} />
        <Button title="Logout" onPress={handleLogout} />
      </View>
    );
  }

  if (isLoggedIn && mode === 'edit') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Edit Profile</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={form.username}
          onChangeText={username => setForm({ ...form, username })}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={form.email}
          onChangeText={email => setForm({ ...form, email })}
        />
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={form.location}
          onChangeText={location => setForm({ ...form, location })}
        />
        <Button title="Save Changes" onPress={handleUpdate} />
        <TouchableOpacity onPress={() => setMode('view')}>
          <Text style={styles.link}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (mode === 'signup') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Signup</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={form.username}
          onChangeText={username => setForm({ ...form, username })}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={form.email}
          onChangeText={email => setForm({ ...form, email })}
        />
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={form.location}
          onChangeText={location => setForm({ ...form, location })}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={form.password}
          onChangeText={password => setForm({ ...form, password })}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={form.confirmPassword}
          onChangeText={confirmPassword => setForm({ ...form, confirmPassword })}
        />
        <Button title="Signup" onPress={handleSignup} />
        <TouchableOpacity onPress={() => setMode('login')}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (mode === 'login') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={form.username}
          onChangeText={username => setForm({ ...form, username })}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={form.password}
          onChangeText={password => setForm({ ...form, password })}
        />
        <Button title="Login" onPress={handleLogin} />
        <TouchableOpacity onPress={() => setMode('signup')}>
          <Text style={styles.link}>Don't have an account? Signup</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isLoggedIn && mode === 'choose') {
    return (
      <View style={styles.container}>
        <Button title="Login" onPress={() => setMode('login')} />
        <View style={{ height: 20 }} />
        <Button title="Signup" onPress={() => setMode('signup')} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  link: {
    color: '#007bff',
    marginTop: 15,
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 16,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    width: 300,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },
  profileInfo: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
});
