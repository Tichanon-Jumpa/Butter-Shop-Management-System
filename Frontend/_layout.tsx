import { Feather } from '@expo/vector-icons';
import { Slot, useRouter, useSegments } from 'expo-router';
import React from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
  bg: '#FFFDF6',  
  card: '#FFFFFF',
  primary: '#F2C94C',
  primaryDark: '#E0B33F',
  accent: '#FFE8A3',
  text: '#5B4A2F',
  textMuted: '#9A8667',
  border: '#F3E7C9',
  shadow: '#F8E9BC',
};

const Header = () => {
  const segments = useSegments();
  let title = 'Butter Boutique';
  if (segments.length > 0 && segments[0]) {
    switch (segments[0]) {
      case 'product':    title = 'รายการสินค้าเนย'; break;
      case 'addproduct': title = 'เพิ่มสินค้าเนย'; break;
      case 'edit':       title = 'แก้ไขสินค้าเนย'; break;
      case 'category':   title = 'หมวดหมู่เนย'; break;
      default:           title = 'Butter Boutique';
    }
  }

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.logoEmoji}>🧈</Text>
        <Text style={styles.logoText}>Butter Boutique</Text>
      </View>
      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      <View style={{ width: 22 }} />
    </View>
  );
};

const Footer = () => {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = segments[0] || 'index';

  const items = [
    { label: 'หน้าแรก',     iconName: 'home',  path: '/' },
    { label: 'เพิ่มสินค้า', iconName: 'plus',  path: '/addproduct' },
    { label: 'สินค้า',      iconName: 'tag',   path: '/product' },
    { label: 'หมวดหมู่',    iconName: 'grid',  path: '/category' },
  ];

  return (
    <View style={styles.footer}>
      {items.map((item, i) => {
        const active = (currentRoute === item.path.replace('/', '')) || (item.path === '/' && currentRoute === 'index');
        return (
          <TouchableOpacity key={i} style={styles.footerItem} onPress={() => router.push(item.path)}>
            <Feather
              name={item.iconName as any}
              size={22}
              color={active ? COLORS.primaryDark : COLORS.textMuted}
            />
            <Text style={[styles.footerLabel, active && styles.footerLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function Layout() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.card} />
      <Header />
      <View style={styles.slotContainer}><Slot /></View>
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: Platform.OS === 'web' ? 0 : StatusBar.currentHeight,
  },

  header: {
    height: 78,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoEmoji: { fontSize: 18 },
  logoText: { marginLeft: 8, fontSize: 18, fontWeight: '900', color: COLORS.primaryDark, letterSpacing: 0.4 },
  headerTitle: {
    position: 'absolute',
    left: 0, right: 0,
    textAlign: 'center',
    fontSize: 16, color: COLORS.text, fontWeight: '800',
  },

  slotContainer: { flex: 1 },

  footer: {
    height: 74,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  footerItem: { alignItems: 'center' },
  footerLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  footerLabelActive: { color: COLORS.primaryDark, fontWeight: '900' },
});
