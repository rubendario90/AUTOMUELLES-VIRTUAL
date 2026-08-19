import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import {
  getUsuarios, getRoles, cambiarRol, eliminarUsuario,
  cambiarContrasena, actualizarUsuario,
  type UserBasic, type Role,
} from './services/bodega.service';

type ModalType = 'password' | 'delete' | 'role' | 'edit' | null;

export default function AdminBodegaScreen() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const adminActions = [
    { label: 'Cambiar Contraseña', icon: 'key-outline',         modal: 'password' as ModalType },
    { label: 'Eliminar Usuario',   icon: 'trash-outline',       modal: 'delete'   as ModalType },
    { label: 'Cambiar Rol',        icon: 'shield-outline',      modal: 'role'     as ModalType },
    { label: 'Editar Usuario',     icon: 'create-outline',      modal: 'edit'     as ModalType },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Gestión de Usuarios</Text>
        <View style={styles.grid}>
          {adminActions.map((action) => (
            <TouchableOpacity
              key={action.modal}
              style={styles.chip}
              onPress={() => setActiveModal(action.modal)}
            >
              <Ionicons name={action.icon as any} size={22} color="rgba(13,83,149,0.85)" />
              <Text style={styles.chipText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ModalCambiarContrasena visible={activeModal === 'password'} onClose={() => setActiveModal(null)} />
      <ModalEliminarUsuario   visible={activeModal === 'delete'}   onClose={() => setActiveModal(null)} />
      <ModalCambiarRol        visible={activeModal === 'role'}     onClose={() => setActiveModal(null)} />
      <ModalEditarUsuario     visible={activeModal === 'edit'}     onClose={() => setActiveModal(null)} />
    </SafeAreaView>
  );
}

// ── Hook compartido ────────────────────────────────────────────────────────────
function useUsuarios(trigger: boolean) {
  const [users, setUsers] = useState<UserBasic[]>([]);
  useEffect(() => {
    if (trigger) getUsuarios().then(setUsers).catch(() => setUsers([]));
  }, [trigger]);
  return users;
}

// ── Modal: Cambiar Contraseña ──────────────────────────────────────────────────
function ModalCambiarContrasena({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const users = useUsuarios(visible);
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => { setSelectedUser(''); setPassword(''); setConfirm(''); };

  const handleSubmit = async () => {
    if (password.length < 8) { Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres.'); return; }
    if (password !== confirm) { Alert.alert('Error', 'Las contraseñas no coinciden.'); return; }
    setSaving(true);
    try {
      await cambiarContrasena(selectedUser, password, confirm);
      Alert.alert('✅ Éxito', 'Contraseña actualizada correctamente.');
      reset(); onClose();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo actualizar la contraseña.');
    } finally { setSaving(false); }
  };

  return (
    <ModalShell visible={visible} title="Cambiar Contraseña" icon="key-outline" onClose={() => { reset(); onClose(); }}>
      <UserPickerField users={users} value={selectedUser} onChange={setSelectedUser} />
      <FormField label="Nueva contraseña" value={password} onChangeText={setPassword} secureTextEntry />
      <FormField label="Confirmar contraseña" value={confirm} onChangeText={setConfirm} secureTextEntry />
      <ModalFooter onCancel={() => { reset(); onClose(); }} onConfirm={handleSubmit}
        label={saving ? 'Guardando...' : 'Actualizar'} disabled={saving || !selectedUser || !password || !confirm} />
    </ModalShell>
  );
}

// ── Modal: Eliminar Usuario ────────────────────────────────────────────────────
function ModalEliminarUsuario({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const users = useUsuarios(visible);
  const [selectedUser, setSelectedUser] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEliminar = () => {
    if (!selectedUser) return;
    Alert.alert('⚠️ Confirmar', '¿Desea eliminar este usuario? Esta acción es irreversible.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          setSaving(true);
          try {
            await eliminarUsuario(selectedUser);
            Alert.alert('✅ Éxito', 'Usuario eliminado correctamente.');
            setSelectedUser(''); onClose();
          } catch { Alert.alert('Error', 'No se pudo eliminar el usuario.'); }
          finally { setSaving(false); }
        },
      },
    ]);
  };

  return (
    <ModalShell visible={visible} title="Eliminar Usuario" icon="trash-outline" onClose={() => { setSelectedUser(''); onClose(); }}>
      <UserPickerField users={users} value={selectedUser} onChange={setSelectedUser} />
      <ModalFooter onCancel={() => { setSelectedUser(''); onClose(); }} onConfirm={handleEliminar}
        label={saving ? 'Eliminando...' : 'Eliminar'} danger disabled={saving || !selectedUser} />
    </ModalShell>
  );
}

// ── Modal: Cambiar Rol ─────────────────────────────────────────────────────────
function ModalCambiarRol({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const users = useUsuarios(visible);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) getRoles().then(setRoles).catch(() => {});
  }, [visible]);

  useEffect(() => {
    if (selectedUser) {
      const u = users.find((u) => String(u.id) === selectedUser);
      setSelectedRole(u ? String(u.role_id) : '');
    } else setSelectedRole('');
  }, [selectedUser, users]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await cambiarRol(selectedUser, selectedRole);
      Alert.alert('✅ Éxito', 'Rol actualizado correctamente.');
      setSelectedUser(''); setSelectedRole(''); onClose();
    } catch { Alert.alert('Error', 'No se pudo actualizar el rol.'); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell visible={visible} title="Cambiar Rol" icon="shield-outline" onClose={() => { setSelectedUser(''); onClose(); }}>
      <UserPickerField users={users} value={selectedUser} onChange={setSelectedUser} />
      <Text style={mStyles.label}>Rol</Text>
      <View style={mStyles.pickerBox}>
        <Picker selectedValue={selectedRole} onValueChange={setSelectedRole} enabled={!!selectedUser}>
          <Picker.Item label="— Seleccione —" value="" color="#94A3B8" />
          {roles.map((r) => <Picker.Item key={r.id} label={r.name} value={String(r.id)} />)}
        </Picker>
      </View>
      <ModalFooter onCancel={() => { setSelectedUser(''); onClose(); }} onConfirm={handleSubmit}
        label={saving ? 'Guardando...' : 'Actualizar Rol'} disabled={saving || !selectedUser || !selectedRole} />
    </ModalShell>
  );
}

// ── Modal: Editar Usuario ──────────────────────────────────────────────────────
function ModalEditarUsuario({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const users = useUsuarios(visible);
  const [selectedUser, setSelectedUser] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      const u = users.find((u) => String(u.id) === selectedUser);
      if (u) { setName(u.name); setEmail(u.email); }
    } else { setName(''); setEmail(''); }
  }, [selectedUser, users]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await actualizarUsuario(selectedUser, name, email);
      Alert.alert('✅ Éxito', 'Usuario actualizado correctamente.');
      setSelectedUser(''); setName(''); setEmail(''); onClose();
    } catch (e: any) { Alert.alert('Error', e?.message ?? 'No se pudo actualizar el usuario.'); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell visible={visible} title="Editar Usuario" icon="create-outline" onClose={() => { setSelectedUser(''); onClose(); }}>
      <UserPickerField users={users} value={selectedUser} onChange={setSelectedUser} />
      <FormField label="Nombre" value={name} onChangeText={setName} editable={!!selectedUser} />
      <FormField label="Correo electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" editable={!!selectedUser} />
      <ModalFooter onCancel={() => { setSelectedUser(''); onClose(); }} onConfirm={handleSubmit}
        label={saving ? 'Guardando...' : 'Actualizar Usuario'} disabled={saving || !selectedUser} />
    </ModalShell>
  );
}

