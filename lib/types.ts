export type MenuCategoryId = "entradas" | "principais" | "bebidas" | "sobremesas";

export interface MenuCategory {
  id: MenuCategoryId;
  label: string;
  icon: string;
}

export const CATEGORIES: MenuCategory[] = [
  { id: "entradas", label: "Entradas", icon: "ForkKnife" },
  { id: "principais", label: "Pratos Principais", icon: "Bowl" },
  { id: "bebidas", label: "Bebidas", icon: "Wine" },
  { id: "sobremesas", label: "Sobremesas", icon: "Cake" },
];

export interface MenuItem {
  id: string;
  category: MenuCategoryId;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
}

export type TableStatus = "livre" | "ocupada" | "aguardando" | "fechando";

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  openedAt?: number;
}

export type OrderItemStatus = "pedido" | "preparando" | "pronto" | "entregue";

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
  status: OrderItemStatus;
  notes: string;
  fromCardapio: boolean;
  createdAt: number;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: "aberta" | "fechada";
  openedAt: number;
  closedAt?: number;
  total?: number;
}

export const TABLE_STATUS_LABEL: Record<TableStatus, string> = {
  livre: "Livre",
  ocupada: "Ocupada",
  aguardando: "Aguardando pedido",
  fechando: "Fechando conta",
};
