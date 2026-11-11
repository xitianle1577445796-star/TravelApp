import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { ThemeContext } from '../context/ThemeContext';

export default function PickLocationScreen({ navigation }) {
  const { colors } = useContext(ThemeContext);
  const [selected, setSelected] = useState({ name: 'Beihai Scenic Peak, Anhui', lat: 30.1333, lng: 118.1667 });
  const [loading, setLoading] = useState(false);

  const fetchCurrentGPSLocation = async () => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied.');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      let reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      let locationName = 'Current GPS Location';
      if (reverseGeocode && reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        locationName = `${place.name || place.city || 'My Location'}, ${place.region || ''}`;
      }

      setSelected({
        name: locationName,
        lat: parseFloat(latitude.toFixed(4)),
        lng: parseFloat(longitude.toFixed(4))
      });
    } catch (e) {
      console.log('GPS Error:', e);
      alert('Unable to fetch current GPS. Using default preset.');
    } finally {
      setLoading(false);
    }
  };

  const presets = [
    { name: 'Huangshan Peak, Anhui', lat: 30.1333, lng: 118.1667 },
    { name: 'Li River Karst, Guilin', lat: 25.2736, lng: 110.2900 },
    { name: 'West Lake, Hangzhou', lat: 30.2500, lng: 120.1500 }
  ];

  const handleConfirm = () => {
    navigation.navigate('AddTrip', { 
      selectedLocationName: selected.name,
      selectedCoords: { lat: selected.lat, lng: selected.lng }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.textPrimary }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>GPS Location Picker</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.mapCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>📍</Text>
          <Text style={[styles.mapTitle, { color: colors.textPrimary }]}>{selected.name}</Text>
          <Text style={[styles.coords, { color: colors.accent }]}>Lat: {selected.lat}, Lng: {selected.lng}</Text>
          
          <TouchableOpacity 
            style={[styles.gpsButton, { backgroundColor: colors.accent, marginTop: 14 }]} 
            onPress={fetchCurrentGPSLocation}
          >
            {loading ? <ActivityIndicator color="#111418" /> : <Text style={styles.gpsButtonText}>📡 Fetch My Real GPS Location</Text>}
          </TouchableOpacity>
        </View>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Or Select Sacred Peak Preset:</Text>
        {presets.map((p, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={[styles.presetButton, { backgroundColor: colors.card, borderColor: selected.name === p.name ? colors.accent : colors.border }]}
            onPress={() => setSelected(p)}
          >
            <Text style={{ color: colors.textPrimary, fontWeight: 'bold' }}>{p.name}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Lat: {p.lat}, Lng: {p.lng}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.confirmButton, { backgroundColor: colors.accent }]} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16, borderBottomWidth: 1 },
  backButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  title: { fontSize: 18, fontWeight: 'bold', fontFamily: 'serif' },
  content: { padding: 20, flex: 1 },
  mapCard: { borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, marginBottom: 20 },
  mapTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  coords: { fontSize: 12, fontFamily: 'monospace', marginBottom: 4 },
  gpsButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, alignItems: 'center', width: '100%' },
  gpsButtonText: { color: '#111418', fontWeight: 'bold', fontSize: 12 },
  subtitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 10 },
  presetButton: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  confirmButton: { height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  confirmButtonText: { color: '#111418', fontSize: 15, fontWeight: 'bold', textTransform: 'uppercase' }
});
