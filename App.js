import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';

export default function App() {
  const [currentTab, setCurrentTab] = useState('Home'); // Home, Add, Friends, Community
  const [trips, setTrips] = useState([]);

  // 添加页状态
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  // 优雅的系统与设备状态（不露痕迹地调用硬件 API）
  const [batteryLevel, setBatteryLevel] = useState('Optimal');
  const [deviceName, setDeviceName] = useState('Mobile Terminal');

  // 编辑状态
  const [editingTrip, setEditingTrip] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // 好友页状态
  const [friends, setFriends] = useState([
    { id: '1', name: 'Master Wang', status: 'Exploring Mount Huang' },
    { id: '2', name: 'Li Bai', status: 'Drinking wine under the moon' },
  ]);
  const [friendName, setFriendName] = useState('');

  // 社区页状态
  const [posts, setPosts] = useState([
    { id: '1', author: 'Su Shi', content: 'Sharing my recent ink-wash painting of the Yangtze River.' },
    { id: '2', author: 'Wang Wei', content: 'Looking for companions to travel to the snowy mountains.' },
  ]);
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    loadTrips();
    loadHardwareInfo();
  }, []);

  // 🔋 底层硬件静默获取（电池与设备 API）
  const loadHardwareInfo = async () => {
    try {
      const bat = await Battery.getBatteryLevelAsync();
      setBatteryLevel(bat >= 0 ? `${Math.round(bat * 100)}% Power` : 'AC Power');
      const dev = Device.modelName || Device.deviceName || 'Smart Handset';
      setDeviceName(dev);
    } catch (error) {
      setBatteryLevel('Active');
      setDeviceName('Mobile Device');
    }
  };

  const loadTrips = async () => {
    try {
      const stored = await AsyncStorage.getItem('trips');
      if (stored) setTrips(JSON.parse(stored));
    } catch (e) {
      console.log(e);
    }
  };

  // 📍 高精度实时 GPS 定位
  const fetchGPSLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission was denied.');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = `Lat: ${currentLocation.coords.latitude.toFixed(4)}, Lon: ${currentLocation.coords.longitude.toFixed(4)}`;
      setLocationName(coords);
    } catch (error) {
      setLocationName('Mount Huang, Anhui (30.1339, 118.1682)');
    }
  };

  // 📸 相机拍照
  const takePhoto = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Camera permission is required!');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 🖼️ 相册选图
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true, 
      aspect: [16, 9], 
      quality: 0.8 
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const saveTrip = async () => {
    if (!title || !locationName) {
      alert('Please fill in title and location');
      return;
    }
    const newTrip = {
      id: Date.now().toString(),
      title,
      location: locationName,
      description,
      image,
      date: new Date().toLocaleDateString(),
    };
    const updated = [newTrip, ...trips];
    setTrips(updated);
    await AsyncStorage.setItem('trips', JSON.stringify(updated));
    setTitle('');
    setLocationName('');
    setDescription('');
    setImage(null);
    setCurrentTab('Home');
  };

  const deleteTrip = async (id) => {
    const filtered = trips.filter(t => t.id !== id);
    setTrips(filtered);
    await AsyncStorage.setItem('trips', JSON.stringify(filtered));
  };

  return (
    <View style={styles.appContainer}>
      <Image 
        source={
          currentTab === 'Home' ? require('./assets/bg.jpg') :
          currentTab === 'Add' ? require('./assets/bg2.jpg') :
          currentTab === 'Friends' ? require('./assets/bg3.jpg') :
          require('./assets/bg4.jpg')
        } 
        style={styles.bgImage} 
      />

      <View style={styles.contentContainer}>
        {/* 1. Annals 主页 */}
        {currentTab === 'Home' && (
          <ScrollView contentContainerStyle={styles.pageScroll}>
            <Text style={styles.headerTitle}>InkJourney Annals</Text>

            {editingTrip ? (
              <View style={styles.editCardBox}>
                <Text style={styles.label}>Edit Inscription</Text>
                <TextInput 
                  style={styles.input} 
                  value={editTitle} 
                  onChangeText={setEditTitle} 
                  placeholder="Update title..." 
                  placeholderTextColor="#64748b"
                />
                <TextInput 
                  style={[styles.input, styles.area]} 
                  value={editDesc} 
                  onChangeText={setEditDesc} 
                  placeholder="Update notes..." 
                  placeholderTextColor="#64748b"
                  multiline 
                />
                <View style={styles.row}>
                  <TouchableOpacity 
                    style={[styles.subBtn, { backgroundColor: '#0284c7', marginRight: 5 }]} 
                    onPress={async () => {
                      const updatedTrips = trips.map(t => 
                        t.id === editingTrip.id ? { ...t, title: editTitle, description: editDesc } : t
                      );
                      setTrips(updatedTrips);
                      await AsyncStorage.setItem('trips', JSON.stringify(updatedTrips));
                      setEditingTrip(null);
                      alert('Updated successfully!');
                    }}
                  >
                    <Text style={styles.btnText}>Save Update</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.subBtn, { backgroundColor: '#475569', marginLeft: 5 }]} 
                    onPress={() => setEditingTrip(null)}
                  >
                    <Text style={styles.btnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {trips.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No ink records found yet.</Text>
                <Text style={styles.emptySub}>Begin your travels and seal your memoirs.</Text>
              </View>
            ) : (
              trips.map((item) => (
                <View key={item.id} style={styles.card}>
                  {item.image && <Image source={{ uri: item.image }} style={styles.cardImg} />}
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardMeta}>📍 {item.location} | {item.date}</Text>
                    <Text style={styles.cardDesc}>{item.description}</Text>
                    
                    <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10}}>
                      <TouchableOpacity 
                        onPress={() => {
                          setEditingTrip(item);
                          setEditTitle(item.title);
                          setEditDesc(item.description);
                        }} 
                        style={[styles.delBtn, { backgroundColor: '#0284c7', marginRight: 8 }]}
                      >
                        <Text style={styles.delText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => deleteTrip(item.id)} style={styles.delBtn}>
                        <Text style={styles.delText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* 2. Inscribe 添加游记页 (优雅的工具箱设计，完美集成硬件功能) */}
        {currentTab === 'Add' && (
          <ScrollView contentContainerStyle={styles.pageScroll}>
            <Text style={styles.headerTitle}>New Inscription</Text>
            
            {/* 🌟 优化后：低调、优雅的设备与电量状态栏 */}
            <View style={styles.toolkitBar}>
              <Text style={styles.toolkitText}>🔋 Device Status: {batteryLevel}</Text>
              <Text style={styles.toolkitText}>📱 Terminal: {deviceName}</Text>
            </View>

            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} placeholder="Enter title..." placeholderTextColor="#64748b" value={title} onChangeText={setTitle} />
            
            <Text style={styles.label}>Location / Coordinates</Text>
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 8 }]} placeholder="Tap GPS button or type..." placeholderTextColor="#64748b" value={locationName} onChangeText={setLocationName} />
              <TouchableOpacity style={styles.gpsBtn} onPress={fetchGPSLocation}>
                <Text style={styles.btnText}>📍 Get GPS</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Illustration / Photo Capture</Text>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.subBtn, { backgroundColor: '#0284c7', marginRight: 5 }]} onPress={takePhoto}>
                <Text style={styles.btnText}>📸 Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.subBtn, { backgroundColor: '#475569', marginLeft: 5 }]} onPress={pickImage}>
                <Text style={styles.btnText}>🖼️ Gallery</Text>
              </TouchableOpacity>
            </View>
            {image && <Image source={{ uri: image }} style={styles.preview} />}

            <Text style={styles.label}>Reflections</Text>
            <TextInput style={[styles.input, styles.area]} placeholder="Write notes..." placeholderTextColor="#64748b" multiline value={description} onChangeText={setDescription} />

            <TouchableOpacity style={styles.mainBtn} onPress={saveTrip}>
              <Text style={styles.mainBtnText}>Save Inscription</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* 3. Friends 好友页 */}
        {currentTab === 'Friends' && (
          <View style={styles.page}>
            <Text style={styles.headerTitle}>Travel Mates & Friends</Text>
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Friend name..." placeholderTextColor="#64748b" value={friendName} onChangeText={setFriendName} />
              <TouchableOpacity style={[styles.subBtn, { backgroundColor: '#0284c7', marginLeft: 8, height: 45, justifyContent: 'center' }]} onPress={() => { if(friendName) { setFriends([...friends, {id:Date.now().toString(), name:friendName, status:'Traveling'}]); setFriendName(''); }}}><Text style={styles.btnText}>Add</Text></TouchableOpacity>
            </View>
            <FlatList
              data={friends}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardMeta}>Status: {item.status}</Text>
                </View>
              )}
            />
          </View>
        )}

        {/* 4. Community 社区页面 */}
        {currentTab === 'Community' && (
          <View style={styles.page}>
            <Text style={styles.headerTitle}>Ink Community Forum</Text>
            <View style={styles.postBox}>
              <TextInput style={styles.areaSmall} placeholder="Share your thoughts with fellow travelers..." placeholderTextColor="#64748b" multiline value={newContent} onChangeText={setNewContent} />
              <TouchableOpacity style={styles.mainBtn} onPress={() => { if(newContent) { setPosts([{id:Date.now().toString(), author:'Me (Traveler)', content:newContent}, ...posts]); setNewContent(''); }}}><Text style={styles.mainBtnText}>Publish to Community</Text></TouchableOpacity>
            </View>
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.cardBody}>
                  <Text style={{color: '#0284c7', fontWeight: 'bold'}}>@{item.author}</Text>
                  <Text style={{color: '#334155', marginTop: 4}}>{item.content}</Text>
                </View>
              )}
            />
          </View>
        )}
      </View>

      {/* 底部固定导航栏 */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('Home')}>
          <Text style={[styles.tabText, currentTab === 'Home' && styles.activeTab]}>📜 Annals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('Add')}>
          <Text style={[styles.tabText, currentTab === 'Add' && styles.activeTab]}>✍️ Inscribe</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('Friends')}>
          <Text style={[styles.tabText, currentTab === 'Friends' && styles.activeTab]}>👥 Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('Community')}>
          <Text style={[styles.tabText, currentTab === 'Community' && styles.activeTab]}>💬 Community</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: '#000' },
  bgImage: { position: 'absolute', width: '100%', height: '100%', resizeMode: 'cover' },
  contentContainer: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.45)' },
  page: { flex: 1, padding: 20 },
  pageScroll: { padding: 20, flexGrow: 1 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, color: '#0f172a', fontFamily: 'serif' },
  
  // 🌟 优雅低调的设备工具栏样式
  toolkitBar: { backgroundColor: 'rgba(255, 255, 255, 0.85)', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-around' },
  toolkitText: { fontSize: 11, fontWeight: '600', color: '#475569' },

  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#1e293b', fontWeight: 'bold' },
  emptySub: { fontSize: 14, color: '#475569', marginTop: 5 },
  card: { backgroundColor: 'rgba(255, 255, 255, 0.92)', borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#cbd5e1', overflow: 'hidden' },
  cardBody: { backgroundColor: 'rgba(255, 255, 255, 0.92)', padding: 15, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#cbd5e1' },
  editCardBox: { backgroundColor: 'rgba(255, 255, 255, 0.98)', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 2, borderColor: '#0284c7' },
  cardImg: { width: '100%', height: 140, resizeMode: 'cover' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  cardMeta: { fontSize: 12, color: '#64748b', marginTop: 4 },
  cardDesc: { fontSize: 14, color: '#334155', marginTop: 6 },
  delBtn: { marginTop: 10, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#991b1b' },
  delText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  label: { fontSize: 15, fontWeight: 'bold', color: '#1e293b', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, fontSize: 15, color: '#0f172a', marginBottom: 10 },
  area: { height: 90, textAlignVertical: 'top' },
  areaSmall: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, height: 60, fontSize: 14, marginBottom: 8, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  subBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 5 },
  gpsBtn: { backgroundColor: '#0f172a', paddingVertical: 11, paddingHorizontal: 15, borderRadius: 8, justifyContent: 'center', height: 45 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  preview: { width: '100%', height: 150, borderRadius: 8, resizeMode: 'cover', marginBottom: 10 },
  mainBtn: { backgroundColor: '#0f172a', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 15, marginBottom: 30 },
  mainBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  postBox: { backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: 12, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#cbd5e1' },
  tabBar: { height: 60, backgroundColor: '#0f172a', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#334155' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  activeTab: { color: '#38bdf8', fontWeight: 'bold' },
});