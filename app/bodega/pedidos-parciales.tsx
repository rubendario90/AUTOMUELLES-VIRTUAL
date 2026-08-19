import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  StyleSheet, Alert, ScrollView, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getEntregaParcial, actualizarEntregaParcial, getUsuarios,
  type EntregaParcial, type UserBasic,
} from './services/bodega.service';

type Producto = {
  descripcion: string; cantidad: string; producto: string;
  StrParam1: string; estado: string; bodega: string;
};

export default function PedidosParcialesScreen() {
  const [facturas, setFacturas] = useState<EntregaParcial[]>([]);
  const [usuarios, setUsuarios] = useState<UserBasic[]>([]);
  const [selected, setSelected] = useState<EntregaParcial | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [checklist, setChecklist] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [f, u] = await Promise.all([getEntregaParcial(), getUsuarios()]);
      setFacturas(f);
      setUsuarios(u);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSelect = (factura: EntregaParcial) => {
    const parsed: Producto[] = JSON.parse(factura.productos);
    setProductos(parsed);
    setChecklist(parsed.map((p) => p.estado === 'entregado'));
    setSelected(factura);
  };

  const toggle = (i: number) => {
    setChecklist((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const allChecked = checklist.length > 0 && checklist.every(Boolean);

  const handleGuardar = async () => {
    if (!selected) return;
    const usuario = usuarios.find((u) => u.name === selected.user_name);
    if (!usuario) { Alert.alert('Error', 'Usuario no encontrado.'); return; }
    try {
      await actualizarEntregaParcial({
        transaccion: parseInt(String(selected.transaccion), 10),
        factura_id: parseInt(String(selected.factura_id), 10),
        user_id: usuario.id,
      });
      Alert.alert('✅ Éxito', 'Estado actualizado correctamente.', [
        { text: 'OK', onPress: () => { setSelected(null); setProductos([]); loadData(); } },
      ]);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el estado.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D5395" />
      </View>
    );
  }

  // Vista detalle de productos
  if (selected && productos.length > 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView>
          <View style={styles.headerCard}>
            <Text style={styles.headerTitle}>Doc: {selected.documento}  |  Tx: {selected.transaccion}</Text>
            <Text style={styles.headerSub}>📅 {new Date(selected.created_at).toLocaleDateString('es-CO')}</Text>
            {selected.ClienteNombre && <Text style={styles.headerSub}>👤 {selected.ClienteNombre}</Text>}
            {selected.StrUsuarioGra && <Text style={styles.headerSub}>🧾 Vendedor: {selected.StrUsuarioGra}</Text>}
          </View>

          {productos.map((p, i) => {
            const entregado = p.estado === 'entregado';
            return (
              <TouchableOpacity
                key={i}
                style={[styles.itemRow, checklist[i] && styles.itemRowChecked, entregado && styles.itemRowDone]}
                onPress={() => !entregado && toggle(i)}
                activeOpacity={entregado ? 1 : 0.7}
              >
                <View style={[styles.checkbox, checklist[i] && styles.checkboxChecked]}>
                  {checklist[i] && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{p.descripcion}</Text>
                  <Text style={styles.itemSub}>
                    Prod: {p.producto}  |  Bodega: {p.bodega}  |  Ubic: {p.StrParam1}
                  </Text>
                  <Text style={styles.itemQty}>Cant: {Number(p.cantidad || 0).toFixed(2)}</Text>
                  <View style={[styles.estadoBadge, entregado ? styles.estadoVerde : styles.estadoAmarillo]}>
                    <Text style={styles.estadoText}>{p.estado}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnBack} onPress={() => { setSelected(null); setProductos([]); }}>
              <Ionicons name="arrow-back-outline" size={16} color="#fff" />
              <Text style={styles.btnText}>  Volver</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnConfirm, !allChecked && styles.btnDisabled]}
              onPress={handleGuardar}
              disabled={!allChecked}
            >
              <Ionicons name="save-outline" size={16} color="#fff" />
              <Text style={styles.btnText}>  Guardar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={facturas}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="git-branch-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyText}>No hay facturas en entrega parcial.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Factura # {item.factura_id}</Text>
              <Text style={styles.cardHeaderSub}>Tx: {item.transaccion}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardDetail}>👤 {item.user_name}</Text>
              <Text style={styles.cardDetail}>📅 {new Date(item.created_at).toLocaleDateString('es-CO')}</Text>
            </View>
            <TouchableOpacity style={styles.btn} onPress={() => handleSelect(item)}>
              <Text style={styles.btnText}>Ver Productos →</Text>
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
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 14, marginBottom: 8, borderRadius: 12, padding: 12, elevation: 1 },
  itemRowChecked: { borderLeftWidth: 4, borderLeftColor: '#16A34A', backgroundColor: '#F0FDF4' },
  itemRowDone: { opacity: 0.6 },
  checkbox: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, borderColor: '#0D5395', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  itemSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  itemQty: { fontSize: 12, fontWeight: '600', color: '#0D5395', marginTop: 2 },
  estadoBadge: { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  estadoVerde: { backgroundColor: '#DCFCE7' },
  estadoAmarillo: { backgroundColor: '#FEF9C3' },
  estadoText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  actions: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 32 },
  btnBack: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#64748B', padding: 13, borderRadius: 10 },
  btnConfirm: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#16A34A', padding: 13, borderRadius: 10 },
  btnDisabled: { backgroundColor: '#94A3B8' },
});