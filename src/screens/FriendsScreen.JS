import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';

export default function FriendsScreen() {
  const [friends, setFriends] = useState([
    { id: '1', name: 'Master Wang', status: 'Exploring Mount Huang' },
    { id: '2', name: 'Li Bai', status: 'Drinking wine under the moon' },
  ]);
  const [friendName, setFriendName] = useState('');

  const addFriend = () => {
    if (!friendName) return;
    setFriends([...friends, { id: Date.now().toString(), name: friendName, status: 'Traveling together' }]);
    setFriendName('');
  };

  return (
    <View style={styles.screen}>
      <Image source={require('../../assets/bg3.jpg')} style={styles.bgImage} />
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Travel Mates & Friends</Text>
        
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter friend's name..."
            placeholderTextColor="#64748b"
            value={friendName}
            onChangeText={setFriendName}
          />
          <TouchableOpacity style={styles.addButton} onPress={addFriend}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.status}>Status: {item.status}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  bgImage: { position: 'absolute', width: '100%', height: '100%', resizeMode: 'cover' },
  container: { flex: 1, padding: 20, backgroundColor: 'rgba(248, 250, 252, 0.85)' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#1e293b', textAlign: 'center', fontFamily: 'serif' },
  inputRow: { flexDirection: 'row', marginBottom: 15 },
  input: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, fontSize: 15, color: '#0f172a' },
  addButton: { backgroundColor: '#0284c7', justifyContent: 'center', paddingHorizontal: 15, borderRadius: 8, marginLeft: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: 'rgba(255, 255, 255, 0.92)', padding: 15, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#cbd5e1' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  status: { fontSize: 13, color: '#64748b', marginTop: 4 },
});