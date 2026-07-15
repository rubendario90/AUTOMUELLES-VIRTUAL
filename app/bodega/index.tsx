import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function BodegaDashboard() {
  // Datos simulados (luego los traeremos de Laravel)
  const userName = "ruben dario bayona"; 
  const currentDate = "Mar. 14 Jul";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* --- HEADER CURVO --- */}
        <View style={styles.headerBackground}>
          
          {/* Fecha y Notificación */}
          <View style={styles.topRow}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{currentDate}</Text>
              <View style={styles.notificationBadge}>
                <Ionicons name="notifications-outline" size={12} color="#3f3f3f" />
                <Text style={styles.notificationText}>1</Text>
              </View>
            </View>
            
            {/* Botones de Acción (Buscar y Perfil) */}
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="search" size={20} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileButton}>
                <Ionicons name="person" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Saludo */}
          <Text style={styles.greetingText}>¡Hola, {userName}!</Text>

          {/* Tarjeta Principal Flotante (Estado de Bodega) */}
          <View style={styles.mainCard}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>100</Text>
              <Text style={styles.scoreSymbol}>%</Text>
            </View>
            
            <View style={styles.mainCardTextContainer}>
              <Text style={styles.mainCardTitle}>Estado Óptimo</Text>
              <View style={styles.statusRow}>
                <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                <Text style={styles.statusText}>Bodega Activa</Text>
                <Text style={styles.dot}>•</Text>
                <Ionicons name="cube-outline" size={14} color="#666" />
                <Text style={styles.statusText}>Turno Mañana</Text>
              </View>
            </View>
            
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </View>
        </View>

        {/* --- SECCIÓN DE MÉTRICAS --- */}
        <View style={styles.metricsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Métricas de Inventario</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todo</Text>
            </TouchableOpacity>
          </View>

          {/* Grid de Tarjetas Pequeñas */}
          <View style={styles.gridContainer}>
            
            {/* Tarjeta 1: Entradas */}
            <TouchableOpacity style={styles.metricCard}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFE4E1' }]}>
                <MaterialCommunityIcons name="tray-arrow-down" size={24} color="#FF6B6B" />
              </View>
              <Text style={styles.metricValue}>124</Text>
              <Text style={styles.metricLabel}>Entradas Hoy</Text>
            </TouchableOpacity>

            {/* Tarjeta 2: Salidas */}
            <TouchableOpacity style={styles.metricCard}>
              <View style={[styles.iconContainer, { backgroundColor: '#E6E6FA' }]}>
                <MaterialCommunityIcons name="tray-arrow-up" size={24} color="#6B5B95" />
              </View>
              <Text style={styles.metricValue}>89</Text>
              <Text style={styles.metricLabel}>Despachos</Text>
            </TouchableOpacity>

            {/* Tarjeta 3: Pendientes */}
            <TouchableOpacity style={styles.metricCard}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFF0F5' }]}>
                <MaterialCommunityIcons name="clipboard-text-clock-outline" size={24} color="#D2691E" />
              </View>
              <Text style={styles.metricValue}>15</Text>
              <Text style={styles.metricLabel}>Órdenes Pendientes</Text>
            </TouchableOpacity>

            {/* Tarjeta 4: Bajo Stock */}
            <TouchableOpacity style={styles.metricCard}>
              <View style={[styles.iconContainer, { backgroundColor: '#F0FFF0' }]}>
                <Ionicons name="warning-outline" size={24} color="#2E8B57" />
              </View>
              <Text style={styles.metricValue}>7</Text>
              <Text style={styles.metricLabel}>Items Bajo Stock</Text>
            </TouchableOpacity>

          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF9F6', // Color hueso/arena claro para el fondo general
  },
  container: {
    flex: 1,
  },
  headerBackground: {
    backgroundColor: '#8B5A3C', // Marrón cálido similar a la imagen
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingHorizontal: 20,
    paddingBottom: 60, // Espacio extra para que la tarjeta flote
    marginBottom: 40, // Empuja el contenido de abajo para hacer espacio a la tarjeta
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#E8DCC4',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 10,
  },
  notificationBadge: {
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8B5A3C',
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    backgroundColor: '#FFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    backgroundColor: '#A0522D',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  greetingText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  mainCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: -35, // Hace que la tarjeta sobresalga del fondo marrón
    left: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // Sombra en Android
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    borderWidth: 3,
    borderColor: '#D3E4CD',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#556B2F',
  },
  scoreSymbol: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#556B2F',
    marginTop: 4,
  },
  mainCardTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  mainCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  dot: {
    marginHorizontal: 6,
    color: '#CCC',
  },
  metricsSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#8B5A3C',
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#FFF',
    width: '47%', // Permite que entren dos tarjetas por fila con espacio en medio
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888',
  },
});