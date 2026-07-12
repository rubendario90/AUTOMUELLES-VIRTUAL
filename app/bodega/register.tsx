import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, Link } from 'expo-router';

const logoUri = 'https://reactnative.dev/img/header_logo.svg'; // Usa el logo de Automuelles Virtual

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    // Lógica para registrar en la base de datos
    // Enviar name, email, password al backend. El backend debe insertar en la tabla Users y asignar un role_id por defecto (por ejemplo, 'cliente')
    
    // Simulación de registro exitoso (reemplazar con llamada real a API)
    const success = true;

    if (success) {
      if (!agreeTerms) {
        // Manejar error si no se aceptan los términos
        return;
      }
      // Redirigir a una pantalla de éxito o directamente al dashboard
      router.replace('/bodega/registration-success'); 
    } else {
      // Manejar error de registro
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: logoUri }} style={styles.logo} contentFit="contain" />
        <Text style={styles.headerText}>Create your account</Text>
        <Text style={styles.subHeaderText}>
          Provide your full name, email, and password to create your account and get started.
        </Text>
      </View>
      <View style={styles.content}>
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Text>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Text>Apple</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.orText}>or</Text>
        <Text style={styles.labelText}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Ethan Miller"
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.labelText}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="email@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <Text style={styles.labelText}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <View style={styles.agreeTermsContainer}>
          <Switch value={agreeTerms} onValueChange={setAgreeTerms} />
          <Text style={styles.agreeTermsText}>I agree to the Terms & Privacy Policy</Text>
        </View>
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.signInLinkContainer}>
            <Text style={styles.alreadyRegisteredText}>Already have an account? </Text>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

// Estilos inspirados en image_10.png
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subHeaderText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  orText: {
    textAlign: 'center',
    color: '#aaa',
    marginBottom: 15,
  },
  labelText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
  },
  agreeTermsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  agreeTermsText: {
    marginLeft: 5,
    color: '#777',
  },
  signUpButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  alreadyRegisteredText: {
    color: '#777',
  },
  signInLink: {
    color: '#000',
    fontWeight: 'bold',
  },
});