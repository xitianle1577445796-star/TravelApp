import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';

export default function CommunityScreen() {
  const [posts, setPosts] = useState([
    { id: '1', author: 'Su Shi', content: 'Sharing my recent ink-wash painting of the Yangtze River.' },
    { id: '2', author: 'Wang Wei', content: 'Looking for companions to travel to the snowy mountains.' },
  ]);
  const [newContent, setNewContent] = useState('');

  const addPost = () => {
    if (!newContent) return;
    setPosts([{ id: Date.now().toString(), author: 'Me (Traveler)', content: newContent }, ...posts]);
    setNewContent('');
  };

  return (
    <View style={styles.screen}>
      <Image source={require('../../assets/bg4.jpg')} style={styles.bgImage} />
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Ink Community Forum</Text>

        <View style={styles.postBox}>
          <TextInput
            style={styles.textArea}
            placeholder="Share your thoughts with fellow travelers..."
            placeholderTextColor="#64748b"
            multiline
            value={newContent}
            onChangeText={setNewContent}
          />
          <TouchableOpacity style={styles.postButton} onPress={addPost}>
            <Text style={styles.postButtonText}>Publish to Community</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.author}>@{item.author}</Text>
              <Text style={styles.content}>{item.content}</Text>
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
  postBox: { backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#cbd5e1' },
  textArea: { height: 70, textAlignVertical: 'top', fontSize: 14, color: '#0f172a' },
  postButton: { backgroundColor: '#0f172a', padding: 10, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  postButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  card: { backgroundColor: 'rgba(255, 255, 255, 0.92)', padding: 15, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#cbd5e1' },
  author: { fontSize: 14, fontWeight: 'bold', color: '#0284c7' },
  content: { fontSize: 14, color: '#334155', marginTop: 6 },
});