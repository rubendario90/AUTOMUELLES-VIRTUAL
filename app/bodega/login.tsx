import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function BodegaLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Lee la URL de tu backend automáticamente desde el archivo .env activo (.env.development, .env.qa, etc.)
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const handleSignIn = async () => {
    // 1. Validar que los campos no estén vacíos
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    try {
      setLoading(true);
      
      // 2. Hacer la petición POST a tu backend de Laravel
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      // 3. Manejar errores si el backend responde con error (ej. 401 Unauthorized)
      if (!response.ok) {
        throw new Error(data.message || 'Credenciales incorrectas o error en el servidor.');
      }

      // 4. Si el login es exitoso, guardar el Token y el Rol de manera segura
      if (data.token) {
        await SecureStore.setItemAsync('userToken', data.token);
      }
      
      if (data.user && data.user.role_id) {
        await SecureStore.setItemAsync('userRole', data.user.role_id.toString());
      }

      // 5. Redirigir al panel principal de la bodega
      // Nota: Asegúrate de usar los paréntesis si la carpeta los tiene
     router.replace('./bodega/index');  

    } catch (error: any) {
      Alert.alert('Error de Autenticación', error.message || 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Acceso al área de Bodega</Text>
        <Text style={styles.subHeaderText}>Ingresa tus credenciales autorizadas de Bodega.</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.labelText}>Correo Electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="usuario@automuelles.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading} // Deshabilita el input mientras carga
        />

        <Text style={styles.labelText}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading} // Deshabilita el input mientras carga
        />

        <View style={styles.rememberContainer}>
          <Switch value={rememberMe} onValueChange={setRememberMe} disabled={loading} />
          <Text style={styles.rememberText}>Recordar sesión</Text>
        </View>

        <TouchableOpacity 
          style={[styles.signInButton, loading && styles.signInButtonDisabled]} 
          onPress={handleSignIn}
          disabled={loading} // Evita múltiples clics
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signInButtonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        {/* --- SECCIÓN DE REGISTRO --- */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/bodega/register')} disabled={loading}>
            <Text style={styles.registerLink}>Regístrate aquí</Text>
          </TouchableOpacity>
        </View>
        {/* --------------------------------- */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 40, backgroundColor: '#0F172A', alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingTop: 80 },
  headerText: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subHeaderText: { color: '#94A3B8', fontSize: 14, textAlign: 'center' },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  labelText: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 6, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', padding: 14, borderRadius: 10, fontSize: 16, backgroundColor: '#F8FAFC' },
  rememberContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  rememberText: { marginLeft: 8, color: '#64748B' },
  signInButton: { backgroundColor: '#0F172A', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30, minHeight: 55, justifyContent: 'center' },
  signInButtonDisabled: { backgroundColor: '#475569' }, // Color más claro cuando está cargando
  signInButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  registerText: { color: '#64748B', fontSize: 14 },
  registerLink: { color: '#0F172A', fontSize: 14, fontWeight: 'bold' },
});