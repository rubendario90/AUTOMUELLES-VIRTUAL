import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  StyleSheet, Alert, Modal, ScrollView, TextInput, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFacturas, getFacturaDetails, deleteFactura, type Factura, type FacturaDetail } from './services/bodega.service';

const PROTECTED = new Set([40, 42, 88, 90]);

export default function HistorialScreen() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<FacturaDetail | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadFacturas = async (date?: string) => {
    setLoading(true);
    try {
      const data = await getFacturas(date);
      setFacturas(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las facturas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFacturas(); }, []);

  const handleDateChange = (val: string) => {
    setFilterDate(val);
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) loadFacturas(val);
    if (val === '') loadFacturas();
  };

  const handleView = async (factura: Factura) => {
    try {
      const data = await getFacturaDetails(factura.id);
      setDetail(data);
      setModalVisible(true);
    } catch {
      Alert.alert('Error', 'No se pudo obtener el detalle.');
    }
  };

  const handleDelete = (factura: Factura) => {
    Alert.alert('Confirmar eliminación', '¿Está seguro de que desea eliminar esta factura?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await deleteFactura(factura.id);
            setFacturas((prev) => prev.filter((f) => f.id !== factura.id));
          } catch {
            Alert.alert('Error', 'No se pudo eliminar la factura.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D5395" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Filtro por fecha */}
      <View style={styles.filterRow}>
        <Ionicons name="calendar-outline" size={18} color="#0D5395" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.filterInput}
          placeholder="Filtrar: YYYY-MM-DD"
          placeholderTextColor="#94A3B8"
          value={filterDate}
          onChangeText={handleDateChange}
        />
        {filterDate !== '' && (
          <TouchableOpacity onPress={() => { setFilterDate(''); loadFacturas(); }}>
            <Ionicons name="close-circle" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={facturas}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="archive-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyText}>No hay facturas en el historial.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isProtected = PROTECTED.has(Number(item.transaccion));
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>Tx: {item.transaccion}  |  Doc: {item.documento}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardDetail}>Estado: <Text style={styles.bold}>{item.estado}</Text></Text>
                <Text style={styles.cardDetail}>📅 {new Date(item.created_at).toLocaleDateString('es-CO')}</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity style={[styles.actionBtn, styles.btnView]} onPress={() => handleView(item)}>
                  <Ionicons name="eye-outline" size={14} color="#fff" />
                  <Text style={styles.actionBtnText}>  Ver</Text>
                </TouchableOpacity>
                {!isProtected ? (
                  <TouchableOpacity style={[styles.actionBtn, styles.btnDelete]} onPress={() => handleDelete(item)}>
                    <Ionicons name="trash-outline" size={14} color="#fff" />
                    <Text style={styles.actionBtnText}>  Eliminar</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.protectedBadge}>
                    <Text style={styles.protectedText}>Protegida</Text>
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* Modal detalle */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Detalle de Factura</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {detail && (
                <>
                  <DetailRow label="Transacción" value={String(detail.factura?.transaccion)} />
                  <DetailRow label="Documento" value={String(detail.factura?.documento)} />
                  <DetailRow
                    label="Fecha"
                    value={detail.factura?.created_at ? new Date(detail.factura.created_at).toLocaleString('es-CO') : '—'}
                  />
                  <DetailRow label="Asignado a" value={detail.assigned_user?.name ?? 'No asignada'} />
                  <Text style={styles.logsTitle}>Historial de estados:</Text>
                  {detail.status_logs?.length > 0 ? (
                    detail.status_logs.map((log) => (
                      <Text key={log.id} style={styles.logItem}>
                        • {log.new_status} — {new Date(log.changed_at).toLocaleString('es-CO')} — {log.user_name}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.logItem}>Sin cambios registrados.</Text>
                  )}
                </>
              )}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Text style={styles.detailRow}>
      <Text style={styles.bold}>{label}: </Text>{value}
    </Text>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F5F9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 14, marginBottom: 0, padding: 12, borderRadius: 12, elevation: 1 },
  filterInput: { flex: 1, fontSize: 14, color: '#1E293B' },
  list: { padding: 14, paddingBottom: 32 },
  emptyContainer: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { color: '#94A3B8', fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 12, elevation: 2 },
  cardHeader: { backgroundColor: 'rgba(13,83,149,0.8)', padding: 12, borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  cardHeaderText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cardBody: { padding: 12, gap: 4 },
  cardDetail: { fontSize: 13, color: '#475569' },
  bold: { fontWeight: '700', color: '#1E293B' },
  cardActions: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingBottom: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  btnView: { backgroundColor: 'rgba(13,83,149,0.85)' },
  btnDelete: { backgroundColor: '#DC2626' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  protectedBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  protectedText: { color: '#94A3B8', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#0D5395', marginBottom: 14 },
  detailRow: { fontSize: 13, color: '#475569', marginBottom: 6 },
  logsTitle: { fontWeight: '700', color: '#374151', marginTop: 14, marginBottom: 6 },
  logItem: { fontSize: 12, color: '#64748B', marginLeft: 8, marginBottom: 4 },
  closeBtn: { backgroundColor: 'rgba(13,83,149,0.85)', padding: 13, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  closeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});