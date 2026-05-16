"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Minus, Trash, Clock, ForkKnife, CheckCircle,
  CreditCard, QrCode, X, MagnifyingGlass, ChatText,
} from "@phosphor-icons/react";
import { Nav } from "@/components/Nav";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useIsMobile } from "@/hooks/useIsMobile";
import { CATEGORIES, MenuItem, OrderItemStatus } from "@/lib/types";

function fmtBRL(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function fmtMin(ms: number) {
  const min = Math.floor((Date.now() - ms) / 60000);
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60); const r = min % 60;
  return `${h}h${r > 0 ? ` ${r}min` : ""}`;
}

const STATUS_LABEL: Record<OrderItemStatus, { label: string; color: string; bg: string }> = {
  pedido: { label: "Aguardando cozinha", color: "#b91c1c", bg: "#fef2f2" },
  preparando: { label: "Preparando", color: "#c2410c", bg: "#fff7ed" },
  pronto: { label: "Pronto p/ servir", color: "#047857", bg: "#ecfdf5" },
  entregue: { label: "Entregue", color: "#978368", bg: "#faf6f0" },
};

export default function MesaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { tables, menu, getActiveOrder, addItemToTable, updateItemStatus, removeItem, closeTable, startClosing, openTable, loaded } = useRestaurant();
  const isMobile = useIsMobile();
  const [showMenu, setShowMenu] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  if (!loaded) return <div className="bg-ambience" style={{ height: "100vh" }} />;

  const table = tables.find((t) => t.id === id);
  if (!table) {
    return (
      <div className="bg-ambience" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <Nav />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#978368" }}>
          Mesa não encontrada
        </div>
      </div>
    );
  }

  const order = getActiveOrder(id);
  const items = order?.items ?? [];
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  return (
    <div className="bg-ambience" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Nav />

      {/* Header */}
      <div style={{
        padding: isMobile ? "12px 14px" : "18px 24px", flexShrink: 0,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "space-between",
        gap: isMobile ? 12 : 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <button onClick={() => router.push("/")} style={btnIcon}>
            <ArrowLeft size={14} />
          </button>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: "#44362a", letterSpacing: "-0.02em" }}>
              Mesa {String(table.number).padStart(2, "0")}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3, fontSize: 11, color: "#978368", whiteSpace: "nowrap" }}>
              <span>{table.capacity} lugares</span>
              {table.openedAt && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={11} /> {fmtMin(table.openedAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => window.open(`/cardapio/${table.number}`, "_blank")}
            title="Abrir cardápio digital da mesa em outra aba"
            style={{ ...btnSecondary, flex: isMobile ? 1 : "0 0 auto", justifyContent: "center" }}
          >
            <QrCode size={13} weight="duotone" />
            {isMobile ? "Cardápio" : "Cardápio mesa"}
          </button>
          <button
            onClick={() => { if (!order) openTable(id); setShowMenu(true); }}
            style={{ ...btnPrimary, flex: isMobile ? 1 : "0 0 auto", justifyContent: "center" }}
          >
            <Plus size={13} weight="bold" />
            {isMobile ? "Adicionar" : "Adicionar item"}
          </button>
        </div>
      </div>

      {/* Items list */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "8px 14px 16px" : "8px 24px 24px" }}>
        {items.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            border: "1px dashed #e8dcc4", borderRadius: 16,
            color: "#978368", background: "#ffffff",
          }}>
            <ForkKnife size={32} weight="duotone" color="#c5b495" />
            <div style={{ marginTop: 12, fontSize: 13 }}>Nenhum item na comanda</div>
            <button
              onClick={() => { if (!order) openTable(id); setShowMenu(true); }}
              style={{ ...btnPrimary, marginTop: 16 }}
            >
              <Plus size={13} weight="bold" /> Adicionar primeiro item
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <AnimatePresence>
              {items.map((it) => {
                const s = STATUS_LABEL[it.status];
                return (
                  <motion.div
                    key={it.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      gap: isMobile ? 10 : 14, alignItems: "center",
                      padding: isMobile ? "11px 12px" : "12px 16px",
                      background: "#ffffff",
                      border: "1px solid #f3ead9",
                      borderRadius: 14,
                      boxShadow: "0 1px 2px rgba(68,54,42,0.03)",
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: "#fff7ed",
                      border: "1px solid #fed7aa",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 700, color: "#c2410c",
                    }}>
                      {it.qty}×
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#44362a", marginBottom: 4, lineHeight: 1.3 }}>{it.name}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 9, padding: "2px 7px", borderRadius: 10,
                          background: s.bg, color: s.color, fontWeight: 600,
                        }}>
                          {s.label}
                        </span>
                        {it.fromCardapio && (
                          <span style={{ fontSize: 9, color: "#c2410c", background: "#fff7ed", border: "1px solid #fed7aa", padding: "2px 7px", borderRadius: 8, fontWeight: 600 }}>
                            CLIENTE
                          </span>
                        )}
                      </div>
                      {it.notes && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#978368", marginTop: 4 }}>
                          <ChatText size={10} /> {it.notes}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#c2410c", whiteSpace: "nowrap" }}>
                        {fmtBRL(it.price * it.qty)}
                      </div>
                      <div style={{ display: "flex", gap: 5 }}>
                        {it.status === "pronto" && (
                          <button onClick={() => order && updateItemStatus(order.id, it.id, "entregue")} title="Marcar entregue" style={btnIconGreen}>
                            <CheckCircle size={13} weight="duotone" />
                          </button>
                        )}
                        <button onClick={() => order && removeItem(order.id, it.id)} title="Remover" style={btnIconRed}>
                          <Trash size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Totals + actions */}
      {items.length > 0 && (
        <div style={{
          padding: isMobile ? "12px 14px calc(12px + env(safe-area-inset-bottom))" : "16px 24px",
          flexShrink: 0,
          background: "rgba(255,251,244,0.92)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid #f3ead9",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          gap: isMobile ? 10 : 16,
        }}>
          <div>
            <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#978368", flexWrap: "wrap" }}>
              <span>Subtotal {fmtBRL(subtotal)}</span>
              <span>Serviço 10% {fmtBRL(serviceFee)}</span>
            </div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: "#44362a", marginTop: 2, display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: isMobile ? 12 : 13, fontWeight: 500, color: "#978368" }}>Total</span>
              {fmtBRL(total)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {table.status !== "fechando" && (
              <button onClick={() => startClosing(id)} style={{ ...btnSecondary, flex: isMobile ? 1 : "0 0 auto", justifyContent: "center", whiteSpace: "nowrap" }}>
                <Clock size={13} /> Pedir conta
              </button>
            )}
            <button onClick={() => setConfirmClose(true)} style={{ ...btnGreen, flex: isMobile ? 1 : "0 0 auto", justifyContent: "center", whiteSpace: "nowrap" }}>
              <CreditCard size={13} weight="duotone" /> Fechar mesa
            </button>
          </div>
        </div>
      )}

      {/* Menu picker modal */}
      <AnimatePresence>
        {showMenu && (
          <MenuPicker
            menu={menu}
            onPick={(item, qty, notes) => {
              addItemToTable(id, item, qty, notes, false);
            }}
            onClose={() => setShowMenu(false)}
          />
        )}
      </AnimatePresence>

      {/* Close table confirm */}
      <AnimatePresence>
        {confirmClose && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setConfirmClose(false)}
            style={modalBackdrop}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              transition={{ duration: 0.14 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#ffffff",
                border: "1px solid #f3ead9", borderRadius: 18,
                padding: 24, width: "min(380px, calc(100vw - 24px))",
                boxShadow: "0 30px 70px rgba(68,54,42,0.18)",
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: "#44362a", marginBottom: 6 }}>Fechar mesa {table.number}?</div>
              <div style={{ fontSize: 12, color: "#978368", marginBottom: 18 }}>
                Total {fmtBRL(total)} será cobrado. A comanda será encerrada e a mesa liberada.
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setConfirmClose(false)} style={btnSecondary}>Cancelar</button>
                <button onClick={() => { closeTable(id); setConfirmClose(false); router.push("/"); }} style={btnGreen}>
                  <CheckCircle size={13} weight="duotone" /> Confirmar fechamento
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuPicker({ menu, onPick, onClose }: {
  menu: MenuItem[];
  onPick: (item: MenuItem, qty: number, notes: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [picking, setPicking] = useState<MenuItem | null>(null);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");

  const filtered = menu.filter((m) =>
    m.available &&
    (m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase()))
  );

  function pick() {
    if (!picking) return;
    onPick(picking, qty, notes);
    setPicking(null); setQty(1); setNotes("");
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={modalBackdrop}
    >
      <motion.div
        initial={{ scale: 0.95, y: 14 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        transition={{ duration: 0.16 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          border: "1px solid #f3ead9", borderRadius: 20,
          width: "min(640px, calc(100vw - 24px))", maxHeight: "calc(100vh - 32px)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          boxShadow: "0 30px 70px rgba(68,54,42,0.18)",
        }}
      >
        <div style={{ padding: "18px 20px 12px", borderBottom: "1px solid #f3ead9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#44362a" }}>
            {picking ? `Adicionar: ${picking.name}` : "Adicionar item ao pedido"}
          </div>
          <button onClick={onClose} style={btnIcon}>
            <X size={13} />
          </button>
        </div>

        {!picking && (
          <div style={{ padding: "12px 20px 0", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <MagnifyingGlass size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#c5b495" }} />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar item do cardápio..."
                style={{
                  width: "100%", padding: "10px 14px 10px 36px",
                  background: "#faf6f0",
                  border: "1px solid #f3ead9", borderRadius: 12,
                  color: "#44362a", fontSize: 13,
                }}
              />
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {picking ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 12, color: "#978368" }}>{picking.description}</div>
              <div>
                <label style={lblStyle}>Quantidade</label>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={btnIconBig}>
                    <Minus size={14} />
                  </button>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "#44362a", minWidth: 30, textAlign: "center" }}>{qty}</span>
                  <button onClick={() => setQty(qty + 1)} style={btnIconBig}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div>
                <label style={lblStyle}>Observações (sem cebola, ponto da carne...)</label>
                <textarea
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  rows={2} placeholder="Opcional"
                  style={{
                    marginTop: 6, width: "100%", padding: "10px 12px",
                    background: "#faf6f0",
                    border: "1px solid #f3ead9", borderRadius: 10,
                    color: "#44362a", fontSize: 12.5, resize: "none",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#c2410c" }}>
                  {fmtBRL(picking.price * qty)}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setPicking(null)} style={btnSecondary}>Voltar</button>
                  <button onClick={pick} style={btnPrimary}>
                    <Plus size={13} weight="bold" /> Adicionar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {CATEGORIES.map((cat) => {
                const items = filtered.filter((m) => m.category === cat.id);
                if (items.length === 0) return null;
                return (
                  <div key={cat.id}>
                    <div style={{ fontSize: 10, color: "#978368", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>
                      {cat.label}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {items.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setPicking(m)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "11px 14px", borderRadius: 12,
                            background: "#faf6f0",
                            border: "1px solid #f3ead9",
                            color: "#44362a", cursor: "pointer", textAlign: "left",
                            transition: "all 0.12s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#fff7ed"; e.currentTarget.style.borderColor = "#fed7aa"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#faf6f0"; e.currentTarget.style.borderColor = "#f3ead9"; }}
                        >
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                            <div style={{ fontSize: 11, color: "#978368", marginTop: 2 }}>{m.description}</div>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#c2410c", flexShrink: 0, marginLeft: 12 }}>
                            {fmtBRL(m.price)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "9px 16px", borderRadius: 12,
  background: "linear-gradient(135deg, #f97316, #ea580c)",
  color: "#ffffff", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
  border: "1px solid #ea580c",
  boxShadow: "0 6px 18px rgba(234,88,12,0.25)",
};

const btnSecondary: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "9px 14px", borderRadius: 12,
  background: "#ffffff",
  color: "#44362a", fontSize: 12, fontWeight: 500, cursor: "pointer",
  border: "1px solid #e8dcc4",
};

const btnGreen: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "9px 14px", borderRadius: 12,
  background: "linear-gradient(135deg, #10b981, #059669)",
  color: "#ffffff", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
  border: "1px solid #059669",
  boxShadow: "0 6px 18px rgba(5,150,105,0.22)",
};

const btnIcon: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 10,
  background: "#ffffff",
  border: "1px solid #f3ead9",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#978368", cursor: "pointer",
};

const btnIconBig: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 12,
  background: "#fff7ed",
  border: "1px solid #fed7aa",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#c2410c", cursor: "pointer",
};

const btnIconRed: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 8,
  background: "#fef2f2",
  border: "1px solid #fecaca",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#b91c1c", cursor: "pointer",
};

const btnIconGreen: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 8,
  background: "#ecfdf5",
  border: "1px solid #a7f3d0",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#047857", cursor: "pointer",
};

const lblStyle: React.CSSProperties = {
  fontSize: 10, color: "#978368",
  textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600,
};

const modalBackdrop: React.CSSProperties = {
  position: "fixed", inset: 0,
  background: "rgba(68,54,42,0.4)",
  backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
  zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center",
};
