import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import { Magnetometer } from 'expo-sensors';

export default function SettingsScreen() {
  const { themeMode, toggleTheme, colors } = useContext(ThemeContext);

  const [batteryLevel, setBatteryLevel] = useState('Loading...');
  const [deviceName, setDeviceName] = useState('Loading...');
  const [compassHeading, setCompassHeading] = useState('Detecting...');

  useEffect(() => {
    async function loadHardwareInfo() {
      try {
        // API 1: 电池电量
        const bat = await Battery.getBatteryLevelAsync();
        setBatteryLevel(`${Math.round(bat * 100)}%`);

        // API 2: 设备硬件信息
        setDeviceName(Device.modelName || 'Mobile Device');
      } catch (error) {
        setBatteryLevel('N/A');
        setDeviceName('N/A');
      }
    }
    loadHardwareInfo();

    // API 3: 指南针 / 磁力计 (Magnetometer)
    Magnetometer.setUpdateInterval(1000);
    const subscription = Magnetometer.addListener(data => {
      let { x, y } = data;
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      setCompassHeading(`${Math.round(angle)}°`);
    });

    return () => subscription && subscription.remove();
  }, []);

  const resetData = async () => {
    await AsyncStorage.removeItem('far_ink_masterpiece_v8');
    Alert.alert('Reset', 'Chronicles reset to default.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>⚙️ Settings</Text>
      </View>

      <View style={styles.content}>
        {/* 主题切换 */}
        <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Zen Theme Mode</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>{themeMode === 'dark' ? 'Charcoal Ink' : 'Rice Paper'}</Text>
          </View>
          <Switch value={themeMode === 'dark'} onValueChange={toggleTheme} trackColor={{ true: colors.accent }} />
        </View>

        {/* 硬件 API 1: 电池状态 */}
        <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>🔋 Battery Status API</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>Level: {batteryLevel}</Text>
          </View>
        </View>

        {/* 硬件 API 2: 设备硬件信息 */}
        <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>📱 Device Hardware API</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>{deviceName}</Text>
          </View>
        </View>

        {/* 硬件 API 3: 指南针罗盘 */}
        <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>🧭 Compass (Magnetometer) API</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>Heading: {compassHeading}</Text>
          </View>
        </View>

        {/* 重置数据按钮 */}
        <TouchableOpacity style={[styles.resetButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={resetData}>
          <Text style={{ color: colors.cinnabar, fontWeight: 'bold' }}>Reset Chronicles Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', fontFamily: 'serif' },
  content: { padding: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  sub: { fontSize: 12 },
  resetButton: { padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center' }
});