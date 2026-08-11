export const ENV = process.env.EXPO_PUBLIC_ENV || "production";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.automuelles.com";

export const APP_ROLE = (process.env.EXPO_PUBLIC_ROLE || "BODEGA_JEFE").toUpperCase();

export const PEDIDOS_API_PREFIX = process.env.EXPO_PUBLIC_PEDIDOS_API_PREFIX || "/api/pedidos";
