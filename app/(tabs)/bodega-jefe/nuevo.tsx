import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { pedidosService } from "@/src/features/pedidos/pedidos-service";

export default function NuevoPedidoScreen() {
  const [cliente, setCliente] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!cliente.trim() || !descripcion.trim()) {
      setError("Cliente y descripción son obligatorios.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const pedido = await pedidosService.create({
        cliente: cliente.trim(),
        descripcion: descripcion.trim(),
      });
      router.replace(`/(tabs)/bodega-jefe/${pedido.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible crear el pedido.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText type="subtitle">Registrar pedido</ThemedText>
      <ThemedView style={styles.field}>
        <ThemedText>Cliente</ThemedText>
        <TextInput style={styles.input} value={cliente} onChangeText={setCliente} placeholder="Nombre del cliente" />
      </ThemedView>
      <ThemedView style={styles.field}>
        <ThemedText>Descripción</ThemedText>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Detalle de los productos o solicitud"
          multiline
        />
      </ThemedView>
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      <Pressable style={styles.button} onPress={onSubmit} disabled={saving}>
        <ThemedText type="defaultSemiBold">{saving ? "Guardando..." : "Guardar pedido"}</ThemedText>
      </Pressable>
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
  error: {
    color: "#b00020",
  },
});
