import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../config/constants';

export default function PlaceholderScreen({ route }: { route: any }) {
  const title = route?.name ?? 'Próximamente';
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.text}>{title}</Text>
        <Text style={styles.sub}>Esta pantalla está en desarrollo</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.primary },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  sub:  { fontSize: 14, color: '#888', marginTop: 8 },
});