import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
  bg: '#FFF6F8',  
  card: '#FFFFFF',  
  primary: '#FF80AB', 
  accent: '#FFD6E0', 
  text: '#4A4A4A', 
  textMuted: '#9E9E9E',
  border: '#FFE3EC',
};

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Kanhom Shop</Text>
      <Text style={styles.title}>Sweet & Fresh</Text>
      <Text style={styles.subtitle}>ของหวานสดใหม่ทุกวัน</Text>

      <TouchableOpacity style={styles.cta} onPress={() => router.push('/product')}>
        <Text style={styles.ctaText}>เข้าสู่หน้าสินค้า 🍰</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 28, 
    backgroundColor: COLORS.bg 
  },
  brand: { 
    color: COLORS.primary, 
    fontSize: 18, 
    letterSpacing: 1.5, 
    marginBottom: 8, 
    fontWeight: '800' 
  },
  title: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: COLORS.text, 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 16, 
    color: COLORS.textMuted, 
    marginTop: 10, 
    marginBottom: 28, 
    textAlign: 'center', 
    lineHeight: 22 
  },
  cta: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ctaText: { 
    color: '#FFFFFF', 
    fontWeight: '800', 
    letterSpacing: 0.5 
  },
});
