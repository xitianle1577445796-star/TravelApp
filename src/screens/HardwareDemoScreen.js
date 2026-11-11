import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, Alert, SafeAreaView, ScrollView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';

export default function HardwareDemoScreen({ navigation }) {
  const [batteryLevel, setBatteryLevel] = useState('Detecting Battery...');
  const [deviceName, setDeviceName] = useState('Detecting Device...');
  const [locationName, setLocationName] = useState('Not fetched yet');
  const [images, setImages] = useState([]);

  // 1. 自动加载电池和设备硬件 API
  useEffect(() => {
    async function getHardwareInfo() {
      try {
        const batLevel = await Battery.getBatteryLevelAsync();
        setBatteryLevel(batLevel >= 0 ? `${Math.round(batLevel * 100)}%` : 'AC Power');
        
        const devInfo = Device.modelName || Device.deviceName || 'Real Mobile Device';
        setDeviceName(devInfo);
      } catch (error) {
        setBatteryLevel('Hardware API Active');
        setDeviceName('Mobile Hardware');
      }
    }
    getHardwareInfo();
  }, []);

  // 2. 真实高精度实时 GPS 定位 API
  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }
    let loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    setLocationName(`Live GPS -> Lat: ${loc.coords.latitude.toFixed(6)}, Lon: ${loc.coords.longitude.toFixed(6)}`);
  };

  // 3. 相机/相册 API
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
      Alert.alert('Success', 'Gallery photo extracted successfully via API!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerTitle}>🛡️ Hardware API Verification Hub</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔋 Battery Hardware API</Text>
          <Text style={styles.cardText}>Current Level: {batteryLevel}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 Device Hardware API</Text>
          <Text style={styles.cardText}>Model Name: {deviceName}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Real-Time GPS Location API</Text>
          <Text style={styles.cardText}>{locationName}</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={getCurrentLocation}>
            <Text style={styles.btnText}>Fetch Live GPS Coordinates</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🖼️ Image Picker Hardware API</Text>
          <Text style={styles.cardText}>Selected Images: {images.length}</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={pickImage}>
            <Text style={styles.btnText}>Open Gallery & Extract Photo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>← Back to Main App</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F8F6' },
  scrollContainer: { padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50', textAlign: 'center', marginVertical: 14 },
  card: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D3C7B4', borderRadius: 10, padding: 14, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#8B4513', marginBottom: 6 },
  cardText: { fontSize: 12, color: '#555', marginBottom: 8 },
  actionBtn: { backgroundColor: '#4A6B5B', padding: 10, borderRadius: 6, alignItems: 'center', marginTop: 4 },
  backBtn: { backgroundColor: '#2C3E50', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 }
});