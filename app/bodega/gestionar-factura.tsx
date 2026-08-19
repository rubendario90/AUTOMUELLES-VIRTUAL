import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  StyleSheet, Alert, Modal, SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import {
  getDocumentDetails, actualizarEstado, registrarEntregaParcial,
  type FacturaAsignada, type DocumentDetail,
} from './services/bodega.service';

export default function GestionarFacturaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ factura: string }>();
  const factura: FacturaAsignada = JSON.parse(params.factura ?? '{}');

  const [items, setItems] = useState<DocumentDetail[]>([]);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [parcialData, setParcialData] = useState<{ selected: DocumentDetail[]; unselected: DocumentDetail[] } | null>(null);
  const [userId, setUserId] = useState<number>(0);

  useEffect(() => {
    // Obtener el ID del usuario guardado en AsyncStorage
    AsyncStorage.getItem('userData').then((raw) => {
      if (raw) setUserId(JSON.parse(raw).id ?? 0);
    });

    getDocumentDetails(factura.transaccion, factura.documento)
      .then(setItems)
      .catch(() => Alert.alert('Error', 'No se pudo cargar el detalle de la factura.'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (i: number) => setChecked((prev) => ({ ...prev, [i]: !prev[i] }));
  const allChecked = items.length > 0 && items.every((_, i) => checked[i]);

  const handleEntregaTotal = async () => {
    if (!allChecked) {
      Alert.alert('Atención', 'Debe marcar todos los productos antes de continuar.');
      return;
    }
    try {
      await actualizarEstado({ factura_id: factura.factura_id, transaccion: factura.transaccion, user_id: userId });
      Alert.alert('✅ Éxito', 'Estado actualizado correctamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el estado.');
    }
  };

  const handleEntregaParcial = () => {
    const selected = items.filter((_, i) => checked[i]);
    const unselected = items.filter((_, i) => !checked[i]);
    if (selected.length === 0) {
      Alert.alert('Atención', 'Seleccione al menos un producto.');
      return;
    }
    setParcialData({ selected, unselected });
    setModalVisible(true);
  };

  const confirmParcial = async () => {
    if (!parcialData) return;
    try {
      await registrarEntregaParcial({
        factura_id: factura.factura_id,
        transaccion: factura.transaccion,
        user_id: userId,
        productos_seleccionados: parcialData.selected,
        productos_no_seleccionados: parcialData.unselected,
      });
      setModalVisible(false);
      Alert.alert('✅ Éxito', 'Entrega parcial registrada.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'No se pudo registrar la entrega parcial.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D5395" />
      </View>
    );
  }

  const first = items[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        {/* Cabecera de factura */}
        {first && (
          <View style={styles.headerCard}>
            <Text style={styles.headerTitle}>📄 Factura #{first.IntDocumento}  |  Tx: {first.IntTransaccion}</Text>
            <Text style={styles.headerSub}>📅 {new Date(first.DatFecha1).toLocaleDateString('es-CO')}</Text>
            <Text style={styles.headerSub}>📦 Enviar a: {first.StrReferencia1}</Text>
            <Text style={styles.headerSub}>💳 Pago: {first.StrReferencia3}</Text>
            <Text style={styles.headerSub}>👤 Cliente: {first.ClienteNombre} ({first.StrTercero})</Text>
            <Text style={styles.headerSub}>🧾 Vendedor: {first.StrUsuarioGra}</Text>
            {first.StrObservaciones ? (
              <Text style={styles.headerSub}>📝 Obs: {first.StrObservaciones}</Text>
            ) : null}
          </View>
        )}

        {/* Lista de productos */}
        <Text style={styles.sectionTitle}>Productos ({items.length})</Text>
        {items.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.itemRow, checked[i] && styles.itemRowChecked]}
            onPress={() => toggle(i)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, checked[i] && styles.checkboxChecked]}>
              {checked[i] && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle} numberOfLines={2}>{item.StrDescripcion}</Text>
              <Text style={styles.itemSub}>
                Prod: {item.StrProducto}  |  Bodega: {item.IntBodega}  |  Ubic: {item.StrParam1}
              </Text>
              <Text style={styles.itemQty}>
                Cantidad: {parseFloat(String(item.IntCantidad).replace(',', '.')).toFixed(2)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Acciones */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnParcial} onPress={handleEntregaParcial}>
            <Ionicons name="git-branch-outline" size={16} color="#fff" />
            <Text style={styles.btnText}>  Entrega Parcial</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnTotal, !allChecked && styles.btnDisabled]}
            onPress={handleEntregaTotal}
            disabled={!allChecked}
          >
            <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
            <Text style={styles.btnText}>  Entrega Total</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal confirmación parcial */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirmar Entrega Parcial</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSectionGreen}>✅ A entregar ({parcialData?.selected.length})</Text>
              {parcialData?.selected.map((p, i) => (
                <Text key={i} style={styles.modalItem}>
                  • {p.StrDescripcion} — {parseFloat(String(p.IntCantidad).replace(',', '.')).toFixed(2)}
                </Text>
              ))}
              <Text style={styles.modalSectionRed}>❌ Pendientes ({parcialData?.unselected.length})</Text>
              {parcialData?.unselected.map((p, i) => (
                <Text key={i} style={styles.modalItem}>
                  • {p.StrDescripcion} — {parseFloat(String(p.IntCantidad).replace(',', '.')).toFixed(2)}
                </Text>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnTotal} onPress={confirmParcial}>
                <Text style={styles.btnText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F5F9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: { backgroundColor: '#fff', margin: 14, padding: 16, borderRadius: 14, elevation: 2, borderLeftWidth: 4, borderLeftColor: 'rgba(13,83,149,0.8)', gap: 4 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#0D5395', marginBottom: 4 },
  headerSub: { fontSize: 13, color: '#475569' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0D5395', marginHorizontal: 14, marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 14, marginBottom: 8, borderRadius: 12, padding: 12, elevation: 1 },
  itemRowChecked: { borderLeftWidth: 4, borderLeftColor: '#16A34A', backgroundColor: '#F0FDF4' },
  checkbox: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, borderColor: '#0D5395', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  itemSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  itemQty: { fontSize: 12, fontWeight: '600', color: '#0D5395', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 32 },
  btnParcial: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13,83,149,0.85)', padding: 13, borderRadius: 10 },
  btnTotal: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#16A34A', padding: 13, borderRadius: 10 },
  btnDisabled: { backgroundColor: '#94A3B8' },
  btnCancel: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#64748B', padding: 13, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#0D5395', marginBottom: 14 },
  modalSectionGreen: { fontWeight: '700', color: '#16A34A', marginTop: 8, marginBottom: 4 },
  modalSectionRed: { fontWeight: '700', color: '#DC2626', marginTop: 12, marginBottom: 4 },
  modalItem: { fontSize: 13, color: '#475569', marginLeft: 10, marginBottom: 3 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
});