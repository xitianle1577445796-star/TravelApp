import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [liveLocation, setLiveLocation] = useState('Not fetched yet');
  const [selectedImage, setSelectedImage] = useState(null);

  // 1. 硬件 API 1：高精度实时 GPS 定位
  const getLiveGPS = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }
    let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setLiveLocation(`Lat: ${loc.coords.latitude.toFixed(4)}, Lon: ${loc.coords.longitude.toFixed(4)}`);
  };

  // 2. 硬件 API 2：相册提取图片
  const pickGalleryImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      Alert.alert('Success', 'Gallery photo extracted via API!');
    }
  };

  const loadTrips = async () => {
    try {
      const data = await AsyncStorage.getItem("trips");
      if (data) {
        setTrips(JSON.parse(data));
      } else {
        setTrips([]);
      }
    } catch (error) {
      console.log("Failed to load trips", error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTrips();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>InkJourney Annals (行记)</Text>
      
      {/* 🌟 首页置顶：双硬件 API 交互中心 */}
      <View style={styles.hardwareHub}>
        <Text style={styles.hubTitle}>⚡ Hardware APIs Hub (GPS & Gallery)</Text>
        <Text style={styles.hubText}>📍 GPS Status: <Text style={styles.bold}>{liveLocation}</Text></Text>
        
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.smallBtn} onPress={getLiveGPS}>
            <Text style={styles.btnText}>📍 Get Live GPS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallBtn} onPress={pickGalleryImage}>
            <Text style={styles.btnText}>🖼️ Pick Gallery Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {trips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No ink records found yet.</Text>
          <Text style={styles.subText}>Begin your travels and seal your memoirs.</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => navigation.navigate('TripDetails', { trip: item })}
            >
              <Text style={styles.tripTitle}>{item.tripName}</Text>
              <Text style={styles.tripNotes} numberOfLines={2}>{item.notes || 'No reflections written.'}</Text>
              <Text style={styles.tripLocation}>📍 {item.locationName || 'Location not set'}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f6f5f0' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#1c1917' },
  hardwareHub: { backgroundColor: '#EFECE6', borderWidth: 1.5, borderColor: '#8B4513', borderRadius: 10, padding: 12, marginBottom: 15 },
  hubTitle: { fontSize: 12, fontWeight: 'bold', color: '#8B4513', marginBottom: 6, textAlign: 'center' },
  hubText: { fontSize: 11, color: '#333', marginBottom: 8 },
  bold: { fontWeight: 'bold', color: '#2C3E50' },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  smallBtn: { backgroundColor: '#4A6B5B', padding: 8, borderRadius: 6, flex: 0.48, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#57534e', fontWeight: '600' },
  subText: { fontSize: 14, color: '#78716c', marginTop: 5 },
  card: { backgroundColor: '#ffffff', padding: 15, borderRadius: 10, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  tripTitle: { fontSize: 18, fontWeight: 'bold', color: '#1c1917', marginBottom: 5 },
  tripNotes: { fontSize: 14, color: '#44403c', marginBottom: 8 },
  tripLocation: { fontSize: 12, color: '#78716c' }
});