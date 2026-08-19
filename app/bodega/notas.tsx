import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ScrollView, ActivityIndicator, SafeAreaView, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  buscarTercero, guardarNota, getNotasPendientes, aprobarNota, eliminarNota,
  getProductosPorDocumento, type Tercero, type Nota, type Producto,
} from './services/bodega.service';

type TabType = 'crear' | 'pendientes';

export default function NotasScreen() {
  const [tab, setTab] = useState<TabType>('crear');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('userData').then((raw) => {
      if (raw) setUserName(JSON.parse(raw).name ?? '');
    });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'crear' && styles.tabActive]}
          onPress={() => setTab('crear')}
        >
          <Ionicons name="add-circle-outline" size={18} color={tab === 'crear' ? '#fff' : '#0D5395'} />
          <Text style={[styles.tabText, tab === 'crear' && styles.tabTextActive]}>  Crear Nota</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'pendientes' && styles.tabActive]}
          onPress={() => setTab('pendientes')}
        >
          <Ionicons name="time-outline" size={18} color={tab === 'pendientes' ? '#fff' : '#0D5395'} />
          <Text style={[styles.tabText, tab === 'pendientes' && styles.tabTextActive]}>  Pendientes</Text>
        </TouchableOpacity>
      </View>

      {tab === 'crear'
        ? <CrearNotaTab userName={userName} />
        : <NotasPendientesTab userName={userName} />
      }
    </SafeAreaView>
  );
}

