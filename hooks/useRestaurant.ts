"use client";

import { useState, useEffect, useCallback } from "react";
import { MenuItem, Table, Order, OrderItem, OrderItemStatus, TableStatus } from "@/lib/types";
import { SEED_MENU, SEED_TABLES } from "@/lib/seed";

const K_MENU = "restaurant_menu";
const K_TABLES = "restaurant_tables";
const K_ORDERS = "restaurant_orders";

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}

function save(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("restaurant:change", { detail: key }));
}

function uid() { return Math.random().toString(36).slice(2, 10); }

export function useRestaurant() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    setMenu(load<MenuItem[]>(K_MENU, []));
    setTables(load<Table[]>(K_TABLES, []));
    setOrders(load<Order[]>(K_ORDERS, []));
  }, []);

  useEffect(() => {
    // Initial seed
    if (!localStorage.getItem(K_MENU)) save(K_MENU, SEED_MENU);
    if (!localStorage.getItem(K_TABLES)) save(K_TABLES, SEED_TABLES);
    if (!localStorage.getItem(K_ORDERS)) save(K_ORDERS, []);
    refresh();
    setLoaded(true);

    const onChange = () => refresh();
    window.addEventListener("restaurant:change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("restaurant:change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  function commitTables(next: Table[]) { save(K_TABLES, next); setTables(next); }
  function commitOrders(next: Order[]) { save(K_ORDERS, next); setOrders(next); }
  function commitMenu(next: MenuItem[]) { save(K_MENU, next); setMenu(next); }

  function setTableStatus(tableId: string, status: TableStatus) {
    commitTables(tables.map((t) => t.id === tableId ? {
      ...t, status,
      openedAt: status === "ocupada" && !t.openedAt ? Date.now() : t.openedAt,
    } : t));
  }

  function openTable(tableId: string) {
    const cur = orders.find((o) => o.tableId === tableId && o.status === "aberta");
    if (cur) return cur;
    const o: Order = { id: uid(), tableId, items: [], status: "aberta", openedAt: Date.now() };
    commitOrders([...orders, o]);
    commitTables(tables.map((t) => t.id === tableId ? { ...t, status: "ocupada", openedAt: Date.now() } : t));
    return o;
  }

  function getActiveOrder(tableId: string): Order | undefined {
    return orders.find((o) => o.tableId === tableId && o.status === "aberta");
  }

  function addItemToTable(tableId: string, menuItem: MenuItem, qty: number, notes: string, fromCardapio: boolean) {
    const existing = orders.find((o) => o.tableId === tableId && o.status === "aberta");
    const item: OrderItem = {
      id: uid(), menuItemId: menuItem.id, name: menuItem.name,
      price: menuItem.price, qty, notes, status: "pedido",
      fromCardapio, createdAt: Date.now(),
    };
    if (existing) {
      commitOrders(orders.map((o) => o.id === existing.id ? { ...o, items: [...o.items, item] } : o));
      commitTables(tables.map((t) => t.id === tableId && t.status === "aguardando" ? { ...t, status: "ocupada" } : t));
    } else {
      const newOrder: Order = { id: uid(), tableId, items: [item], status: "aberta", openedAt: Date.now() };
      commitOrders([...orders, newOrder]);
      commitTables(tables.map((t) => t.id === tableId ? { ...t, status: "ocupada", openedAt: Date.now() } : t));
    }
  }

  function updateItemStatus(orderId: string, itemId: string, status: OrderItemStatus) {
    commitOrders(orders.map((o) => o.id !== orderId ? o : {
      ...o, items: o.items.map((it) => it.id === itemId ? { ...it, status } : it),
    }));
  }

  function removeItem(orderId: string, itemId: string) {
    commitOrders(orders.map((o) => o.id !== orderId ? o : {
      ...o, items: o.items.filter((it) => it.id !== itemId),
    }));
  }

  function closeTable(tableId: string) {
    const o = orders.find((x) => x.tableId === tableId && x.status === "aberta");
    if (!o) return;
    const total = o.items.reduce((s, it) => s + it.price * it.qty, 0);
    commitOrders(orders.map((x) => x.id !== o.id ? x : { ...x, status: "fechada", closedAt: Date.now(), total }));
    commitTables(tables.map((t) => t.id === tableId ? { ...t, status: "livre", openedAt: undefined } : t));
  }

  function startClosing(tableId: string) {
    commitTables(tables.map((t) => t.id === tableId ? { ...t, status: "fechando" } : t));
  }

  function resetData() {
    commitMenu(SEED_MENU);
    commitTables(SEED_TABLES);
    commitOrders([]);
  }

  return {
    menu, tables, orders, loaded,
    setTableStatus, openTable, getActiveOrder,
    addItemToTable, updateItemStatus, removeItem,
    closeTable, startClosing, resetData,
  };
}
