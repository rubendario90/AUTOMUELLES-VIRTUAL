import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, RefreshControl, Alert, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getFacturasPendientes, type FacturaAsignada } from './services/bodega.service';

export default function FacturasPendientesScreen() {
  const router = useRouter();
  const [facturas, setFacturas] = useState<FacturaAsignada[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFacturas = useCallback(async () => {
    try {
      const data = await getFacturasPendientes();
      setFacturas(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las facturas pendientes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFacturas();
    const interval = setInterval(fetchFacturas, 30_000);
    return () => clearInterval(interval);
  }, [fetchFacturas]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D5395" />
        <Text style={styles.loadingText}>Cargando facturas...</Text>
      </View>
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
            <Ionicons name="checkmark-circle-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyText}>No tienes facturas pendientes.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchFacturas(); }}
            colors={['#0D5395']}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Factura # {item.factura_id}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.estado}</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <InfoRow icon="swap-horizontal" label="Transacción" value={String(item.transaccion)} />
              <InfoRow icon="document-text-outline" label="Documento" value={String(item.documento)} />
              <InfoRow icon="calendar-outline" label="Fecha" value={new Date(item.created_at).toLocaleDateString('es-CO')} />
            </View>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => router.push({ pathname: '/bodega/gestionar-factura', params: { factura: JSON.stringify(item) } })}
            >
              <Ionicons name="settings-outline" size={16} color="#fff" />
              <Text style={styles.btnText}>  Gestionar</Text>
            </TouchableOpacity>
            <Text style={styles.cardFooter}>
              Actualizado: {new Date(item.updated_at).toLocaleDateString('es-CO')}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={14} color="#0D5395" />
      <Text style={styles.infoLabel}>  {label}: </Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F5F9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#64748B', fontSize: 14 },
  list: { padding: 16, paddingBottom: 32 },
  emptyContainer: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { color: '#94A3B8', fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 14, elevation: 3, shadowColor: '#0D5395', shadowOpacity: 0.1, shadowRadius: 8 },
  cardHeader: { backgroundColor: 'rgba(13, 83, 149, 0.8)', borderTopLeftRadius: 14, borderTopRightRadius: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 13 },
  cardHeaderText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  badge: { backgroundColor: '#F59E0B', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardBody: { padding: 14, gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { fontWeight: '600', color: '#0D5395', fontSize: 13 },
  infoValue: { color: '#374151', fontSize: 13 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13, 83, 149, 0.85)', marginHorizontal: 14, marginBottom: 10, padding: 11, borderRadius: 9 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cardFooter: { textAlign: 'center', fontSize: 11, color: '#94A3B8', paddingBottom: 10 },
});