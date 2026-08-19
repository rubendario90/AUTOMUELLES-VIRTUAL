import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/** Obtiene el token guardado de forma compatible con web y móvil */
async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem('userToken');
  }
  return SecureStore.getItemAsync('userToken');
}

/** Cliente HTTP base */
async function request<T>(
  method: string,
  path: string,
  body?: object
): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
 if (token) headers['Authorization'] = token;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 204) return null as T;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw { status: response.status, message: data?.message ?? `Error ${response.status}`, data };
  }

  return data as T;
}

// ── Facturas ──────────────────────────────────────────────────────────────────

export const getFacturasPendientes = () =>
  request<FacturaAsignada[]>('GET', '/api/facturas-pendientes');

export const getFacturas = (date?: string) =>
  request<Factura[]>('GET', date ? `/api/facturas?date=${date}` : '/api/facturas');

export const getFacturaDetails = (id: number) =>
  request<FacturaDetail>('GET', `/api/facturas/${id}/details`);

export const deleteFactura = (id: number) =>
  request<void>('DELETE', `/api/facturas/${id}`);

export const getDocumentDetails = (transaccion: number, documento: number) =>
  request<DocumentDetail[]>('POST', '/api/document-details', { transaccion, documento });

// ── Estados ───────────────────────────────────────────────────────────────────

export const actualizarEstado = (payload: { factura_id: number; transaccion: number; user_id: number }) =>
  request<{ message: string }>('POST', '/api/actualizar-estado', payload);

export const registrarEntregaParcial = (payload: {
  factura_id: number; transaccion: number; user_id: number;
  productos_seleccionados: DocumentDetail[]; productos_no_seleccionados: DocumentDetail[];
}) => request<{ message: string }>('POST', '/api/registrar-entrega-parcial', payload);

export const getPickingFacturas = () =>
  request<FacturaAsignada[]>('GET', '/api/facturas/picking');

export const getPickingDetails = (transaccion: number, documento: number) =>
  request<DocumentDetail[]>('POST', '/api/facturas/picking/details', { transaccion, documento });

export const actualizarRevisionFinal = (payload: { factura_id: number; transaccion: number; user_id: number }) =>
  request<{ message: string }>('POST', '/api/actualizar-estado-revision-final', payload);

export const getEntregaParcial = () =>
  request<EntregaParcial[]>('GET', '/api/entrega-parcial');

export const actualizarEntregaParcial = (payload: { transaccion: number; factura_id: number; user_id: number }) =>
  request<{ message: string }>('POST', '/api/actualizar-estado-entrega-parcial', payload);

// ── Reasignación ──────────────────────────────────────────────────────────────

export const getFacturasPendientesParaReasignar = () =>
  request<FacturaAsignada[]>('GET', '/api/facturas/pendientes');

export const getUsuariosActivos = () =>
  request<UserBasic[]>('GET', '/api/usuarios/activos');

export const reasignarFactura = (factura_id: string, user_id: string) =>
  request<{ message: string }>('POST', '/api/facturas/reasignar', { factura_id, user_id });

// ── Usuarios y Roles ──────────────────────────────────────────────────────────

export const getUsuarios = () =>
  request<UserBasic[]>('GET', '/api/usuarios');

export const getRoles = () =>
  request<Role[]>('GET', '/api/roles');

export const cambiarRol = (user_id: string, role_id: string) =>
  request<{ message: string }>('PUT', '/api/cambio-rol', { user_id, role_id });

export const eliminarUsuario = (id: string) =>
  request<void>('DELETE', `/api/usuarios/${id}`);

export const cambiarContrasena = (user_id: string, password: string, password_confirmation: string) =>
  request<{ message: string }>('PUT', '/api/user/force-password', { user_id, password, password_confirmation });

export const actualizarUsuario = (user_id: string, name: string, email: string) =>
  request<{ message: string }>('PUT', '/api/actualizar-usuario', { user_id, name, email });

// ── Notas ─────────────────────────────────────────────────────────────────────

export const buscarTercero = (query: string) =>
  request<Tercero[]>('GET', `/api/terceros/buscar?query=${encodeURIComponent(query)}`);

export const guardarNota = (data: object) =>
  request<{ message: string }>('POST', '/api/notas', data);

export const getNotasPendientes = () =>
  request<Nota[]>('GET', '/api/notas-pendientes');

export const aprobarNota = (id: number, usuario: string) =>
  request<{ message: string }>('PUT', `/api/notas/${id}/aprobar`, { usuario });

export const eliminarNota = (id: number) =>
  request<void>('DELETE', `/api/notas/${id}`);

export const getProductosPorDocumento = (transaccion: string, documento: string) =>
  request<Producto[]>('GET', `/api/productos-por-documento?transaccion=${transaccion}&documento=${documento}`);

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type Factura = {
  id: number; transaccion: number; documento: number;
  estado: string; created_at: string; updated_at: string;
};

export type FacturaAsignada = {
  id: number; factura_id: number; transaccion: number; documento: number;
  estado: string; user_name?: string; usuario_actual?: string;
  created_at: string; updated_at: string;
  ClienteNombre?: string; StrUsuarioGra?: string; StrObservaciones?: string;
};

export type DocumentDetail = {
  IntDocumento: number; IntTransaccion: number; DatFecha1: string;
  StrReferencia1: string; StrReferencia3: string; StrObservaciones: string;
  StrTercero: string; ClienteNombre: string; StrUsuarioGra: string;
  StrDescripcion: string; StrProducto: string; IntBodega: number;
  StrParam1: string; IntCantidad: string;
};

export type FacturaDetail = {
  factura: { transaccion: number; documento: number; created_at: string };
  assigned_user?: { id: number; name: string; email: string };
  asignacion?: { user_id: number; assigned_at: string };
  status_logs: { id: number; new_status: string; changed_at: string; user_name: string }[];
};

export type EntregaParcial = {
  id: number; factura_id: number; transaccion: number; user_name: string;
  productos: string; created_at: string;
  ClienteNombre?: string; StrUsuarioGra?: string; StrObservaciones?: string; documento?: number;
};

export type UserBasic = { id: number; name: string; email: string; role_id?: number };
export type Role = { id: number; name: string };
export type Tercero = { StrIdTercero: string; StrNombre: string };
export type Nota = { id: number; data: string; created_at: string };
export type Producto = { StrProducto: string; IntCantidad: string };