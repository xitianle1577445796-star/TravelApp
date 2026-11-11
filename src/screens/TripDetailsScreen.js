import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TripDetailsScreen({ route, navigation }) {
  // 获取从首页传过来的具体某一条行程数据
  const { trip } = route.params;

  // 用 useState 接收并初始化，允许用户在输入框中直接修改（Update）
  const [tripName, setTripName] = useState(trip.tripName || '');
  const [notes, setNotes] = useState(trip.notes || '');
  const [locationName, setLocationName] = useState(trip.locationName || '');

  // 核心：Update（更新）逻辑
  const handleUpdate = async () => {
    if (!tripName.trim()) {
      Alert.alert('错误', '行程标题不能为空！');
      return;
    }

    try {
      // 1. 读取本地所有存储的数据
      const existingData = await AsyncStorage.getItem("trips");
      let tripsList = existingData ? JSON.parse(existingData) : [];

      // 2. 根据当前 id 找到它在数组中的位置
      const index = tripsList.findIndex((t) => t.id === trip.id);

      if (index !== -1) {
        // 3. 替换/更新对应字段
        tripsList[index] = {
          ...tripsList[index],
          tripName: tripName,
          notes: notes,
          locationName: locationName,
        };

        // 4. 将更新后的完整数组写回 AsyncStorage（实现持久化）
        await AsyncStorage.setItem("trips", JSON.stringify(tripsList));
        
        Alert.alert('成功', '行程已成功更新！', [
          { text: '确定', onPress: () => navigation.goBack() } // 点击确定后返回首页
        ]);
      } else {
        Alert.alert('错误', '未找到该条记录');
      }
    } catch (error) {
      console.log("Update error:", error);
      Alert.alert('错误', '更新失败，请重试');
    }
  };

  // 删除逻辑
  const handleDelete = async () => {
    Alert.alert('确认删除', '你确定要删除这条行记吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定删除',
        style: 'destructive',
        onPress: async () => {
          try {
            const existingData = await AsyncStorage.getItem("trips");
            let tripsList = existingData ? JSON.parse(existingData) : [];
            const filtered = tripsList.filter((t) => t.id !== trip.id);
            await AsyncStorage.setItem("trips", JSON.stringify(filtered));
            navigation.goBack();
          } catch (error) {
            console.log("Delete error", error);
          }
        }
      }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>编辑与更新行记 (Update)</Text>

      <Text style={styles.label}>行程标题 (Title)</Text>
      <TextInput 
        style={styles.input} 
        value={tripName} 
        onChangeText={setTripName} 
        placeholder="修改标题..."
      />

      <Text style={styles.label}>位置信息 (Location)</Text>
      <TextInput 
        style={styles.input} 
        value={locationName} 
        onChangeText={setLocationName} 
        placeholder="修改位置..."
      />

      <Text style={styles.label}>感想与题跋 (Reflections)</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        value={notes} 
        onChangeText={setNotes} 
        placeholder="修改感想..."
        multiline 
      />

      {/* 保存修改按钮 (Update) */}
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
        <Text style={styles.btnText}>保存修改 (Save Update)</Text>
      </TouchableOpacity>

      {/* 删除按钮 (Delete) */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.btnText}>删除记录 (Delete)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f6f5f0', flexGrow: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#1c1917' },
  label: { fontSize: 14, fontWeight: '600', color: '#57534e', marginTop: 12, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#d1d5db', padding: 12, borderRadius: 8, backgroundColor: '#fff', fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  updateButton: { backgroundColor: '#1c1917', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 25 },
  deleteButton: { backgroundColor: '#dc2626', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});