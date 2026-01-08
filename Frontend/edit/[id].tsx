import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, Platform,
  ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_BASE_URL = 'http://nindam.sytes.net:30032/api';

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
  input: '#FFF6DA', 
  shadow: '#F8E9BC',
};

type InventoryProduct = {
  id: number;
  name: string;
  price: number | null;
  quantity: number | null;
  imageUrl: string | null;
};

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const pid = Array.isArray(id) ? id[0] : id;
  const productId = Number(pid);

  const [product, setProduct] = useState<InventoryProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!Number.isFinite(productId)) throw new Error('Invalid product id');
        const res = await fetch(`${API_BASE_URL}/products/${productId}`);
        const data = await res.json();

        const p: InventoryProduct = {
          id: Number(data.id ?? data.Id ?? 0),
          name: String(data.name ?? data.Name ?? ''),
          price: data.price === null || data.price === undefined || data.price === '' ? null : Number(data.price),
          quantity:
            data.quantity === null || data.quantity === undefined || data.quantity === ''
              ? null
              : Number(data.quantity),
          imageUrl: data.imageUrl ?? data.Image ?? null,
        };

        setProduct(p);
        if (p.imageUrl) setImage({ uri: p.imageUrl });
      } catch (e) {
        Alert.alert('Error', 'ไม่สามารถโหลดข้อมูลสินค้าได้');
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: Platform.OS === 'web' ? true : false,
    });

    if (!result.canceled) {
      if (Platform.OS === 'web') {
        setImage({
          uri: `data:image/jpeg;base64,${result.assets[0].base64}`,
          name: result.assets[0].fileName || 'photo.jpg',
          type: 'image/jpeg',
        });
      } else {
        setImage(result.assets[0]);
      }
    }
  };

  const handleSave = async () => {
    if (!product) return;
    if (!product.name.trim()) {
      return Alert.alert('กรอกไม่ครบ', 'กรุณาระบุชื่อสินค้า');
    }

    setSaving(true);
    try {
      const fd = new FormData();
      
      fd.append('Name', product.name.trim());
      fd.append('Price', product.price === null || product.price === undefined ? '' : String(product.price));
      fd.append('Quantity', product.quantity === null || product.quantity === undefined ? '' : String(product.quantity));

      if (image?.uri && image.uri !== product.imageUrl) {
        if (image.uri.startsWith('data:')) {
          const blob = await (await fetch(image.uri)).blob();
          fd.append('Image', blob as any, image.name || 'photo.jpg');
        } else {
          const ext = (image.uri.split('.').pop() || 'jpg').toLowerCase();
          fd.append('Image', {
            uri: image.uri,
            name: `photo.${ext}`,
            type: image.type || 'image/jpeg',
          } as any);
        }
      }

      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        body: fd,
      });

      const text = await res.text();
      let data: any; try { data = JSON.parse(text); } catch { throw new Error('Invalid server response'); }
      if (!res.ok) throw new Error(data?.error || 'Update failed');

      Alert.alert('สำเร็จ', 'อัปเดตสินค้าเนยเรียบร้อย 🧈');
      router.back();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 8, color: COLORS.textMuted }}>กำลังตักเนย... โหลดข้อมูลอยู่จ้า</Text>
      </View>
    );
  }
  if (!product) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🧈 Butter Boutique</Text>
        <Text style={styles.subtitle}>แก้ไขรายละเอียดสินค้า</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.section}>ข้อมูลสินค้า</Text>

        <Text style={styles.label}>ชื่อสินค้า</Text>
        <TextInput
          style={styles.input}
          value={product.name}
          onChangeText={(text) => setProduct({ ...product!, name: text })}
          placeholder="เช่น เนยจืด 200g"
          placeholderTextColor={COLORS.textMuted}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>ราคา (บาท)</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={product.price === null || product.price === undefined ? '' : String(product.price)}
              onChangeText={(text) =>
                setProduct({ ...product!, price: text.trim() === '' ? null : Number(text) })
              }
              placeholder="เช่น 120.00"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
          <View style={{ width: 120 }}>
            <Text style={styles.label}>จำนวน (ชิ้น)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={product.quantity === null || product.quantity === undefined ? '' : String(product.quantity)}
              onChangeText={(text) =>
                setProduct({ ...product!, quantity: text.trim() === '' ? null : Number(text) })
              }
              placeholder="เช่น 10"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        <Text style={styles.label}>รูปสินค้า</Text>
        {image?.uri ? (
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>ยังไม่ได้เลือกรูป</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.btnSecondary, saving && { opacity: 0.6 }]}
          onPress={pickImage}
          disabled={saving}
        >
          <Text style={styles.btnSecondaryText}>เลือกรูปใหม่</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 18 }}>
          <TouchableOpacity style={[styles.btnPrimary, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#3D2E10" />
              : <Text style={styles.btnPrimaryText}>บันทึกการเปลี่ยนแปลง</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.bg },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },

  header: { alignItems: 'center', marginBottom: 14 },
  logo: { fontSize: 24, fontWeight: '900', color: COLORS.primaryDark },
  subtitle: { marginTop: 4, color: COLORS.textMuted },

  section: { marginTop: 6, marginBottom: 12, color: COLORS.primaryDark, fontWeight: '800' },
  label: { fontWeight: '800', fontSize: 13, marginBottom: 6, color: COLORS.textMuted },

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
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#3D2E10', fontWeight: '900' },

  btnSecondary: {
    backgroundColor: COLORS.accent, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, marginTop: 4, alignItems: 'center',
  },
  btnSecondaryText: { color: COLORS.text, fontWeight: '800' },
});
