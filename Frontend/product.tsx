import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_BASE_URL = 'http://nindam.sytes.net:30032/api';

const ABSOLUTE = (u: string) =>
  !u ? '' : (/^https?:\/\//i.test(u) ? u : `${API_BASE_URL.replace(/\/api$/, '')}${u.startsWith('/') ? '' : '/'}${u}`);

const COLORS = {
  bg: '#FFFDF6',  
  card: '#FFFFFF',  
  primary: '#F2C94C', 
  primaryDark: '#E0B33F',
  accent: '#FFE8A3', 
  chip: '#FFF3CC',  
  chipAlt: '#FFE7A0',  
  text: '#5B4A2F', 
  textMuted: '#9A8667', 
  border: '#F3E7C9',  
  inputBg: '#FFF6DA', 
  shadow: '#F8E9BC',  
};

interface ProductType {
  id: number;
  name: string;
  price: number | null;
  quantity: number | null;
  imageUrl: string;
}

const Chip: React.FC<{ text: string; tone?: 'cream' | 'yellow' }> = ({ text, tone = 'cream' }) => (
  <View style={[
    styles.chip,
    tone === 'yellow' && { backgroundColor: COLORS.chipAlt, borderColor: '#F6D774' },
  ]}>
    <Text style={[
      styles.chipText,
      tone === 'yellow' && { color: '#5B3B00' },
    ]}>{text}</Text>
  </View>
);

export default function ProductListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const fade = useRef(new Animated.Value(0)).current;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/products`);
      const data = await res.json();

      if (!Array.isArray(data)) return setProducts([]);

      setProducts(
        data.map((p: any): ProductType => ({
          id: Number(p.id ?? p.Id ?? 0),
          name: String(p.name ?? p.Name ?? ''),
          price: p.price === null || p.price === undefined || p.price === '' ? null : Number(p.price),
          quantity: p.quantity === null || p.quantity === undefined || p.quantity === '' ? null : Number(p.quantity),
          imageUrl: ABSOLUTE(String(p.imageUrl ?? p.Image ?? '')),
        }))
      );
    } catch (err) {
      console.error('fetchProducts error:', err);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
      if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) { console.error('delete error:', e); }
  };

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.price ?? '', p.quantity ?? ''].join(' ').toLowerCase().includes(q)
    );
  }, [products, query]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 8, color: COLORS.textMuted }}>กำลังละลายเนย... ดึงรายการอยู่จ้า</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl tintColor={COLORS.textMuted} refreshing={refreshing} onRefresh={onRefresh} />}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🧈 Butter Boutique</Text>
        <Text style={styles.subtitle}>รายการสินค้าเนยทั้งหมด</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="ค้นชื่อ/ราคา/จำนวน..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
          />
          {!!query && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Text style={styles.clearText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.resultCount}>
        พบ {filteredProducts.length} รายการ{query ? ` สำหรับ "${query}"` : ''}
      </Text>

      <Animated.View style={{ opacity: fade }}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Image
              source={{ uri: 'https://dummyimage.com/640x300/fff6d8/d8c8a6&text=No+Butter+Found' }}
              style={styles.emptyImage}
            />
            <Text style={styles.emptyText}>ยังไม่พบสินค้าเนยที่ค้นหา</Text>
            <TouchableOpacity onPress={() => setQuery('')} style={styles.btnGhost}>
              <Text style={styles.btnGhostText}>ล้างคำค้น</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={styles.cardWrapper}>
                <TouchableOpacity style={styles.card} onPress={() => router.push(`/edit/${product.id}`)}>
                  <Image
                    source={{ uri: product.imageUrl || 'https://dummyimage.com/600x400/fff2cc/bb9b5f&text=Butter' }}
                    style={styles.productImage}
                  />
                  <View style={styles.meta}>
                    <Text style={styles.productName} numberOfLines={1}>{product.name || '-'}</Text>

                    <View style={styles.badgeRow}>
                      {product.price !== null && <Chip text={`฿ ${product.price}`} tone="cream" />}
                      {product.quantity !== null && <Chip text={`Qty ${product.quantity}`} tone="yellow" />}
                    </View>

                    <View style={styles.actionRow}>
                      <View />
                      <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={styles.editButton} onPress={() => router.push(`/edit/${product.id}`)}>
                          <Text style={styles.actionText}>แก้ไข</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.delButton} onPress={() => handleDelete(product.id)}>
                          <Text style={styles.actionText}>ลบ</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },

  header: { alignItems: 'center', marginBottom: 10 },
  logo: { fontSize: 24, fontWeight: '900', color: COLORS.primaryDark },
  subtitle: { marginTop: 4, color: COLORS.textMuted },

  searchRow: { marginBottom: 12 },
  searchBox: {
    position: 'relative',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { color: COLORS.text, fontSize: 14, paddingRight: 28 },
  clearBtn: { position: 'absolute', right: 6, top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: 6 },
  clearText: { color: COLORS.textMuted, fontSize: 18, lineHeight: 18 },

  resultCount: { color: COLORS.textMuted, marginBottom: 8 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardWrapper: { width: '48%', marginBottom: 16 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  productImage: { width: '100%', height: 150, backgroundColor: '#FFF2CC' },
  meta: { padding: 12 },
  productName: { fontSize: 15, fontWeight: '900', color: COLORS.text },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: COLORS.chip,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: { fontSize: 11, color: COLORS.primaryDark, fontWeight: '800' },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  editButton: {
    marginRight: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F6D774',
  },
  delButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F6D774',
  },
  actionText: { fontWeight: '900', color: '#3D2E10' },

  emptyWrap: { alignItems: 'center', paddingVertical: 24 },
  emptyImage: { width: '100%', height: 150, borderRadius: 12, marginBottom: 12 },
  emptyText: { color: COLORS.textMuted, marginBottom: 10 },

  cardBase: { backgroundColor: COLORS.card, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border },
  btnGhost: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#FFF9E8',
  },
  btnGhostText: { color: COLORS.text, fontWeight: '800' },
});
