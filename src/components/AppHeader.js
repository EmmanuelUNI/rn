// src/components/AppHeader.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../config/api';

export default function AppHeader({ title, showBackButton = true, rightIcon, onRightPress }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.leftSlot}>
          {showBackButton ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          ) : rightIcon ? (
            <TouchableOpacity onPress={onRightPress} style={styles.iconBtn}>
              <Text style={styles.iconText}>{rightIcon}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/logo_sin_fondo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 8,
    backgroundColor: COLORS.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSlot: {
    width: 40,
  },
  iconBtn: {
    padding: 4,
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  logoWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  logo: {
    height: 50,
    width: 100,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
});