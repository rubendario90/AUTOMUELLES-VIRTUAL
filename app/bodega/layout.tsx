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
      {/* Esta es la pantalla principal de la bodega (index.tsx) */}
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Dashboard Bodega',
          headerShown: true // Cámbialo a false si no quieres la barra superior
        }} 
      />
      
      {/* Si luego creas un archivo app/(bodega)/inventario.tsx, lo agregas aquí: */}
      {/* <Stack.Screen name="inventario" options={{ title: 'Mi Inventario' }} /> */}
    </Stack>
  );
}