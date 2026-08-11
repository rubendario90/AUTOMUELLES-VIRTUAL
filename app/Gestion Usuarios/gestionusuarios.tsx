import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const COLORS = {
  bg_navy: 'rgba(13, 83, 149, 0.8)',
  white: '#FFFFFF',
  text_primary: '#212121',
  accent_yellow: '#FFC107',
  gray_border: '#E0E0E0',
  danger: '#DC3545'
};

// --- CONFIGURACIÓN GLOBAL (Fuera del componente para mejor rendimiento) ---
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const BASE_URL = API_URL?.replace('/api', '');

const fetchHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

export default function GestionUsuarios() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  
  // Estados de Modales
  const [modalContrasena, setModalContrasena] = useState(false);
  const [modalRol, setModalRol] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);

  // Estados de Formulario
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [processing, setProcessing] = useState(false);

  // --- CARGAR DATOS (GET) ---
  useEffect(() => {
    // Se declara la función adentro del useEffect para evitar el warning
    const fetchUsersAndRoles = async () => {
      try {
        const resUsers = await fetch(`${API_URL}/usuarios`, { headers: fetchHeaders });
        const usersData = await resUsers.json();
        if (resUsers.ok) setUsers(usersData);

        const resRoles = await fetch(`${API_URL}/roles`, { headers: fetchHeaders });
        const rolesData = await resRoles.json();
        if (resRoles.ok) setRoles(rolesData);
        
      } catch (error) {
        console.log("Error cargando datos:", error);
      }
    };

    if (modalContrasena || modalRol || modalEliminar) {
      fetchUsersAndRoles();
    }
  }, [modalContrasena, modalRol, modalEliminar]);

  // --- LÓGICA DE CONTRASEÑA (PUT) ---
  const handlePasswordSubmit = async () => {
    if (!selectedUser || !password) return Alert.alert('Error', 'Completa los campos');
    setProcessing(true);
    
    try {
      // Petición CSRF (Sanctum)
      await fetch(`${BASE_URL}/sanctum/csrf-cookie`, { headers: fetchHeaders });
      
      const response = await fetch(`${API_URL}/user/force-password`, {
        method: 'PUT',
        headers: fetchHeaders,
        body: JSON.stringify({
          user_id: selectedUser,
          password: password,
          password_confirmation: passwordConfirmation,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo actualizar la contraseña.');
      }

      Alert.alert('Éxito', 'Contraseña actualizada correctamente.');
      setModalContrasena(false);
      setPassword('');
      setPasswordConfirmation('');
      setSelectedUser('');

    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.log('Error Password:', error);
    } finally {
      setProcessing(false);
    }
  };

  // --- LÓGICA DE ROL (PUT) ---
  const handleChangeRole = async () => {
    if (!selectedUser || !selectedRole) return Alert.alert('Error', 'Selecciona usuario y rol');
    setProcessing(true);
    
    try {
      const response = await fetch(`${API_URL}/cambio-rol`, {
        method: 'PUT',
        headers: fetchHeaders,
        body: JSON.stringify({
          user_id: selectedUser,
          role_id: selectedRole,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo actualizar el rol.');
      }

      Alert.alert('Éxito', 'Rol actualizado correctamente.');
      setModalRol(false);
      setSelectedUser('');
      setSelectedRole('');

    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.log('Error Rol:', error);
    } finally {
      setProcessing(false);
    }
  };

  // --- LÓGICA DE ELIMINAR (DELETE) ---
  const handleEliminar = async () => {
    if (!selectedUser) return Alert.alert('Error', 'Selecciona un usuario');
    setProcessing(true);
    
    try {
      const response = await fetch(`${API_URL}/usuarios/${selectedUser}`, {
        method: 'DELETE',
        headers: fetchHeaders
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = {}; 
      }

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo eliminar el usuario.');
      }

      Alert.alert('Éxito', 'Usuario eliminado correctamente.');
      setModalEliminar(false);
      setSelectedUser('');

    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.log('Error Eliminar:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Área Administrativa</Text>
        <Text style={styles.subtitle}>Gestión de Usuarios</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.actionCard} onPress={() => setModalContrasena(true)}>
          <MaterialCommunityIcons name="lock-reset" size={32} color={COLORS.bg_navy} />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Cambiar Contraseña</Text>
            <Text style={styles.cardDesc}>Forzar el cambio de contraseña de un usuario.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => setModalRol(true)}>
          <MaterialCommunityIcons name="account-switch" size={32} color={COLORS.bg_navy} />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Cambiar Rol</Text>
            <Text style={styles.cardDesc}>Modificar los permisos de un usuario existente.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionCard, { borderLeftColor: COLORS.danger, borderLeftWidth: 4 }]} onPress={() => setModalEliminar(true)}>
          <MaterialCommunityIcons name="account-remove" size={32} color={COLORS.danger} />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Eliminar Usuario</Text>
            <Text style={styles.cardDesc}>Borrar permanentemente una cuenta del sistema.</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* --- MODAL CONTRASEÑA --- */}
      <Modal visible={modalContrasena} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
            
            <Text style={styles.label}>Usuario:</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={selectedUser} onValueChange={(itemValue) => setSelectedUser(itemValue)}>
                <Picker.Item label="-- Seleccione --" value="" />
                {users.map((u: any) => <Picker.Item key={u.id} label={`${u.name} (${u.email})`} value={u.id} />)}
              </Picker>
            </View>

            <Text style={styles.label}>Nueva Contraseña:</Text>
            <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

            <Text style={styles.label}>Confirmar Contraseña:</Text>
            <TextInput style={styles.input} secureTextEntry value={passwordConfirmation} onChangeText={setPasswordConfirmation} />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalContrasena(false)}>
                <Text style={styles.btnTextDark}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSubmit} onPress={handlePasswordSubmit} disabled={processing}>
                {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTextLight}>Actualizar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL ROL --- */}
      <Modal visible={modalRol} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar Rol</Text>
            
            <Text style={styles.label}>Usuario:</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={selectedUser} onValueChange={(itemValue) => setSelectedUser(itemValue)}>
                <Picker.Item label="-- Seleccione --" value="" />
                {users.map((u: any) => <Picker.Item key={u.id} label={u.name} value={u.id} />)}
              </Picker>
            </View>

            <Text style={styles.label}>Nuevo Rol:</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={selectedRole} onValueChange={(itemValue) => setSelectedRole(itemValue)}>
                <Picker.Item label="-- Seleccione --" value="" />
                {roles.map((r: any) => <Picker.Item key={r.id} label={r.name} value={r.id} />)}
              </Picker>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalRol(false)}>
                <Text style={styles.btnTextDark}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSubmit} onPress={handleChangeRole} disabled={processing}>
                {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTextLight}>Actualizar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL ELIMINAR --- */}
      <Modal visible={modalEliminar} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Eliminar Usuario</Text>
            
            <Text style={styles.label}>Seleccione el usuario a eliminar:</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={selectedUser} onValueChange={(itemValue) => setSelectedUser(itemValue)}>
                <Picker.Item label="-- Seleccione --" value="" />
                {users.map((u: any) => <Picker.Item key={u.id} label={`${u.name} (${u.email})`} value={u.id} />)}
              </Picker>
            </View>

            <Text style={styles.warningText}>¿Está seguro que desea eliminar este usuario de forma permanente?</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalEliminar(false)}>
                <Text style={styles.btnTextDark}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnSubmit, { backgroundColor: COLORS.danger }]} onPress={handleEliminar} disabled={processing}>
                {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTextLight}>Eliminar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, backgroundColor: COLORS.bg_navy },
  title: { color: COLORS.white, fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: COLORS.accent_yellow, fontSize: 16, marginTop: 5 },
  container: { padding: 20 },
  actionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardTextContainer: { marginLeft: 15, flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text_primary, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#757575' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: COLORS.white, width: '90%', borderRadius: 15, padding: 20, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: COLORS.bg_navy },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: COLORS.text_primary, marginTop: 10 },
  input: { borderWidth: 1, borderColor: COLORS.gray_border, borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#F9F9F9' },
  pickerContainer: { borderWidth: 1, borderColor: COLORS.gray_border, borderRadius: 8, backgroundColor: '#F9F9F9', marginBottom: 10 },
  warningText: { color: COLORS.danger, marginTop: 15, fontWeight: '500', textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 25 },
  btnCancel: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginRight: 10, backgroundColor: COLORS.gray_border },
  btnSubmit: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: COLORS.bg_navy, minWidth: 100, alignItems: 'center' },
  btnTextDark: { color: COLORS.text_primary, fontWeight: 'bold' },
  btnTextLight: { color: COLORS.white, fontWeight: 'bold' }
});