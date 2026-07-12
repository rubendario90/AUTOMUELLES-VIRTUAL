import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function BodegaLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        // Esto le da estilo a la barra superior (header) de la bodega
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#151718' : '#ffffff',
        },
        headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
      }}
    >
      {/* Pantalla de Login sin barra superior */}

      <Stack.Screen 
        name="login" 
        options={{ headerShown: false }} 
      />

       <Stack.Screen 
        name="register" 
        options={{ headerShown: false }} 
      />
      
       <Stack.Screen 
        name="registration-success" 
        options={{ headerShown: false }} 
      />
      {/* Esta es la pantalla principal del panel de bodega */}
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Control de Bodega',
          headerBackVisible: false // Evita que al hacer "atrás" regresen al login
        }} 
      />

      {/* Si luego creas un archivo app/(bodega)/inventario.tsx, lo agregas aquí: */}
      {/* <Stack.Screen name="inventario" options={{ title: 'Mi Inventario' }} /> */}
    </Stack>
  );
}