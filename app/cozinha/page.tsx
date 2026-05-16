"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Fire, CheckCircle, Bell, ChatText } from "@phosphor-icons/react";
import { Nav } from "@/components/Nav";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Order, OrderItem, OrderItemStatus } from "@/lib/types";

function fmtMin(ms: number) {
  const min = Math.floor((Date.now() - ms) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  return `${h}h${min % 60}min`;
}

interface KitchenItem {
  orderId: string;
  tableNumber: number;
  item: OrderItem;
}

const COLS: { status: OrderItemStatus; label: string; icon: typeof Clock; color: string; bgSoft: string; borderSoft: string; next?: OrderItemStatus; nextLabel?: string }[] = [
  { status: "pedido", label: "Novos pedidos", icon: Bell, color: "#dc2626", bgSoft: "#fef2f2", borderSoft: "#fecaca", next: "preparando", nextLabel: "Iniciar preparo" },
  { status: "preparando", label: "Preparando", icon: Fire, color: "#ea580c", bgSoft: "#fff7ed", borderSoft: "#fed7aa", next: "pronto", nextLabel: "Marcar pronto" },
  { status: "pronto", label: "Pronto p/ servir", icon: CheckCircle, color: "#059669", bgSoft: "#ecfdf5", borderSoft: "#a7f3d0" },
];

export default function CozinhaPage() {
  const { orders, tables, updateItemStatus, loaded } = useRestaurant();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<OrderItemStatus>("pedido");

  if (!loaded) return <div className="bg-ambience" style={{ height: "100vh" }} />;

  const activeOrders = orders.filter((o) => o.status === "aberta");

  function tableNumberOf(orderId: string) {
    const o = orders.find((x) => x.id === orderId);
    if (!o) return 0;
    const t = tables.find((x) => x.id === o.tableId);
    return t?.number ?? 0;
  }

  function itemsByStatus(status: OrderItemStatus): KitchenItem[] {
    const items: KitchenItem[] = [];
    for (const o of activeOrders) {
      for (const it of o.items) {
        if (it.status === status) {
          const t = tables.find((x) => x.id === o.tableId);
          items.push({ orderId: o.id, tableNumber: t?.number ?? 0, item: it });
        }
      }
    }
    return items.sort((a, b) => a.item.createdAt - b.item.createdAt);
  }

  return (
    <div className="bg-ambience" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Nav />

      <div style={{
        padding: isMobile ? "14px 14px 0" : "18px 24px 6px",
        flexShrink: 0,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "space-between",
        gap: isMobile ? 12 : 0,
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, color: "#44362a", letterSpacing: "-0.02em" }}>
            Cozinha · KDS
          </h1>
          <p style={{ fontSize: 12, color: "#978368", marginTop: 4 }}>
            Acompanhamento em tempo real
          </p>
        </div>
        {!isMobile && (
          <div style={{ display: "flex", gap: 8 }}>
            {COLS.map((col) => {
              const count = itemsByStatus(col.status).length;
              return (
                <div key={col.status} style={{
                  padding: "8px 14px", borderRadius: 12,
                  background: "#ffffff",
                  border: "1px solid #f3ead9",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: col.color }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#44362a" }}>{count}</span>
                  <span style={{ fontSize: 10, color: "#978368", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {col.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile tabs */}
      {isMobile && (
        <div style={{ padding: "8px 14px 0", display: "flex", gap: 6, flexShrink: 0, overflowX: "auto" }}>
          {COLS.map((col) => {
            const count = itemsByStatus(col.status).length;
            const active = activeTab === col.status;
            return (
              <button
                key={col.status}
                onClick={() => setActiveTab(col.status)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "8px 12px", borderRadius: 11,
                  background: active ? col.bgSoft : "#ffffff",
                  border: `1px solid ${active ? col.borderSoft : "#f3ead9"}`,
                  color: active ? col.color : "#978368",
                  fontSize: 12, fontWeight: active ? 600 : 500,
                  cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: col.color }} />
                {col.label}
                <span style={{
                  padding: "1px 6px", borderRadius: 8,
                  background: active ? col.borderSoft : "#f3ead9",
                  color: active ? col.color : "#978368",
                  fontSize: 10, fontWeight: 700,
                }}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Columns */}
      <div style={{
        flex: 1, overflow: "hidden",
        padding: isMobile ? "12px 14px 16px" : "16px 24px 24px",
        display: isMobile ? "flex" : "grid",
        flexDirection: isMobile ? "column" : undefined,
        gridTemplateColumns: isMobile ? undefined : "1fr 1fr 1fr",
        gap: 16,
      }}>
        {COLS.filter((col) => !isMobile || col.status === activeTab).map((col) => {
          const items = itemsByStatus(col.status);
          const Icon = col.icon;
          return (
            <div key={col.status} style={{ display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0, flex: isMobile ? 1 : undefined }}>
              {/* Column header (hidden on mobile — tabs already show it) */}
              {!isMobile && (
                <div style={{
                  padding: "10px 14px",
                  background: col.bgSoft,
                  border: `1px solid ${col.borderSoft}`,
                  borderRadius: 14, marginBottom: 12,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <Icon size={16} weight="duotone" color={col.color} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#44362a" }}>{col.label}</span>
                  <span style={{
                    marginLeft: "auto", padding: "2px 8px", borderRadius: 10,
                    background: "#ffffff", color: col.color,
                    border: `1px solid ${col.borderSoft}`,
                    fontSize: 11, fontWeight: 700,
                  }}>{items.length}</span>
                </div>
              )}

              {/* Items */}
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                <AnimatePresence>
                  {items.map((ki) => {
                    const ageMin = Math.floor((Date.now() - ki.item.createdAt) / 60000);
                    const urgent = col.status === "pedido" && ageMin >= 5;
                    const veryUrgent = col.status === "preparando" && ageMin >= 15;
                    return (
                      <motion.div
                        key={ki.item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: 30 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          padding: 14, borderRadius: 14,
                          background: urgent || veryUrgent ? "#fef2f2" : "#ffffff",
                          border: `1px solid ${urgent || veryUrgent ? "#fecaca" : "#f3ead9"}`,
                          boxShadow: "0 1px 3px rgba(68,54,42,0.04)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                          <div>
                            <div style={{
                              display: "inline-flex", alignItems: "center", gap: 5,
                              padding: "2px 8px", borderRadius: 8,
                              background: "#fff7ed", border: "1px solid #fed7aa", marginBottom: 6,
                            }}>
                              <span style={{ fontSize: 9, color: "#978368", fontWeight: 600 }}>MESA</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#c2410c" }}>
                                {String(ki.tableNumber).padStart(2, "0")}
                              </span>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#44362a", lineHeight: 1.3 }}>
                              {ki.item.qty}× {ki.item.name}
                            </div>
                          </div>
                          <div style={{
                            display: "flex", alignItems: "center", gap: 4,
                            fontSize: 11, color: urgent || veryUrgent ? "#dc2626" : "#978368",
                            fontWeight: 600, flexShrink: 0,
                          }}>
                            <Clock size={11} weight={urgent || veryUrgent ? "fill" : "regular"} />
                            {fmtMin(ki.item.createdAt)}
                          </div>
                        </div>

                        {ki.item.notes && (
                          <div style={{
                            display: "flex", alignItems: "flex-start", gap: 6,
                            padding: "8px 10px", borderRadius: 8,
                            background: "#fff7ed",
                            border: "1px dashed #fed7aa",
                            fontSize: 11.5, color: "#9a3412",
                            marginBottom: 10, lineHeight: 1.4,
                          }}>
                            <ChatText size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                            <span>{ki.item.notes}</span>
                          </div>
                        )}

                        {ki.item.fromCardapio && (
                          <div style={{ marginBottom: 10, fontSize: 9, color: "#c2410c", fontWeight: 600 }}>
                            ← pedido pelo cliente via cardápio digital
                          </div>
                        )}

                        {col.next && (
                          <button
                            onClick={() => updateItemStatus(ki.orderId, ki.item.id, col.next!)}
                            style={{
                              width: "100%", padding: "9px 14px", borderRadius: 10,
                              background: `linear-gradient(135deg, ${col.color}, ${col.color}dd)`,
                              color: "#ffffff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                              border: `1px solid ${col.color}`,
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                              whiteSpace: "nowrap",
                              boxShadow: `0 6px 16px ${col.color}33`,
                            }}
                          >
                            <Fire size={12} weight="duotone" />
                            {col.nextLabel}
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {items.length === 0 && (
                  <div style={{
                    padding: "30px 20px", textAlign: "center",
                    border: "1px dashed #e8dcc4", borderRadius: 12,
                    color: "#c5b495", fontSize: 12, background: "#ffffff",
                  }}>
                    Nenhum item
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
