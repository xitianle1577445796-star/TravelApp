import React, { useContext } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

export default function NotificationsScreen() {
  const { colors } = useContext(ThemeContext);
  const items = [
    { id: '1', title: 'Morning Mist Advisory', desc: 'High humidity anticipated around mountain peaks. Ideal for ink-wash photography.', date: '2h ago' },
    { id: '2', title: 'Expedition Milestone', desc: 'You have successfully logged your travel archives in FAR.', date: '1d ago' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>📜 Notices & Weather</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.row}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.date, { color: colors.textSecondary }]}>{item.date}</Text>
            </View>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>{item.desc}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', fontFamily: 'serif' },
  list: { padding: 16 },
  card: { borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', fontFamily: 'serif' },
  date: { fontSize: 11 },
  desc: { fontSize: 14, lineHeight: 20 }
});
