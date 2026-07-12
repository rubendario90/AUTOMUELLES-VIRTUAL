import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ESTO ES LO QUE TE FALTA (export default):
export default function BodegaDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Bodega</Text>
      <Text>Bienvenido a tu inventario.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  }
});