// ── Tab: Crear Nota ────────────────────────────────────────────────────────────
function CrearNotaTab({ userName }: { userName: string }) {
  const [terceroQuery, setTerceroQuery] = useState('');
  const [terceroResultados, setTerceroResultados] = useState<Tercero[]>([]);
  const [terceroSeleccionado, setTerceroSeleccionado] = useState<Tercero | null>(null);
  const [transaccion, setTransaccion] = useState('');
  const [documento, setDocumento] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [motivo, setMotivo] = useState('');
  const [cantidades, setCantidades] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const buscar = async () => {
    if (!terceroQuery.trim()) return;
    try {
      const res = await buscarTercero(terceroQuery);
      setTerceroResultados(res);
    } catch {
      Alert.alert('Error', 'No se pudo buscar el tercero.');
    }
  };

  const loadProductos = async () => {
    if (!transaccion || !documento) return;
    try {
      const res = await getProductosPorDocumento(transaccion, documento);
      setProductos(res);
      setCantidades({});
    } catch {
      Alert.alert('Error', 'No se pudo cargar los productos.');
    }
  };

  const handleSubmit = async () => {
    if (!terceroSeleccionado || !transaccion || !documento || !motivo) {
      Alert.alert('Campos incompletos', 'Complete todos los campos obligatorios.');
      return;
    }
    setSaving(true);
    try {
      await guardarNota({
        tercero: terceroSeleccionado.StrIdTercero,
        transaccion, documento,
        producto: productos.map((p) => p.StrProducto),
        motivo, usuario: userName,
        cantidadesCancelar: cantidades,
      });
      Alert.alert('✅ Éxito', 'Nota guardada correctamente.');
      setTerceroSeleccionado(null); setTerceroQuery(''); setTransaccion('');
      setDocumento(''); setProductos([]); setMotivo(''); setCantidades({});
    } catch {
      Alert.alert('Error', 'No se pudo guardar la nota.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.formContainer}>
      {/* Buscar tercero */}
      <Text style={styles.fieldLabel}>Tercero / Cliente *</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="ID o nombre del cliente"
          value={terceroQuery}
          onChangeText={setTerceroQuery}
          placeholderTextColor="#94A3B8"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={buscar}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      {terceroResultados.length > 0 && !terceroSeleccionado && (
        <View style={styles.resultsList}>
          {terceroResultados.map((t) => (
            <TouchableOpacity
              key={t.StrIdTercero}
              style={styles.resultItem}
              onPress={() => { setTerceroSeleccionado(t); setTerceroResultados([]); setTerceroQuery(t.StrNombre); }}
            >
              <Text style={styles.resultText}>{t.StrNombre} ({t.StrIdTercero})</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Transacción y documento */}
      <Text style={styles.fieldLabel}>Transacción *</Text>
      <TextInput style={styles.input} value={transaccion} onChangeText={setTransaccion}
        keyboardType="numeric" placeholder="Ej: 42" placeholderTextColor="#94A3B8"
        onBlur={loadProductos} />

      <Text style={styles.fieldLabel}>Documento *</Text>
      <TextInput style={styles.input} value={documento} onChangeText={setDocumento}
        keyboardType="numeric" placeholder="Ej: 1001" placeholderTextColor="#94A3B8"
        onBlur={loadProductos} />

      {/* Productos */}
      {productos.length > 0 && (
        <View style={styles.productSection}>
          <Text style={styles.sectionTitle}>Productos ({productos.length})</Text>
          {productos.map((p, i) => (
            <View key={i} style={styles.productRow}>
              <Text style={styles.productName}>{p.StrProducto}</Text>
              <TextInput
                style={styles.cantidadInput}
                placeholder={`Cant. a cancelar (máx: ${p.IntCantidad})`}
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={cantidades[p.StrProducto] ?? ''}
                onChangeText={(v) => setCantidades((prev) => ({ ...prev, [p.StrProducto]: v }))}
              />
            </View>
          ))}
        </View>
      )}

      {/* Motivo */}
      <Text style={styles.fieldLabel}>Motivo *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={motivo}
        onChangeText={setMotivo}
        multiline
        numberOfLines={4}
        placeholder="Describa el motivo de la nota..."
        placeholderTextColor="#94A3B8"
      />

      <TouchableOpacity style={[styles.submitBtn, saving && styles.btnDisabled]} onPress={handleSubmit} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : (
          <>
            <Ionicons name="save-outline" size={18} color="#fff" />
            <Text style={styles.submitBtnText}>  Guardar Nota</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Tab: Notas Pendientes ──────────────────────────────────────────────────────
function NotasPendientesTab({ userName }: { userName: string }) {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotas = async () => {
    setLoading(true);
    try {
      const data = await getNotasPendientes();
      setNotas(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las notas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotas(); }, []);

  const handleAprobar = (nota: Nota) => {
    Alert.alert('Confirmar', '¿Desea aprobar esta nota?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aprobar', onPress: async () => {
          try {
            await aprobarNota(nota.id, userName);
            Alert.alert('✅ Aprobada', 'Nota aprobada correctamente.');
            loadNotas();
          } catch { Alert.alert('Error', 'No se pudo aprobar la nota.'); }
        },
      },
    ]);
  };

  const handleEliminar = (nota: Nota) => {
    Alert.alert('Confirmar', '¿Desea eliminar esta nota?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await eliminarNota(nota.id);
            loadNotas();
          } catch { Alert.alert('Error', 'No se pudo eliminar la nota.'); }
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#0D5395" />;

  if (notas.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="checkmark-circle-outline" size={60} color="#CBD5E1" />
        <Text style={styles.emptyText}>No hay notas pendientes.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notas}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => {
        const data = JSON.parse(item.data);
        return (
          <View style={styles.notaCard}>
            <Text style={styles.notaTitle}>Tercero: {data.tercero}</Text>
            <Text style={styles.notaSub}>Tx: {data.transaccion}  |  Doc: {data.documento}</Text>
            <Text style={styles.notaSub}>Motivo: {data.motivo}</Text>
            <Text style={styles.notaSub}>Creado por: {data.usuario}</Text>
            <Text style={styles.notaDate}>{new Date(item.created_at).toLocaleString('es-CO')}</Text>
            <View style={styles.notaActions}>
              <TouchableOpacity style={[styles.actionBtn, styles.btnApprove]} onPress={() => handleAprobar(item)}>
                <Ionicons name="checkmark-outline" size={14} color="#fff" />
                <Text style={styles.actionBtnText}>  Aprobar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.btnDelete]} onPress={() => handleEliminar(item)}>
                <Ionicons name="trash-outline" size={14} color="#fff" />
                <Text style={styles.actionBtnText}>  Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
    />
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F5F9' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14 },
  tabActive: { backgroundColor: 'rgba(13,83,149,0.85)', borderRadius: 0 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#0D5395' },
  tabTextActive: { color: '#fff' },
  formContainer: { padding: 20, paddingBottom: 40 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 13, fontSize: 14, color: '#1E293B' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  searchRow: { flexDirection: 'row', gap: 10 },
  searchBtn: { backgroundColor: 'rgba(13,83,149,0.85)', width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  resultsList: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', marginTop: 4 },
  resultItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  resultText: { fontSize: 14, color: '#1E293B' },
  productSection: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginTop: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0D5395', marginBottom: 10 },
  productRow: { marginBottom: 12 },
  productName: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4 },
  cantidadInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 10, fontSize: 13, color: '#1E293B' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13,83,149,0.85)', padding: 16, borderRadius: 12, marginTop: 28 },
  btnDisabled: { backgroundColor: '#94A3B8' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { color: '#94A3B8', fontSize: 15 },
  notaCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, elevation: 2 },
  notaTitle: { fontWeight: '700', fontSize: 14, color: '#0D5395', marginBottom: 4 },
  notaSub: { fontSize: 13, color: '#475569', marginBottom: 2 },
  notaDate: { fontSize: 11, color: '#94A3B8', marginTop: 4, marginBottom: 8 },
  notaActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  btnApprove: { backgroundColor: '#16A34A' },
  btnDelete: { backgroundColor: '#DC2626' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});