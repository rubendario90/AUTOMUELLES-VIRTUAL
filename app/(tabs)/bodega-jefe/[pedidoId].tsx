import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PEDIDO_ESTADOS, PEDIDO_ESTADOS_LABEL } from "@/src/features/pedidos/constants";
import { pedidosService } from "@/src/features/pedidos/pedidos-service";
import { EstadoPedido, Pedido } from "@/src/features/pedidos/types";

export default function PedidoDetailScreen() {
  const { pedidoId } = useLocalSearchParams<{ pedidoId: string }>();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [cliente, setCliente] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPedido = async () => {
    try {
      const data = await pedidosService.getById(pedidoId);
      setPedido(data);
      setCliente(data.cliente);
      setDescripcion(data.descripcion);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible cargar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPedido();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId]);

  const onSave = async () => {
    if (!pedido) return;
    setSaving(true);
    try {
      const updated = await pedidosService.update(pedido.id, {
        cliente: cliente.trim(),
        descripcion: descripcion.trim(),
      });
      setPedido(updated);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible actualizar el pedido.");
    } finally {
      setSaving(false);
    }
  };

  const onChangeStatus = async (estado: EstadoPedido) => {
    if (!pedido || pedido.estado === estado) return;
    setSaving(true);
    try {
      const updated = await pedidosService.updateStatus(pedido.id, estado);
      setPedido(updated);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible actualizar el estado.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!pedido) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No se encontró el pedido.</ThemedText>
        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText type="subtitle">Pedido #{pedido.id}</ThemedText>
      <ThemedText>Estado actual: {PEDIDO_ESTADOS_LABEL[pedido.estado]}</ThemedText>

      <ThemedView style={styles.field}>
        <ThemedText>Cliente</ThemedText>
        <TextInput style={styles.input} value={cliente} onChangeText={setCliente} />
      </ThemedView>
      <ThemedView style={styles.field}>
        <ThemedText>Descripción</ThemedText>
        <TextInput style={[styles.input, styles.multiline]} value={descripcion} onChangeText={setDescripcion} multiline />
      </ThemedView>

      <Pressable style={styles.button} onPress={onSave} disabled={saving}>
        <ThemedText type="defaultSemiBold">{saving ? "Guardando..." : "Guardar cambios"}</ThemedText>
      </Pressable>

      <View style={styles.statusContainer}>
        <ThemedText type="defaultSemiBold">Cambiar estado</ThemedText>
        <View style={styles.statusButtons}>
          {PEDIDO_ESTADOS.map((estado) => (
            <Pressable
              key={estado}
              onPress={() => onChangeStatus(estado)}
              disabled={saving}
              style={[styles.statusButton, estado === pedido.estado && styles.statusButtonActive]}>
              <ThemedText>{PEDIDO_ESTADOS_LABEL[estado]}</ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    gap: 14,
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  field: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  button: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  statusContainer: {
    gap: 8,
  },
  statusButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusButtonActive: {
    borderColor: "#0a7ea4",
  },
  error: {
    color: "#b00020",
  },
});
