import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

const successUri = 'https://cdn-icons-png.flaticon.com/512/845/845646.png'; // Icono de éxito

export default function RegistrationSuccessScreen() {
  const router = useRouter();

  const handleBrowseHome = () => {
    router.replace('/(tabs)'); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={{ uri: successUri }} style={styles.successIcon} contentFit="contain" />
        <Text style={styles.successTitle}>Successful!</Text>
        <Text style={styles.successMessage}>
          Your account is created successfully and ready now.
        </Text>
        <TouchableOpacity style={styles.browseHomeButton} onPress={handleBrowseHome}>
          <Text style={styles.browseHomeButtonText}>Browse Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    // Sombra para un efecto elevado
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  successIcon: {
    width: 80,
    height: 80,
    marginBottom: 20,
    tintColor: '#28A745', // Color verde para el icono de éxito
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 30,
  },
  browseHomeButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  browseHomeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});