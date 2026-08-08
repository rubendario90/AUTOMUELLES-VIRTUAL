export type EstadoPedido =
  | "pendiente"
  | "en_proceso"
  | "aprobado"
  | "rechazado"
  | "despachado"
  | "entregado";

export type Pedido = {
  id: string;
  cliente: string;
  descripcion: string;
  estado: EstadoPedido;
  createdAt?: string;
  updatedAt?: string;
};

export type PedidoInput = {
  cliente: string;
  descripcion: string;
};
