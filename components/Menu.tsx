import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';

import recitersData from '../assets/reciters.json';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';

const { width } = Dimensions.get('window');

interface MenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function Menu({ visible, onClose }: MenuProps) {
  const { state } = useAudioPlayer();
  const [selectedFontSize, setSelectedFontSize] = useState('متوسط');

  useEffect(() => {
    loadFontSize();
  }, [visible]);

  const loadFontSize = async () => {
    try {
      const savedSize = await AsyncStorage.getItem('quranFontSize');
      const sizeLabels: { [key: string]: string } = {
        small: 'صغير',
        medium: 'متوسط',
        large: 'كبير',
        xlarge: 'كبير جداً',
      };
      if (savedSize && sizeLabels[savedSize]) {
        setSelectedFontSize(sizeLabels[savedSize]);
      }
    } catch (error) {}
  };

  // الحصول على اسم القارئ المختار
  const getCurrentReciterName = () => {
    const reciter = recitersData.reciters.find(r => r.id === state.currentReciterId);
    return reciter ? reciter.name : 'عبد الباسط عبد الصمد';
  };

  const menuItems = [
    {
      id: 'bookmarks',
      title: 'العلامات المرجعية',
      icon: 'bookmark',
      iconColor: '#fff',
      onPress: () => {
        onClose();
        router.push('/bookmarks');
      },
    },
    {
      id: 'prayer-times',
      title: 'مواقيت الصلاة',
      icon: 'time',
      iconColor: '#fff',
      onPress: () => {
        onClose();
        router.push('/prayer-times');
      },
    },
    {
      id: 'qibla',
      title: 'اتجاه القبلة',
      icon: 'compass',
      iconColor: '#fff',
      onPress: () => {
        onClose();
        router.push('/qibla');
      },
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity
          style={styles.menuContainer}
          activeOpacity={1}
          onPress={e => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>القائمة</Text>
            <View style={styles.headerLine} />
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.menuContent}>
            {menuItems.map(item => (
              <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
                <Text style={styles.menuItemText}>{item.title}</Text>
                <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
              </TouchableOpacity>
            ))}

            {/* Reciter Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>القارئ</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => {
                  onClose();
                  router.push('/reciters');
                }}
              >
                <Text style={styles.dropdownText}>{getCurrentReciterName()}</Text>
                <Ionicons name="chevron-down" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Font Size Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>حجم الخط</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => {
                  onClose();
                  router.push('/font-size');
                }}
              >
                <Text style={styles.dropdownText}>{selectedFontSize}</Text>
                <Ionicons name="chevron-down" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  menuContainer: {
    width: width * 0.7,
    height: '100%',
    backgroundColor: '#065F46',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerLine: {
    height: 2,
    backgroundColor: '#D4AF37',
    width: '100%',
  },
  menuContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'right',
  },
  section: {
    marginTop: 30,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    fontWeight: '500',
    textAlign: 'right',
  },
  dropdown: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dropdownText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    textAlign: 'right',
  },
});
