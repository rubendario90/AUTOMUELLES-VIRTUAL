import { PEDIDOS_API_PREFIX } from "@/src/config/env";
import { http } from "@/src/services/http";

import { EstadoPedido, Pedido, PedidoInput } from "./types";

const pedidoPath = (suffix = "") => `${PEDIDOS_API_PREFIX}${suffix}`;

export const pedidosService = {
  list: () => http.get<Pedido[]>(pedidoPath()),
  getById: (id: string) => http.get<Pedido>(pedidoPath(`/${id}`)),
  create: (input: PedidoInput) => http.post<Pedido>(pedidoPath(), input),
  update: (id: string, input: PedidoInput) => http.put<Pedido>(pedidoPath(`/${id}`), input),
  updateStatus: (id: string, estado: EstadoPedido) =>
    http.patch<Pedido>(pedidoPath(`/${id}/estado`), { estado }),
};
