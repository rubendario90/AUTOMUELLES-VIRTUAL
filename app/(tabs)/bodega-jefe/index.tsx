import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet } from "react-native";
import { Link } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { APP_ROLE } from "@/src/config/env";
import { PEDIDO_ESTADOS_LABEL } from "@/src/features/pedidos/constants";
import { pedidosService } from "@/src/features/pedidos/pedidos-service";
import { Pedido } from "@/src/features/pedidos/types";

const ALLOWED_ROLES = new Set(["BODEGA_JEFE", "ADMIN"]);

export default function BodegaJefePedidosScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAccess = ALLOWED_ROLES.has(APP_ROLE);

  const loadPedidos = async () => {
    try {
      setError(null);
      const data = await pedidosService.list();
      setPedidos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible cargar los pedidos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }
    loadPedidos();
  }, [canAccess]);

  if (!canAccess) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Acceso restringido</ThemedText>
        <ThemedText>Este módulo está disponible solo para el rol Bodega Jefe.</ThemedText>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadPedidos();
          }}
        />
      }>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Gestión de pedidos</ThemedText>
        <Link href="/(tabs)/bodega-jefe/nuevo" asChild>
          <Pressable style={styles.button}>
            <ThemedText type="defaultSemiBold">Crear pedido</ThemedText>
          </Pressable>
        </Link>
      </ThemedView>

      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

      {!pedidos.length && !error ? (
        <ThemedText>No hay pedidos registrados.</ThemedText>
      ) : (
        pedidos.map((pedido) => (
          <Link key={pedido.id} href={`/(tabs)/bodega-jefe/${pedido.id}`} asChild>
            <Pressable style={styles.card}>
              <ThemedText type="defaultSemiBold">#{pedido.id}</ThemedText>
              <ThemedText>{pedido.cliente}</ThemedText>
              <ThemedText>{pedido.descripcion}</ThemedText>
              <ThemedText>Estado: {PEDIDO_ESTADOS_LABEL[pedido.estado]}</ThemedText>
            </Pressable>
          </Link>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    gap: 12,
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    gap: 8,
  },
  button: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  error: {
    color: "#b00020",
  },
});
