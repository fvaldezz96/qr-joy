import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import * as WebBrowser from 'expo-web-browser';

import { useAppDispatch, useAppSelector } from '../src/hook';
import { logout } from '../src/store/slices/authSlice';
import logo from '../assets/IMG_1459.png';
import { addToCart } from '../src/store/slices/cartSlice';
import { fetchProducts, selectAllProducts, selectProductsLoading, Product } from '../src/store/slices/productsSlice';
import LoginModal from '../src/components/LoginModal';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isMobile = width < 768;
const isTablet = width >= 768 && width < 1200;
const isDesktop = width >= 1200;

export default function Home() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Auth State
  const { user } = useAppSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'admin' || user?.role === 'employee';

  // Products State
  const products = useAppSelector(selectAllProducts);
  const productsLoading = useAppSelector(selectProductsLoading);
  const cartItems = useAppSelector((s) => s.cart.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  // UI State
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [filter, setFilter] = useState<'all' | 'drink' | 'food'>('all');

  // Load Products
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filteredProducts = products
    .filter((p) => p.category !== 'ticket')
    .filter((p) => filter === 'all' || p.category === filter);

  const handleLogout = () => {
    dispatch(logout());
    setMenuVisible(false);
    Toast.show({ type: 'info', text1: 'Hasta pronto' });
  };

  const toggleMenu = () => setMenuVisible(!menuVisible);
  const openLogin = () => {
    setModalVisible(true);
    setMenuVisible(false);
  };

  return (
    <LinearGradient colors={['#0a001f', '#1a0033', '#2d0055']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoGlow}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>

          {/* USER AVATAR / LOGIN BUTTON */}
          <TouchableOpacity style={styles.userButton} onPress={user ? toggleMenu : openLogin}>
            {user ? (
              <LinearGradient colors={['#ff00aa', '#aa00ff']} style={styles.avatar}>
                <Text style={styles.avatarText}>{user.email[0].toUpperCase()}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.loginBtn}>
                <Ionicons name="person-outline" size={20} color="#e0aaff" />
                <Text style={styles.loginText}>ACCESO VIP</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* USER MENU DROPDOWN */}
        {menuVisible && (
          <Animated.View style={[styles.userMenu, isDesktop && styles.userMenuDesktop]}>
            <View style={styles.menuHeader}>
              <LinearGradient colors={['#ff00aa', '#aa00ff']} style={styles.avatarSmall}>
                <Text style={styles.avatarTextSmall}>{user?.email[0].toUpperCase()}</Text>
              </LinearGradient>
              <View>
                <Text style={styles.menuName}>{user?.name || 'VIP Guest'}</Text>
                <Text style={styles.menuEmail}>{(user?.email || '').substring(0, 20)}...</Text>
                <View style={[styles.roleBadge, isAdmin && styles.adminBadge]}>
                  <Text style={styles.roleText}>{(user?.role || 'guest').toUpperCase()}</Text>
                </View>
              </View>
            </View>

            {/* Staff Shortcuts */}
            {isStaff && (
              <>
                <Link href="/(admin)/dashboard" asChild>
                  <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="apps-outline" size={22} color="#00ffff" />
                    <Text style={[styles.menuItemText, { color: '#00ffff' }]}>Panel Admin</Text>
                  </TouchableOpacity>
                </Link>
                <Link href="/(admin)/qr-scanner" asChild>
                  <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="scan-outline" size={22} color="#00ffaa" />
                    <Text style={[styles.menuItemText, { color: '#00ffaa' }]}>Escanear QR</Text>
                  </TouchableOpacity>
                </Link>
                <Link href="/(admin)/comandas" asChild>
                  <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="fast-food-outline" size={22} color="#ffff00" />
                    <Text style={[styles.menuItemText, { color: '#ffff00' }]}>Comandas</Text>
                  </TouchableOpacity>
                </Link>
                <View style={styles.menuDivider} />
              </>
            )}

            <Link href="/(user)/orders" asChild>
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="receipt-outline" size={22} color="#ffaa00" />
                <Text style={[styles.menuItemText, { color: '#ffaa00' }]}>Mis Órdenes</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(user)/my-qr" asChild>
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="qr-code-outline" size={22} color="#00ffff" />
                <Text style={[styles.menuItemText, { color: '#00ffff' }]}>Mis QRs</Text>
              </TouchableOpacity>
            </Link>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#ff3366" />
              <Text style={styles.menuItemText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ===  ACCESOS RÁPIDOS  === */}
        {user && (
          <View style={styles.quickAccessContainer}>
            <Link href="/(user)/my-qr" asChild>
              <TouchableOpacity style={styles.quickAccessButton}>
                <LinearGradient colors={['#00ffaa', '#00aa77']} style={styles.quickAccessGradient}>
                  <Ionicons name="qr-code-outline" size={24} color="#003322" />
                  <Text style={styles.quickAccessText}>Mis QRs Activos</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Link>

            <Link href="/(user)/orders" asChild>
              <TouchableOpacity style={styles.quickAccessButton}>
                <LinearGradient colors={['#aa00ff', '#7700aa']} style={styles.quickAccessGradient}>
                  <Ionicons name="receipt-outline" size={24} color="#fff" />
                  <Text style={[styles.quickAccessText, { color: '#fff' }]}>Mis Consumos</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Link>
          </View>
        )}

        {/* === FILTROS DE LA CARTA === */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>CARTA DIGITAL</Text>
          <View style={styles.filterContainer}>
            <FilterButton label="Todo" active={filter === 'all'} onPress={() => setFilter('all')} color="#8B5CF6" />
            <FilterButton label="Bebida" icon="wine" active={filter === 'drink'} onPress={() => setFilter('drink')} color="#8B5CF6" />
            <FilterButton label="Comida" icon="fast-food" active={filter === 'food'} onPress={() => setFilter('food')} color="#F59E0B" />
          </View>
        </View>

        {/* === LISTA DE PRODUCTOS === */}
        {productsLoading ? (
          <ActivityIndicator size="large" color="#aa00ff" style={{ marginTop: 40 }} />
        ) : filteredProducts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hay productos disponibles</Text>
          </View>
        ) : (
          <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
            {filteredProducts.map((item, i) => (
              <ProductCard key={item._id} product={item} index={i} />
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}> 2026 JOYWINE NIGHTCLUB • SAN JUAN</Text>
        </View>
      </ScrollView>

      {/* FAB CARRITO */}
      <Link href="/(user)/cart" asChild>
        <TouchableOpacity style={styles.fab}>
          <LinearGradient colors={['#aa00ff', '#ff00aa']} style={styles.fabGradient}>
            <Ionicons name="cart" size={28} color="#fff" />
            {cartCount > 0 && (
              <View style={styles.fabBadge}>
                <Text style={styles.fabBadgeText}>{cartCount}</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Link>

      {/* LOGIN MODAL */}
      <LoginModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      <Toast />
    </LinearGradient>
  );
}

// === COMPONENTES AUXILIARES ===

function FilterButton({ label, icon, active, onPress, color }: { label: string; icon?: string; active: boolean; onPress: () => void; color: string }) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, active && { backgroundColor: color + '30', borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={active ? [color, color + 'E6'] : ['transparent', 'transparent']}
        style={styles.filterGradient}
      >
        {icon && <Ionicons name={icon as any} size={18} color={active ? '#fff' : color} />}
        <Text style={[styles.filterText, active && { color: '#fff', fontWeight: '800' }, !active && { color }]}>
          {label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const dispatch = useAppDispatch();
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, delay: index * 60, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleAdd = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.95, friction: 5, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
    dispatch(addToCart({ product }));
    Toast.show({ type: 'success', text1: 'Agregado', text2: product.name, visibilityTime: 1500 });
  };

  const categoryMap = {
    drink: { icon: 'wine', color: '#8B5CF6', label: 'Bebida' },
    food: { icon: 'fast-food', color: '#F59E0B', label: 'Comida' },
    ticket: { icon: 'ticket', color: '#10B981', label: 'Entrada' },
  } as const;

  const category = categoryMap[product.category as keyof typeof categoryMap] || { icon: 'cube', color: '#6B7280', label: 'Otro' };

  return (
    <Animated.View style={[styles.cardWrapper, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} style={styles.cardGradient}>
        <View style={styles.cardRow}>
          <View style={styles.imageContainer}>
            {product.imageUrl ? (
              <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name={category.icon as any} size={32} color={category.color} />
              </View>
            )}
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.headerRow}>
              <View style={[styles.badge, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon as any} size={10} color="#fff" />
                <Text style={styles.badgeText}>{category.label}</Text>
              </View>
            </View>

            <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.productPrice}>${product.price.toLocaleString()}</Text>

            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <LinearGradient colors={[category.color, category.color + 'D0']} style={styles.addGradient}>
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.addText}>Agregar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: isMobile ? 16 : 40,
    paddingTop: 60,
    paddingBottom: 100,
    alignItems: 'center',
    width: '100%',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    maxWidth: 900,
  },
  logoGlow: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(170, 0, 255, 0.1)',
  },
  logo: { width: 80, height: 40 },
  userButton: {},
  avatar: {
    width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff'
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  loginBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(170,0,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#aa00ff', gap: 6
  },
  loginText: { color: '#e0aaff', fontWeight: '800', fontSize: 12 },

  // Menu
  userMenu: {
    position: 'absolute', top: 70, right: 20, backgroundColor: '#150030', borderRadius: 24, padding: 20, width: 280, borderWidth: 1, borderColor: '#aa00ff', zIndex: 1000, elevation: 20
  },
  userMenuDesktop: { top: 80, right: 40, width: 320 },
  menuHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  avatarSmall: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarTextSmall: { color: '#fff', fontSize: 18, fontWeight: '900' },
  menuName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  menuEmail: { color: '#aaa', fontSize: 12 },
  roleBadge: { backgroundColor: '#333', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4, alignSelf: 'flex-start' },
  adminBadge: { backgroundColor: '#aa00ff' },
  roleText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  menuItemText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  menuDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 8 },

  // Quick Access
  quickAccessContainer: { width: '100%', maxWidth: 900, flexDirection: 'row', gap: 12, marginBottom: 30, justifyContent: 'center' },
  quickAccessButton: { flex: 1, borderRadius: 16, overflow: 'hidden', maxWidth: 200, elevation: 4 },
  quickAccessGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 10 },
  quickAccessText: { fontSize: 14, fontWeight: '800', color: '#003322', letterSpacing: 0.5 },

  // Filters
  filterSection: { width: '100%', maxWidth: 900, marginBottom: 20 },
  sectionTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 16, letterSpacing: 2, textAlign: 'center' },
  filterContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, flexWrap: 'wrap' },
  filterButton: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
  filterGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 6 },
  filterText: { fontSize: 14, fontWeight: '700' },

  // Grid
  grid: { width: '100%', maxWidth: 600, gap: 16 },
  gridDesktop: { maxWidth: 900, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#888', fontStyle: 'italic' },

  // Product Card
  cardWrapper: {
    width: isDesktop ? '30%' : '100%',
    borderRadius: 20, overflow: 'hidden', elevation: 4, backgroundColor: '#000'
  },
  cardGradient: { padding: 1 },
  cardRow: { backgroundColor: '#1A1A2E', borderRadius: 19, flexDirection: 'row', padding: 12, alignItems: 'center' },
  imageContainer: { width: 80, height: 80, borderRadius: 16, overflow: 'hidden', backgroundColor: '#2A2A3E', marginRight: 16 },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoContainer: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, gap: 4, alignSelf: 'flex-start' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  productName: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  productPrice: { color: '#aa00ff', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  addButton: { alignSelf: 'flex-start', borderRadius: 12, overflow: 'hidden' },
  addGradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, gap: 4 },
  addText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // FAB
  fab: { position: 'absolute', bottom: 30, right: 20, elevation: 10, shadowColor: '#aa00ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10 },
  fabGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  fabBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ff0000', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#150030' },
  fabBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  // Footer
  footer: { marginTop: 40, paddingBottom: 20, alignItems: 'center' },
  footerText: { color: '#666', fontSize: 12, letterSpacing: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
});