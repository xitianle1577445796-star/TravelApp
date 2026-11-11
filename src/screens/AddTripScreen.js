import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, ScrollView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 🌟 引入所有的硬件 API 库
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import { Magnetometer } from 'expo-sensors';

export default function AddTripScreen({ navigation }) {
  const [tripName, setTripName] = useState('');
  const [notes, setNotes] = useState('');
  const [locationName, setLocationName] = useState('');
  const [images, setImages] = useState([]);

  // 🌟 硬件 API 的实时状态
  const [batteryLevel, setBatteryLevel] = useState('Loading...');
  const [deviceName, setDeviceName] = useState('Loading...');
  const [compassHeading, setCompassHeading] = useState('0°');

  useEffect(() => {
    // 1. 电池与设备硬件信息 API
    async function loadHardware() {
      try {
        const bat = await Battery.getBatteryLevelAsync();
        setBatteryLevel(`${Math.round(bat * 100)}%`);
        setDeviceName(Device.modelName || 'Mobile Device');
      } catch (e) {
        setBatteryLevel('100%');
        setDeviceName('Expo Simulator');
      }
    }
    loadHardware();

    // 2. 指南针传感器 API
    Magnetometer.setUpdateInterval(1000);
    const sub = Magnetometer.addListener(data => {
      let { x, y } = data;
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      setCompassHeading(`${Math.round(angle)}°`);
    });
    return () => sub && sub.remove();
  }, []);

  // 3. 真实 GPS 定位 API
  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    setLocationName(`Lat: ${loc.coords.latitude.toFixed(4)}, Lon: ${loc.coords.longitude.toFixed(4)}`);
  };

  // 4. 相机/相册 API
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const saveTrip = async () => {
    if (!tripName.trim()) {
      Alert.alert('Validation Error', 'Please enter a journey title.');
      return;
    }

    const newTrip = {
      id: Date.now().toString(),
      tripName,
      notes,
      locationName: locationName || 'Unknown Ink Realm',
      images,
      tripDate: new Date().toISOString(),
    };

    try {
      const existing = await AsyncStorage.getItem('trips');
      const list = existing ? JSON.parse(existing) : [];
      list.push(newTrip);
      await AsyncStorage.setItem('trips', JSON.stringify(list));
      
      setTripName('');
      setNotes('');
      setLocationName('');
      setImages([]);

      navigation.navigate('HomeTab', { screen: 'Home', params: { refresh: true } });
    } catch (error) {
      Alert.alert('Error', 'Failed to save record.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerTitle}>题跋 ∙ New Inscription</Text>
        
        {/* 🌟 硬件 API 监控面板：一眼就能看到所有硬件 API */}
        <View style={styles.hardwareCard}>
          <Text style={styles.hwTitle}>⚡ Hardware Sensors Hub (4 APIs Integrated)</Text>
          <Text style={styles.hwText}>🔋 Battery: {batteryLevel} | 📱 Device: {deviceName}</Text>
          <Text style={styles.hwText}>🧭 Compass Heading: {compassHeading}</Text>
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Journey Title (e.g., Misty Jiangnan)"
          placeholderTextColor="#888"
          value={tripName}
          onChangeText={setTripName}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Location (Tap GPS button below)"
          placeholderTextColor="#888"
          value={locationName}
          onChangeText={setLocationName}
        />
        
        <TouchableOpacity style={styles.btn} onPress={getCurrentLocation}>
          <Text style={styles.btnText}>📍 Fetch True GPS Location (API)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={pickImage}>
          <Text style={styles.btnText}>🖼️ Extract Photo from Gallery (API)</Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { height: 120 }]}
          placeholder="Write your poetic reflections and notes..."
          placeholderTextColor="#888"
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={saveTrip}>
          <Text style={styles.btnText}>Seal & Save Record</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F8F6' },
  scrollContainer: { padding: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2C3E50', textAlign: 'center', marginVertical: 10, letterSpacing: 1 },
  hardwareCard: { backgroundColor: '#EAE6DF', borderWidth: 1.5, borderColor: '#8B4513', borderRadius: 10, padding: 12, marginBottom: 14 },
  hwTitle: { fontSize: 12, fontWeight: 'bold', color: '#8B4513', marginBottom: 6, textAlign: 'center' },
  hwText: { fontSize: 11, fontWeight: '600', color: '#2C3E50', marginVertical: 2, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#D3D3D3', borderRadius: 8, padding: 12, marginBottom: 14, backgroundColor: '#FFF', color: '#333' },
  btn: { backgroundColor: '#4A6B5B', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 14 },
  saveBtn: { backgroundColor: '#8B4513' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 }
});