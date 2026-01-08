import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';

const API_BASE_URL = 'http://nindam.sytes.net:30032/api/products';

// โทนร้านขายเนย 🧈
const COLORS = {
  bg: '#FFFDF6', 
  card: '#FFFFFF', 
  primary: '#F2C94C', 
  primaryDark: '#E0B33F',
  accent: '#FFE8A3', 
  accent2: '#FFF2C6', 
  text: '#5B4A2F', 
  textMuted: '#9A8667',
  border: '#F3E7C9',
  input: '#FFF9E8', 
  shadow: '#F8E9BC', 
};

type InventoryForm = {
  name: string;
  price: string;  
  quantity: string;  
};

export default function AddProductPage() {
  const [form, setForm] = useState<InventoryForm>({ name: '', price: '', quantity: '' });
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const onChange = <K extends keyof InventoryForm>(k: K, v: InventoryForm[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: Platform.OS === 'web' ? true : false,
    });
    if (!res.canceled) {
      if (Platform.OS === 'web') {
        setImage({
          uri: `data:image/jpeg;base64,${res.assets[0].base64}`,
          name: res.assets[0].fileName || 'photo.jpg',
          type: 'image/jpeg',
        });
      } else {
        setImage(res.assets[0]);
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return Alert.alert('กรอกไม่ครบ', 'กรุณาระบุชื่อสินค้า (เช่น เนยจืด/เนยเค็ม)');
    if (form.price && !/^-?\d+(\.\d+)?$/.test(form.price.trim())) {
      return Alert.alert('รูปแบบราคาไม่ถูกต้อง', 'กรุณากรอกเป็นตัวเลข เช่น 129 หรือ 129.50');
    }
    if (form.quantity && !/^-?\d+$/.test(form.quantity.trim())) {
      return Alert.alert('รูปแบบจำนวนไม่ถูกต้อง', 'กรุณากรอกจำนวนเป็นจำนวนเต็ม เช่น 10');
    }

    setLoading(true);
    try {
      const fd = new FormData();

      fd.append('Name', form.name.trim());
      fd.append('Price', form.price ?? '');
      fd.append('Quantity', form.quantity ?? '');

      fd.append('Tic_Jum_Name', form.name.trim());
      fd.append('Tic_jum_Price_Unit', form.price ?? '');
      fd.append('Tic_Jum_Qty_Stock', form.quantity ?? '');

      if (image?.uri) {
        if (image.uri.startsWith('data:')) {
          const blob = await (await fetch(image.uri)).blob();
          fd.append('Image', blob as any, image.name || 'photo.jpg');
        } else {
          const ext = (image.uri.split('.').pop() || 'jpg').toLowerCase();
          fd.append('Image', { uri: image.uri, name: `photo.${ext}`, type: image.type || 'image/jpeg' } as any);
        }
      }

      const res = await fetch(API_BASE_URL, { method: 'POST', body: fd });
      const txt = await res.text();
      let data: any; try { data = JSON.parse(txt); } catch { throw new Error('Invalid server response'); }

      if (!res.ok) {
        Alert.alert('บันทึกไม่สำเร็จ', data?.error || 'ไม่สามารถเพิ่มสินค้าได้');
      } else {
        Alert.alert('สำเร็จ', 'เพิ่มสินค้าเนยเรียบร้อย 🧈');
        setForm({ name: '', price: '', quantity: '' });
        setImage(null);
      }
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🧈 Butter Boutique</Text>
        <Text style={styles.subtitle}>เพิ่มสินค้าเนยใหม่เข้าร้าน</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.section}>รายละเอียดสินค้า</Text>

        <L label="ชื่อสินค้า">
          <I
            value={form.name}
            onChangeText={(t: string) => onChange('name', t)}
            placeholder="เช่น เนยจืด 200g, เนยเค็ม 500g, Ghee 250ml"
          />
        </L>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <L label="ราคา (บาท)">
              <I
                value={form.price}
                keyboardType="decimal-pad"
                onChangeText={(t: string) => onChange('price', t)}
                placeholder="เช่น 129.00"
              />
            </L>
          </View>
          <View style={{ width: 120 }}>
            <L label="จำนวน (ชิ้น)">
              <I
                value={form.quantity}
                keyboardType="number-pad"
                onChangeText={(t: string) => onChange('quantity', t)}
                placeholder="เช่น 10"
              />
            </L>
          </View>
        </View>

        <Text style={styles.label}>รูปสินค้า (แนะนำภาพแพ็กเกจเนย)</Text>
        {image?.uri ? (
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>ยังไม่ได้เลือกรูป</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.btnSecondary, loading && { opacity: 0.6 }]}
          onPress={pickImage}
          disabled={loading}
        >
          <Text style={styles.btnSecondaryText}>เลือกรูปภาพ</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 18 }}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
              <Text style={styles.btnPrimaryText}>บันทึกสินค้าเนย</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tips */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>เคล็ดลับการตั้งชื่อสินค้า</Text>
        <Text style={styles.tipText}>• ใส่ชนิดเนย (จืด/เค็ม/กี (Ghee))</Text>
        <Text style={styles.tipText}>• ระบุปริมาณ (เช่น 200g / 500g / 250ml)</Text>
        <Text style={styles.tipText}>• ระบุยี่ห้อ (ถ้ามี) เพื่อค้นหาง่าย</Text>
      </View>
    </ScrollView>
  );
}

const L: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.label}>{label}</Text>
    {children}
  </View>
);

const I: React.FC<any> = (props) =>
  <TextInput {...props} placeholderTextColor={COLORS.textMuted} style={[styles.input, props.style]} />;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.bg },

  header: { alignItems: 'center', marginBottom: 14 },
  logo: { fontSize: 26, fontWeight: '900', color: COLORS.primaryDark },
  subtitle: { marginTop: 4, color: COLORS.textMuted },

  section: { marginTop: 6, marginBottom: 12, color: COLORS.primaryDark, fontWeight: '800' },
  label: { fontWeight: '700', fontSize: 13, marginBottom: 6, color: COLORS.textMuted },

  card: {
    backgroundColor: COLORS.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 3,
  },

  row: { flexDirection: 'row' },

  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 12,
    backgroundColor: COLORS.input, color: COLORS.text, fontSize: 15,
  },

  imagePreview: {
    width: '100%', height: 210, borderRadius: 14, marginVertical: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  imagePlaceholder: {
    width: '100%', height: 210, borderRadius: 14, marginVertical: 10, borderWidth: 1,
    borderColor: COLORS.border, backgroundColor: COLORS.accent2, alignItems: 'center', justifyContent: 'center',
  },
  imagePlaceholderText: { color: COLORS.textMuted },

  btnPrimary: {
    backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 16,
    shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    borderWidth: 1, borderColor: COLORS.accent,
  },
  btnPrimaryText: { color: '#3D2E10', fontWeight: '900', textAlign: 'center' },

  btnSecondary: {
    backgroundColor: COLORS.accent, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, marginTop: 4,
  },
  btnSecondaryText: { color: COLORS.text, fontWeight: '800', textAlign: 'center' },

  tipCard: {
    marginTop: 14, backgroundColor: COLORS.accent2, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  tipTitle: { fontWeight: '900', color: COLORS.text },
  tipText: { color: COLORS.textMuted, marginTop: 4 },
});
