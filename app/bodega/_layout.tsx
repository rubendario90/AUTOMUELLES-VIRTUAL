import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function BodegaLayout() {
  const colorScheme = useColorScheme();

  const headerStyle = {
    backgroundColor: colorScheme === 'dark' ? '#151718' : '#0D5395',
  };
  const headerTintColor = '#ffffff';

  return (
    <Stack screenOptions={{ headerStyle, headerTintColor, headerTitleStyle: { fontWeight: '700' } }}>
      {/* Auth — sin header */}
      <Stack.Screen name="login"                options={{ headerShown: false }} />
      <Stack.Screen name="register"             options={{ headerShown: false }} />
      <Stack.Screen name="registration-success" options={{ headerShown: false }} />

      {/* Dashboard principal */}
      <Stack.Screen name="index" options={{ title: 'Control de Bodega', headerBackVisible: false }} />

      {/* Módulo operativo */}
      <Stack.Screen name="facturas-pendientes"  options={{ title: 'Facturas Pendientes' }} />
      <Stack.Screen name="gestionar-factura"    options={{ title: 'Gestionar Factura' }} />
      <Stack.Screen name="revision-final"       options={{ title: 'Revisión Final' }} />
      <Stack.Screen name="pedidos-parciales"    options={{ title: 'Pedidos Parciales' }} />
      <Stack.Screen name="historial"            options={{ title: 'Historial de Facturas' }} />

      {/* Módulo Jefe de Bodega */}
      <Stack.Screen name="reasignar-factura"    options={{ title: 'Reasignar Factura' }} />
      <Stack.Screen name="admin"                options={{ title: 'Administración' }} />
      <Stack.Screen name="notas"                options={{ title: 'Gestión de Notas' }} />
    </Stack>
  );
}