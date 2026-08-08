import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BodegaDashboard() {
  const [userName, setUserName] = useState("Cargando...");
  const [currentDate, setCurrentDate] = useState("");
  const router = useRouter(); // <-- Inicializamos el router

  useEffect(() => {
    // Generar fecha automática
    const setupDate = () => {
      const date = new Date();
      const formatted = date.toLocaleDateString("es-CO", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });

      const capitalizedDate =
        formatted.charAt(0).toUpperCase() + formatted.slice(1);
      setCurrentDate(capitalizedDate);
    };

    // Traer el nombre dependiendo de si es Web o Móvil
    const fetchUserData = async () => {
      try {
        // 1. Buscamos el string guardado
        const storedUserData = await AsyncStorage.getItem("userData");

        if (storedUserData) {
          // 2. Lo convertimos de nuevo a un objeto JSON
          const user = JSON.parse(storedUserData);

          // 3. (Opcional) Capitalizamos el nombre para que diga "Ruben Bayona" en vez de "ruben bayona"
          const capitalizedName = user.name
            .split(" ")
            .map(
              (word: string) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
            )
            .join(" ");

          // 4. Guardamos el nombre en tu estado
          setUserName(capitalizedName);
        } else {
          // Si no hay nada guardado
          setUserName("Usuario Bodega");
        }
      } catch (error) {
        console.error("Error al leer el usuario:", error);
        setUserName("Usuario Bodega"); // Fallback en caso de error
      }
    };

    setupDate();
    fetchUserData();
  }, []);

  // Función genérica para navegar desde las tarjetas
  const handleCardPress = (route) => {
    router.push(route || "/bodega/proximamente");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* --- HEADER CURVO --- */}
        <View style={styles.headerBackground}>
          {/* Fecha y Notificación */}
          <View style={styles.topRow}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{currentDate}</Text>
              <View style={styles.notificationBadge}>
                <Ionicons
                  name="notifications-outline"
                  size={12}
                  color="#3f3f3f"
                />
                <Text style={styles.notificationText}>1</Text>
              </View>
            </View>

            {/* Botones de Acción */}
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="search" size={20} color="#333" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => router.push("/Gestion Usuarios/Usuarios")}
              >
                <Ionicons name="person" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Saludo */}
          <Text style={styles.greetingText}>¡Hola, {userName}!</Text>

          {/* Tarjeta Principal Flotante */}
          <View style={styles.mainCard}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>100</Text>
            </View>

            <View style={styles.mainCardTextContainer}>
              <Text style={styles.mainCardTitle}>Pedidos Pendientes</Text>
              <View style={styles.statusRow}>
                <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                <Text style={styles.statusText}>Bodega Activa</Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </View>
        </View>

        {/* --- SECCIÓN DE SERVICIOS / MÉTRICAS --- */}
        <View style={styles.metricsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Servicios</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todo</Text>
            </TouchableOpacity>
          </View>

          {/* Grid de Tarjetas Estilo "Services" */}
          <View style={styles.gridContainer}>
            {/* Tarjeta 1: Entradas */}
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => handleCardPress("/bodega/default-1")}
            >
              <View style={styles.cardTopRow}>
                <MaterialCommunityIcons
                  name="truck-check-outline"
                  size={28}
                  color="#4DA8DA"
                />
                <View style={styles.arrowCircle}>
                  <MaterialCommunityIcons
                    name="arrow-top-right"
                    size={18}
                    color="#FFF"
                  />
                </View>
              </View>
              <View style={styles.cardBottomRow}>
                <Text style={styles.cardTitle}>Facturas Pendientes</Text>
                <Text style={styles.cardSubtitle}>124 registros</Text>
              </View>
            </TouchableOpacity>

            {/* Tarjeta 2: Salidas */}
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => handleCardPress("/bodega/default-2")}
            >
              <View style={styles.cardTopRow}>
                <MaterialCommunityIcons
                  name="moped-outline"
                  size={28}
                  color="#4CAF50"
                />
                <View style={styles.arrowCircle}>
                  <MaterialCommunityIcons
                    name="arrow-top-right"
                    size={18}
                    color="#FFF"
                  />
                </View>
              </View>
              <View style={styles.cardBottomRow}>
                <Text style={styles.cardTitle}>Revision Final</Text>
                <Text style={styles.cardSubtitle}>89 entregas</Text>
              </View>
            </TouchableOpacity>

            {/* Tarjeta 3: Pendientes */}
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => handleCardPress("/bodega/default-3")}
            >
              <View style={styles.cardTopRow}>
                <MaterialCommunityIcons
                  name="clipboard-clock-outline"
                  size={28}
                  color="#FFB74D"
                />
                <View style={styles.arrowCircle}>
                  <MaterialCommunityIcons
                    name="arrow-top-right"
                    size={18}
                    color="#FFF"
                  />
                </View>
              </View>
              <View style={styles.cardBottomRow}>
                <Text style={styles.cardTitle}>Revision Parcial</Text>
                <Text style={styles.cardSubtitle}>15 órdenes</Text>
              </View>
            </TouchableOpacity>

            {/* Tarjeta 4: Bajo Stock */}
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => handleCardPress("/bodega/default-4")}
            >
              <View style={styles.cardTopRow}>
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={28}
                  color="#FFCC00"
                />
                <View style={styles.arrowCircle}>
                  <MaterialCommunityIcons
                    name="arrow-top-right"
                    size={18}
                    color="#FFF"
                  />
                </View>
              </View>
              <View style={styles.cardBottomRow}>
                <Text style={styles.cardTitle}>Asignar Factura</Text>
                <Text style={styles.cardSubtitle}>7 items alertados</Text>
              </View>
            </TouchableOpacity>

            {/* Tarjeta 5: Bajo Stock */}
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => handleCardPress("/bodega/default-4")}
            >
              <View style={styles.cardTopRow}>
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={28}
                  color="#FFCC00"
                />
                <View style={styles.arrowCircle}>
                  <MaterialCommunityIcons
                    name="arrow-top-right"
                    size={18}
                    color="#FFF"
                  />
                </View>
              </View>
              <View style={styles.cardBottomRow}>
                <Text style={styles.cardTitle}>Reasignar Factura</Text>
                <Text style={styles.cardSubtitle}>7 items alertados</Text>
              </View>
            </TouchableOpacity>

            {/* Tarjeta 6: Bajo Stock */}
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => handleCardPress("/bodega/default-4")}
            >
              <View style={styles.cardTopRow}>
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={28}
                  color="#FFCC00"
                />
                <View style={styles.arrowCircle}>
                  <MaterialCommunityIcons
                    name="arrow-top-right"
                    size={18}
                    color="#FFF"
                  />
                </View>
              </View>
              <View style={styles.cardBottomRow}>
                <Text style={styles.cardTitle}>Facturas Asignadas</Text>
                <Text style={styles.cardSubtitle}>7 items alertados</Text>
              </View>
            </TouchableOpacity>

            {/* Tarjeta 7: Bajo Stock */}
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => handleCardPress("/bodega/default-4")}
            >
              <View style={styles.cardTopRow}>
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={28}
                  color="#FFCC00"
                />
                <View style={styles.arrowCircle}>
                  <MaterialCommunityIcons
                    name="arrow-top-right"
                    size={18}
                    color="#FFF"
                  />
                </View>
              </View>
              <View style={styles.cardBottomRow}>
                <Text style={styles.cardTitle}>Notas</Text>
                <Text style={styles.cardSubtitle}>7 items alertados</Text>
              </View>
            </TouchableOpacity>

            {/* Tarjeta 8: Bajo Stock */}
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => handleCardPress("/bodega/default-4")}
            >
              <View style={styles.cardTopRow}>
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={28}
                  color="#FFCC00"
                />
                <View style={styles.arrowCircle}>
                  <MaterialCommunityIcons
                    name="arrow-top-right"
                    size={18}
                    color="#FFF"
                  />
                </View>
              </View>
              <View style={styles.cardBottomRow}>
                <Text style={styles.cardTitle}>Historial</Text>
                <Text style={styles.cardSubtitle}>7 items alertados</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  container: {
    flex: 1,
  },
  headerBackground: {
    backgroundColor: "rgba(13, 83, 149, 0.8)",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingHorizontal: 20,
    paddingBottom: 60,
    marginBottom: 40,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    color: "#E8DCC4",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 10,
  },
  notificationBadge: {
    flexDirection: "row",
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
  },
  notificationText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#8B5A3C",
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
    backgroundColor: "#FFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  profileButton: {
    backgroundColor: "#A0522D",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  greetingText: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  mainCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: -35,
    left: 20,
    right: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F5F5F5",
    borderWidth: 3,
    borderColor: "#D3E4CD",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  scoreText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#556B2F",
  },
  scoreSymbol: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#556B2F",
    marginTop: 4,
  },
  mainCardTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  mainCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  dot: {
    marginHorizontal: 6,
    color: "#CCC",
  },
  metricsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#8B5A3C",
    fontWeight: "600",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  /* --- NUEVOS ESTILOS PARA LAS TARJETAS TIPO "SERVICES" --- */
  serviceCard: {
    backgroundColor: "rgba(13, 83, 149, 0.8)", // Color gris-verdoso similar a la imagen
    width: "47%",
    aspectRatio: 0.95, // Las hace lucir un poco más altas que anchas
    borderRadius: 24, // Bordes muy redondeados
    padding: 16,
    marginBottom: 15,
    justifyContent: "space-between", // Separa los iconos superiores de los textos inferiores
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  arrowCircle: {
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Círculo semitransparente como en la imagen
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBottomRow: {
    marginTop: "auto",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF", // Texto principal en blanco
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#E6EBE8", // Texto secundario un poco más tenue
  },
});
