import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Alert, TouchableOpacity,
  ActivityIndicator, ScrollView, SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import {
  getFacturasPendientesParaReasignar, getUsuariosActivos, reasignarFactura,
  type FacturaAsignada, type UserBasic,
} from './services/bodega.service';

export default function ReasignarFacturaScreen() {
  const [facturas, setFacturas] = useState<FacturaAsignada[]>([]);
  const [usuarios, setUsuarios] = useState<UserBasic[]>([]);
  const [facturaId, setFacturaId] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getFacturasPendientesParaReasignar(), getUsuariosActivos()])
      .then(([f, u]) => { setFacturas(f); setUsuarios(u); })
      .catch(() => Alert.alert('Error', 'No se pudieron cargar los datos.'))
      .finally(() => setLoading(false));
  }, []);

  const facturaActual = facturas.find((f) => String(f.id) === facturaId);
  const usuarioActual = facturaActual?.usuario_actual ?? facturaActual?.user_name ?? 'Sin asignar';

  const handleReasignar = async () => {
    if (!facturaId || !usuarioId) {
      Alert.alert('Atención', 'Seleccione una factura y un usuario.');
      return;
    }
    setSaving(true);
    try {
      const res = await reasignarFactura(facturaId, usuarioId);
      Alert.alert('✅ Éxito', res.message ?? 'Factura reasignada correctamente.');
      setFacturaId('');
      setUsuarioId('');
    } catch {
      Alert.alert('Error', 'No se pudo reasignar la factura.');
    } finally {
      setSaving(false);
    }
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
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#0D5395" />
          <Text style={styles.infoText}>
            Selecciona la factura y el nuevo operario al que será asignada.
          </Text>
        </View>

        {/* Selector de factura */}
        <Text style={styles.label}>Factura pendiente</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={facturaId} onValueChange={setFacturaId}>
            <Picker.Item label="— Seleccione —" value="" color="#94A3B8" />
            {facturas.map((f) => (
              <Picker.Item
                key={f.id}
                label={`Doc: ${f.documento}  |  Tx: ${f.transaccion}  |  ${f.usuario_actual ?? f.user_name ?? 'Sin asignar'}`}
                value={String(f.id)}
              />
            ))}
          </Picker>
        </View>

        {facturaId !== '' && (
          <View style={styles.currentBadge}>
            <Ionicons name="person-outline" size={14} color="#0D5395" />
            <Text style={styles.currentBadgeText}>  Actualmente: {usuarioActual}</Text>
          </View>
        )}

        {/* Selector de usuario destino */}
        <Text style={styles.label}>Reasignar a</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={usuarioId} onValueChange={setUsuarioId}>
            <Picker.Item label="— Seleccione —" value="" color="#94A3B8" />
            {usuarios.map((u) => (
              <Picker.Item key={u.id} label={u.name} value={String(u.id)} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          style={[styles.btn, saving && styles.btnDisabled]}
          onPress={handleReasignar}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="swap-horizontal-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>  Reasignar Factura</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F5F9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20, paddingBottom: 40 },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, marginBottom: 20, gap: 8 },
  infoText: { flex: 1, fontSize: 13, color: '#1E40AF', lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#0D5395', marginBottom: 8, marginTop: 16 },
  pickerBox: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', overflow: 'hidden', elevation: 1 },
  currentBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', borderRadius: 10, padding: 10, marginTop: 8 },
  currentBadgeText: { color: '#1D4ED8', fontSize: 13, fontWeight: '600' },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13,83,149,0.85)', padding: 16, borderRadius: 12, marginTop: 32 },
  btnDisabled: { backgroundColor: '#94A3B8' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});