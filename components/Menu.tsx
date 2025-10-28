import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface MenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function Menu({ visible, onClose }: MenuProps) {
  const [selectedReciter, setSelectedReciter] = useState('ماهر المعيقلي');
  const [selectedFontSize, setSelectedFontSize] = useState('متوسط');

  const menuItems = [
    {
      id: 'bookmarks',
      title: 'العلامات المرجعية',
      icon: 'bookmark',
      iconColor: '#000',
      onPress: () => {
        onClose();
        // Navigate to bookmarks
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

  const reciters = [
    'ماهر المعيقلي',
    'عبد الباسط عبد الصمد',
    'محمد صديق المنشاوي',
    'سعد الغامدي',
    'عبد الرحمن السديس',
  ];

  const fontSizes = [
    'صغير',
    'متوسط',
    'كبير',
    'كبير جداً',
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.menuContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>القائمة</Text>
            <View style={styles.headerLine} />
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.menuContent}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <Text style={styles.menuItemText}>{item.title}</Text>
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={item.iconColor}
                />
              </TouchableOpacity>
            ))}

            {/* Reciter Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>صوت القارئ</Text>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownText}>{selectedReciter}</Text>
                <Ionicons name="chevron-down" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Font Size Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>حجم الخط</Text>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownText}>{selectedFontSize}</Text>
                <Ionicons name="chevron-down" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
    flexDirection: 'row',
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
  },
  dropdown: {
    flexDirection: 'row',
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
  },
});
