import { EstadoPedido } from "./types";

export const PEDIDO_ESTADOS: EstadoPedido[] = [
  "pendiente",
  "en_proceso",
  "aprobado",
  "rechazado",
  "despachado",
  "entregado",
];

export const PEDIDO_ESTADOS_LABEL: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  despachado: "Despachado",
  entregado: "Entregado",
};
