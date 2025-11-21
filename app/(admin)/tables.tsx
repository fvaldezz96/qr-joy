import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAppDispatch, useAppSelector } from '../../src/hook';
import {
  createTable,
  deleteTable,
  fetchTables,
  Table,
  updateTable,
} from '../../src/store/slices/tablesSlice';

export default function TablesScreen() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.tables);

  const [editing, setEditing] = useState<Table | null>(null);
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  useEffect(() => {
    if (editing) {
      setNumber(String(editing.number));
      setName(editing.name || '');
      setCapacity(editing.capacity ? String(editing.capacity) : '');
    } else {
      setNumber('');
      setName('');
      setCapacity('');
    }
  }, [editing]);

  const handleSubmit = async () => {
    const num = Number(number);
    const cap = capacity ? Number(capacity) : undefined;

    if (!num || Number.isNaN(num)) {
      return Alert.alert('Error', 'Número de mesa inválido');
    }

    try {
      if (editing) {
        await dispatch(
          updateTable({
            id: editing._id,
            name: name || undefined,
            capacity: cap,
          }),
        ).unwrap();
      } else {
        await dispatch(
          createTable({
            number: num,
            name: name || undefined,
            capacity: cap,
          }),
        ).unwrap();
      }
      setEditing(null);
    } catch (e: any) {
      // Cuando createTable usa rejectWithValue, unwrap lanza directamente { message }
      const backendMessage = e?.message || e?.error?.message;
      Alert.alert('Error', backendMessage || 'No se pudo guardar la mesa');
    }
  };

  const handleDelete = async (table: Table) => {
    Alert.alert(
      'Eliminar mesa',
      `¿Seguro que quieres eliminar la mesa ${table.number}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteTable(table._id)).unwrap();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'No se pudo eliminar la mesa');
            }
          },
        },
      ],
    );
  };

  return (
    <LinearGradient colors={['#0F0E17', '#1A0B2E', '#2A0B3A']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Ionicons name="restaurant" size={32} color="#FAD02C" />
          <Text style={styles.title}>Mesas</Text>
          <Text style={styles.subtitle}>Administrá las mesas disponibles para pedidos</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{editing ? 'Editar mesa' : 'Nueva mesa'}</Text>
          <View style={styles.formRow}>
            <Text style={styles.label}>Número</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={number}
              onChangeText={setNumber}
              placeholder="Ej: 5"
              placeholderTextColor="#6B7280"
            />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.label}>Nombre (opcional)</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Terraza, VIP, etc."
              placeholderTextColor="#6B7280"
            />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.label}>Capacidad (opcional)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={capacity}
              onChangeText={setCapacity}
              placeholder="Ej: 4"
              placeholderTextColor="#6B7280"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
            <Text style={styles.saveButtonText}>{editing ? 'Guardar cambios' : 'Crear mesa'}</Text>
          </TouchableOpacity>

          {editing && (
            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(null)}>
              <Text style={styles.cancelButtonText}>Cancelar edición</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mesas existentes</Text>
          {loading ? (
            <ActivityIndicator color="#FAD02C" style={{ marginTop: 16 }} />
          ) : (
            <FlatList
              data={[...items].sort((a, b) => a.number - b.number)}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <View>
                    <Text style={styles.tableTitle}>Mesa {item.number}</Text>
                    {item.name ? <Text style={styles.tableSubtitle}>{item.name}</Text> : null}
                  </View>
                  <View style={styles.tableActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => setEditing(item)}
                    >
                      <Ionicons name="create-outline" size={18} color="#FAD02C" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(item)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#F87171" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', color: '#FAD02C', marginTop: 8 },
  subtitle: { fontSize: 14, color: '#A7A9BE', marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FAD02C',
    marginBottom: 12,
  },
  formRow: { marginBottom: 12 },
  label: { color: '#E5E7EB', marginBottom: 4, fontWeight: '600' },
  input: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(15,23,42,0.9)',
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cancelButton: {
    marginTop: 8,
    backgroundColor: 'transparent',
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#9CA3AF', fontWeight: '600' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55,65,81,0.6)',
  },
  tableTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  tableSubtitle: { color: '#9CA3AF', fontSize: 13, marginTop: 2 },
  tableActions: { flexDirection: 'row', gap: 8 },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(250, 176, 5, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(250, 176, 5, 0.4)',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
  },
});
