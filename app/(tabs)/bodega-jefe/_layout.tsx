import { Stack } from "expo-router";

export default function BodegaJefeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Pedidos" }} />
      <Stack.Screen name="nuevo" options={{ title: "Nuevo pedido" }} />
      <Stack.Screen name="[pedidoId]" options={{ title: "Detalle de pedido" }} />
    </Stack>
  );
}
