import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  // Inicializamos el valor de opacidad en 0 (invisible)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    // Iniciamos la animación de aparición (fade-in)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500, // Duración en milisegundos (1.5 segundos)
      useNativeDriver: true, // Mejora el rendimiento usando el motor nativo
    }).start(() => {
      // Opcional: Aquí puedes agregar lógica para navegar a otra pantalla
      // después de que termine la animación, por ejemplo:
      // setTimeout(() => router.replace('/dashboard'), 1000);
    });
  }, [fadeAnim, router]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Image
          source={require('@/assets/images/logo.png')} // Reemplaza con tu logo
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.title}>Automuelles Diesel</Text>
        <Text style={styles.subtitle}>Gestión y Logística</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    letterSpacing: 0.2,
  },
});