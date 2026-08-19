import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  StyleSheet, Alert, ScrollView, SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import {
  getPickingFacturas, getPickingDetails, actualizarRevisionFinal,
  type FacturaAsignada, type DocumentDetail,
} from './services/bodega.service';

export default function RevisionFinalScreen() {
  const [facturas, setFacturas] = useState<FacturaAsignada[]>([]);
  const [selected, setSelected] = useState<FacturaAsignada | null>(null);
  const [items, setItems] = useState<DocumentDetail[]>([]);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [userId, setUserId] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem('userData').then((raw) => {
      if (raw) setUserId(JSON.parse(raw).id ?? 0);
    });
  }, []);

  const loadFacturas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPickingFacturas();
      setFacturas(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las facturas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFacturas(); }, [loadFacturas]);

  const handleSelect = async (factura: FacturaAsignada) => {
    setDetailLoading(true);
    try {
      const data = await getPickingDetails(factura.transaccion, factura.documento);
      setSelected(factura);
      setItems(data);
      setChecked({});
    } catch {
      Alert.alert('Error', 'No se pudo cargar el detalle.');
    } finally {
      setDetailLoading(false);
    }
  };

  const toggle = (i: number) => setChecked((prev) => ({ ...prev, [i]: !prev[i] }));
  const allChecked = items.length > 0 && items.every((_, i) => checked[i]);

  const handleConfirm = async () => {
    if (!selected) return;
    try {
      await actualizarRevisionFinal({ factura_id: selected.factura_id, transaccion: selected.transaccion, user_id: userId });
      Alert.alert('✅ Éxito', 'Factura actualizada a Revisión Final.', [
        { text: 'OK', onPress: () => { setSelected(null); setItems([]); loadFacturas(); } },
      ]);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar la factura.');
    }
  };

  if (loading || detailLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D5395" />
      </View>
    );
  }

  // Vista de detalle con checklist
  if (selected && items.length > 0) {
    const first = items[0];
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView>
          <View style={styles.headerCard}>
            <Text style={styles.headerTitle}>Factura #{first.IntDocumento}  |  Tx: {first.IntTransaccion}</Text>
            <Text style={styles.headerSub}>📅 {new Date(first.DatFecha1).toLocaleDateString('es-CO')}</Text>
            <Text style={styles.headerSub}>👤 {first.ClienteNombre}</Text>
            <Text style={styles.headerSub}>🧾 Vendedor: {first.StrUsuarioGra}</Text>
            <Text style={styles.headerSub}>📦 Enviar a: {first.StrReferencia1}</Text>
          </View>

          <Text style={styles.hint}>Marca todos los productos para confirmar la entrega</Text>

          {items.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.itemRow, checked[i] && styles.itemRowChecked]}
              onPress={() => toggle(i)}
            >
              <View style={[styles.checkbox, checked[i] && styles.checkboxChecked]}>
                {checked[i] && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.StrDescripcion}</Text>
                <Text style={styles.itemSub}>
                  Prod: {item.StrProducto}  |  Bodega: {item.IntBodega}
                </Text>
                <Text style={styles.itemQty}>
                  Cantidad: {parseFloat(String(item.IntCantidad).replace(',', '.')).toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnBack} onPress={() => { setSelected(null); setItems([]); }}>
              <Ionicons name="arrow-back-outline" size={16} color="#fff" />
              <Text style={styles.btnText}>  Volver</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnConfirm, !allChecked && styles.btnDisabled]}
              onPress={handleConfirm}
              disabled={!allChecked}
            >
              <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
              <Text style={styles.btnText}>  Entrega Total</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Lista de facturas en picking
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={facturas}
        keyExtractor={(item) => String(item.factura_id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyText}>No hay facturas en estado picking.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Factura # {item.factura_id}</Text>
              <Text style={styles.cardHeaderSub}>Tx: {item.transaccion}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardDetail}>Doc: {item.documento}  |  Usuario: {item.user_name}</Text>
              <Text style={styles.cardDetail}>Estado: {item.estado}</Text>
              <Text style={styles.cardDetail}>{new Date(item.updated_at).toLocaleString('es-CO')}</Text>
            </View>
            <TouchableOpacity style={styles.btn} onPress={() => handleSelect(item)}>
              <Text style={styles.btnText}>Ver Detalle →</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F5F9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { color: '#94A3B8', fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 12, elevation: 2 },
  cardHeader: { backgroundColor: 'rgba(13,83,149,0.8)', padding: 12, borderTopLeftRadius: 14, borderTopRightRadius: 14, flexDirection: 'row', justifyContent: 'space-between' },
  cardHeaderText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cardHeaderSub: { color: '#CBD5E1', fontSize: 13 },
  cardBody: { padding: 12, gap: 4 },
  cardDetail: { fontSize: 13, color: '#475569' },
  btn: { backgroundColor: 'rgba(13,83,149,0.85)', margin: 12, marginTop: 0, padding: 11, borderRadius: 9, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  headerCard: { backgroundColor: '#fff', margin: 14, padding: 16, borderRadius: 14, elevation: 2, borderLeftWidth: 4, borderLeftColor: 'rgba(13,83,149,0.8)', gap: 4 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#0D5395', marginBottom: 4 },
  headerSub: { fontSize: 13, color: '#475569' },
  hint: { fontSize: 12, color: '#94A3B8', fontStyle: 'italic', marginHorizontal: 14, marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 14, marginBottom: 8, borderRadius: 12, padding: 12, elevation: 1 },
  itemRowChecked: { borderLeftWidth: 4, borderLeftColor: '#16A34A', backgroundColor: '#F0FDF4' },
  checkbox: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, borderColor: '#0D5395', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  itemSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  itemQty: { fontSize: 12, fontWeight: '600', color: '#0D5395', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 32 },
  btnBack: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#64748B', padding: 13, borderRadius: 10 },
  btnConfirm: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#16A34A', padding: 13, borderRadius: 10 },
  btnDisabled: { backgroundColor: '#94A3B8' },
});