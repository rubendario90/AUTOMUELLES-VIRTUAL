import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Necesario para leer los datos guardados

// --- PALETA DE COLORES ---
const COLORS = {
  bg_navy: 'rgba(13, 83, 149, 0.8)', 
  white: '#FFFFFF',                    
  text_primary: '#212121',             
  text_secondary: '#757575',           
  accent_yellow: '#FFC107',            
  gray_border: '#E0E0E0',               
  bg_breadcrumb: 'rgba(255, 255, 255, 0.1)' 
};

// Interface para tipar los datos del usuario
interface UserData {
  id: number;
  name: string;
  email: string;
}

export default function Usuarios() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // --- CARGA DINÁMICA DE DATOS ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Buscamos los datos del usuario que debiste guardar en el login
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Pantalla de carga mientras lee los datos
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.accent_yellow} />
      </SafeAreaView>
    );
  }

  // Si por alguna razón no hay datos (ej. token expirado o no guardado)
  if (!user) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
        <Text style={{ color: COLORS.white }}>No se encontró información del usuario.</Text>
      </SafeAreaView>
    );
  }
  
  // Capitalizamos el nombre dinámicamente
  const capitalizedName = user.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      
      {/* Breadcrumb Section */}
      <View style={styles.breadcrumbContainer}>
        <Text style={styles.breadcrumb}>
          Mi Cuenta / <Text style={styles.breadcrumbActive}>Perfil</Text>
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Sección de Encabezado / Avatar */}
        <View style={styles.headerSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: `https://ui-avatars.com/api/?name=${capitalizedName.replace(' ', '+')}&background=0A3D73&color=fff&size=128&bold=true` }} 
              style={styles.avatar} 
            />
            <MaterialCommunityIcons name="check-decagram" size={28} color={COLORS.accent_yellow} style={styles.badge} />
          </View>
          <Text style={styles.nameText}>{capitalizedName}</Text>
          <Text style={styles.emailText}>{user.email}</Text>
        </View>

        {/* Tarjeta de Detalles Personales */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account-details-outline" size={20} color={COLORS.bg_navy} style={styles.cardHeaderIcon} />
            <Text style={styles.cardTitle}>Detalles Personales</Text>
          </View>

          {/* SOLO SE MUESTRAN NOMBRE, ID Y CORREO */}
          <DetailRow label="Nombre completo:" value={capitalizedName} icon="account" />
          <DetailRow label="Correo electrónico:" value={user.email} icon="email" isLast />
          
        </View>

        <View style={styles.supportSection}>
            <MaterialCommunityIcons name="information-outline" size={18} color={COLORS.white} />
            <Text style={styles.supportText}>Si necesitas cambiar datos, contacta a soporte.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-componente para generar las filas de información dinámicamente
const DetailRow = ({ label, value, icon, isLast = false }: { label: string, value: string, icon: keyof typeof MaterialCommunityIcons.glyphMap, isLast?: boolean }) => (
  <View style={[styles.row, !isLast && styles.rowBorder]}>
    <View style={styles.rowLabelContainer}>
        <MaterialCommunityIcons name={icon} size={18} color={COLORS.bg_navy} style={styles.rowIcon} />
        <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
  </View>
);

// Estilos de la pantalla
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg_navy, 
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  breadcrumbContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray_border,
    backgroundColor: COLORS.bg_breadcrumb
  },
  breadcrumb: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  breadcrumbActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center', 
    marginBottom: 35,
    marginTop: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  badge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: COLORS.white, 
    borderRadius: 14,
    padding: 1,
    overflow: 'hidden'
  },
  nameText: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emailText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    fontWeight: '500'
  },
  card: {
    backgroundColor: COLORS.white, 
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  cardHeader: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray_border,
    backgroundColor: '#F8F9FA', 
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderIcon: {
    marginRight: 10,
  },
  cardTitle: {
    color: COLORS.bg_navy,
    fontSize: 17,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray_border,
  },
  rowLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  rowIcon: {
    marginRight: 10,
    opacity: 0.8,
  },
  rowLabel: {
    color: COLORS.text_secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  rowValue: {
    color: COLORS.text_primary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right', 
  },
  supportSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  supportText: {
    color: COLORS.white,
    fontSize: 13,
    marginLeft: 8,
    fontWeight: '500',
  }
});