// ── Componentes compartidos ────────────────────────────────────────────────────
function ModalShell({ visible, title, icon, onClose, children }: {
  visible: boolean; title: string; icon: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={mStyles.overlay}>
        <View style={mStyles.box}>
          <View style={mStyles.titleRow}>
            <Ionicons name={icon as any} size={22} color="rgba(13,83,149,0.85)" />
            <Text style={mStyles.title}>{title}</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function UserPickerField({ users, value, onChange }: { users: UserBasic[]; value: string; onChange: (v: string) => void }) {
  return (
    <>
      <Text style={mStyles.label}>Usuario</Text>
      <View style={mStyles.pickerBox}>
        <Picker selectedValue={value} onValueChange={onChange}>
          <Picker.Item label="— Seleccione —" value="" color="#94A3B8" />
          {users.map((u) => <Picker.Item key={u.id} label={`${u.name} (${u.email})`} value={String(u.id)} />)}
        </Picker>
      </View>
    </>
  );
}

function FormField({ label, ...props }: { label: string; [key: string]: any }) {
  return (
    <>
      <Text style={mStyles.label}>{label}</Text>
      <TextInput
        style={[mStyles.input, props.editable === false && mStyles.inputDisabled]}
        placeholderTextColor="#94A3B8"
        {...props}
      />
    </>
  );
}

function ModalFooter({ onCancel, onConfirm, label, disabled, danger }: {
  onCancel: () => void; onConfirm: () => void; label: string; disabled: boolean; danger?: boolean;
}) {
  return (
    <View style={mStyles.footer}>
      <TouchableOpacity style={mStyles.cancelBtn} onPress={onCancel}>
        <Text style={mStyles.btnText}>Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[mStyles.confirmBtn, danger && mStyles.dangerBtn, disabled && mStyles.disabledBtn]}
        onPress={onConfirm}
        disabled={disabled}
      >
        <Text style={mStyles.btnText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F5F9' },
  container: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 16 },
  grid: { gap: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 14, elevation: 2, gap: 14 },
  chipText: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
});

const mStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  box: { backgroundColor: '#fff', borderRadius: 18, padding: 22, maxHeight: '85%' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  title: { fontSize: 17, fontWeight: '700', color: '#0D5395' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
  pickerBox: { backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', overflow: 'hidden' },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 13, fontSize: 14, color: '#1E293B' },
  inputDisabled: { backgroundColor: '#F1F5F9', color: '#94A3B8' },
  footer: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#64748B', padding: 13, borderRadius: 10 },
  confirmBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13,83,149,0.85)', padding: 13, borderRadius: 10 },
  dangerBtn: { backgroundColor: '#DC2626' },
  disabledBtn: { backgroundColor: '#94A3B8' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});