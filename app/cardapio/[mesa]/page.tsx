"use client";

import { use, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, X, ShoppingCart, CheckCircle, ForkKnife, Sparkle } from "@phosphor-icons/react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { CATEGORIES, MenuItem, MenuCategoryId } from "@/lib/types";

function fmtBRL(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

interface CartLine { item: MenuItem; qty: number; notes: string; }

export default function CardapioPage({ params }: { params: Promise<{ mesa: string }> }) {
  const { mesa } = use(params);
  const { menu, tables, addItemToTable, loaded } = useRestaurant();
  const [activeCat, setActiveCat] = useState<MenuCategoryId>("entradas");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [picking, setPicking] = useState<MenuItem | null>(null);
  const [pickQty, setPickQty] = useState(1);
  const [pickNotes, setPickNotes] = useState("");
  const [sent, setSent] = useState(false);

  const table = tables.find((t) => String(t.number) === mesa);

  if (!loaded) return <div className="bg-ambience" style={{ height: "100vh" }} />;

  function addToCart(item: MenuItem, qty: number, notes: string) {
    setCart((c) => [...c, { item, qty, notes }]);
    setPicking(null); setPickQty(1); setPickNotes("");
  }

  function removeLine(i: number) {
    setCart((c) => c.filter((_, idx) => idx !== i));
  }

  function changeQty(i: number, delta: number) {
    setCart((c) => c.map((l, idx) => idx === i ? { ...l, qty: Math.max(1, l.qty + delta) } : l));
  }

  function sendOrder() {
    if (!table) return;
    for (const line of cart) {
      addItemToTable(table.id, line.item, line.qty, line.notes, true);
    }
    setCart([]); setShowCart(false); setSent(true);
    setTimeout(() => setSent(false), 4000);
  }

  const cartTotal = cart.reduce((s, l) => s + l.item.price * l.qty, 0);
  const cartCount = cart.reduce((s, l) => s + l.qty, 0);

  return (
    <div className="bg-ambience" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <header style={{
        padding: "20px 18px 14px", flexShrink: 0,
        background: "linear-gradient(180deg, rgba(249,115,22,0.08) 0%, transparent 100%)",
        borderBottom: "1px solid #f3ead9",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11,
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 16px rgba(234,88,12,0.25)",
          }}>
            <ForkKnife size={17} weight="duotone" color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#44362a", letterSpacing: "-0.01em" }}>Tavola</div>
            <div style={{ fontSize: 10, color: "#978368" }}>Mesa {mesa} · Bem-vindo</div>
          </div>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#44362a", letterSpacing: "-0.02em", marginTop: 8 }}>
          Cardápio
        </h1>
        <p style={{ fontSize: 12, color: "#978368", marginTop: 4 }}>
          Faça seu pedido direto pela mesa. Nosso atendente confirma na cozinha.
        </p>
      </header>

      {/* Category tabs */}
      <div style={{
        padding: "12px 18px 6px", flexShrink: 0,
        display: "flex", gap: 6, overflowX: "auto",
      }}>
        {CATEGORIES.map((cat) => {
          const active = activeCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCat(cat.id);
                document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              style={{
                padding: "7px 14px", borderRadius: 20,
                background: active ? "#fff7ed" : "#ffffff",
                border: `1px solid ${active ? "#fdba74" : "#f3ead9"}`,
                color: active ? "#c2410c" : "#978368",
                fontSize: 12, fontWeight: active ? 600 : 500, cursor: "pointer",
                whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.12s",
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Items list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 18px 120px" }}>
        {CATEGORIES.map((cat) => {
          const items = menu.filter((m) => m.category === cat.id && m.available);
          return (
            <div key={cat.id} id={`cat-${cat.id}`} style={{ marginBottom: 26 }}>
              <div style={{ fontSize: 11, color: "#978368", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 10 }}>
                {cat.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {items.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPicking(m)}
                    style={{
                      padding: 14, borderRadius: 16,
                      background: "#ffffff",
                      border: "1px solid #f3ead9",
                      display: "flex", alignItems: "center", gap: 14,
                      textAlign: "left", cursor: "pointer", width: "100%",
                      boxShadow: "0 1px 3px rgba(68,54,42,0.04)",
                    }}
                  >
                    <div style={{
                      width: 56, height: 56, borderRadius: 14,
                      background: "linear-gradient(135deg, #fff7ed, #fef3c7)",
                      border: "1px solid #fde68a",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Sparkle size={22} weight="duotone" color="#d97706" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#44362a", marginBottom: 3 }}>{m.name}</div>
                      <div style={{ fontSize: 11.5, color: "#978368", lineHeight: 1.45 }}>{m.description}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#c2410c", marginTop: 6 }}>{fmtBRL(m.price)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart FAB */}
      {cart.length > 0 && (
        <motion.button
          initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
          onClick={() => setShowCart(true)}
          style={{
            position: "fixed", left: "50%", bottom: 22,
            transform: "translateX(-50%)",
            padding: "12px 22px", borderRadius: 99,
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            color: "#ffffff", fontSize: 13, fontWeight: 700, cursor: "pointer",
            border: "1px solid #ea580c",
            display: "flex", alignItems: "center", gap: 10,
            boxShadow: "0 12px 32px rgba(234,88,12,0.35)",
            zIndex: 30,
          }}
        >
          <ShoppingCart size={15} weight="duotone" />
          <span>{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
          <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.3)" }} />
          <span>{fmtBRL(cartTotal)}</span>
        </motion.button>
      )}

      {/* Sent toast */}
      <AnimatePresence>
        {sent && (
          <motion.div
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            style={{
              position: "fixed", left: "50%", bottom: 22, transform: "translateX(-50%)",
              padding: "14px 22px", borderRadius: 16,
              background: "#ecfdf5",
              border: "1px solid #6ee7b7",
              display: "flex", alignItems: "center", gap: 10,
              color: "#047857", fontSize: 13, fontWeight: 600,
              zIndex: 40, boxShadow: "0 12px 32px rgba(16,185,129,0.18)",
            }}
          >
            <CheckCircle size={16} weight="duotone" />
            Pedido enviado para a cozinha
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item picker */}
      <AnimatePresence>
        {picking && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPicking(null)}
            style={backdrop}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              style={sheetStyle}
            >
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e8dcc4", margin: "0 auto 14px" }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: "#44362a" }}>{picking.name}</div>
              <div style={{ fontSize: 12.5, color: "#978368", marginTop: 4, marginBottom: 14, lineHeight: 1.5 }}>
                {picking.description}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#c2410c", marginBottom: 18 }}>
                {fmtBRL(picking.price * pickQty)}
              </div>

              <label style={lblSheet}>Quantidade</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8, marginBottom: 16 }}>
                <button onClick={() => setPickQty(Math.max(1, pickQty - 1))} style={btnIconBig}><Minus size={16} /></button>
                <span style={{ fontSize: 24, fontWeight: 700, color: "#44362a", minWidth: 36, textAlign: "center" }}>{pickQty}</span>
                <button onClick={() => setPickQty(pickQty + 1)} style={btnIconBig}><Plus size={16} /></button>
              </div>

              <label style={lblSheet}>Observações</label>
              <textarea
                value={pickNotes} onChange={(e) => setPickNotes(e.target.value)}
                rows={2} placeholder="Sem cebola, ao ponto..."
                style={{
                  marginTop: 6, marginBottom: 18, width: "100%", padding: "11px 14px",
                  background: "#faf6f0",
                  border: "1px solid #f3ead9", borderRadius: 12,
                  color: "#44362a", fontSize: 13, resize: "none",
                }}
              />

              <button onClick={() => addToCart(picking, pickQty, pickNotes)} style={{
                width: "100%", padding: "14px", borderRadius: 14,
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                color: "#ffffff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                border: "1px solid #ea580c",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 8px 24px rgba(234,88,12,0.25)",
              }}>
                <Plus size={15} weight="bold" /> Adicionar ao pedido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart sheet */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCart(false)}
            style={backdrop}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              style={{ ...sheetStyle, maxHeight: "85vh", display: "flex", flexDirection: "column" }}
            >
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e8dcc4", margin: "0 auto 14px" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#44362a" }}>Seu pedido</div>
                  <div style={{ fontSize: 11, color: "#978368", marginTop: 2 }}>Mesa {mesa} · {cartCount} item{cartCount !== 1 ? "s" : ""}</div>
                </div>
                <button onClick={() => setShowCart(false)} style={btnIcon}><X size={13} /></button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingBottom: 12 }}>
                {cart.map((l, i) => (
                  <div key={i} style={{
                    padding: 12, borderRadius: 12,
                    background: "#faf6f0",
                    border: "1px solid #f3ead9",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#44362a" }}>{l.item.name}</div>
                        {l.notes && (
                          <div style={{ fontSize: 11, color: "#978368", marginTop: 3 }}>
                            {l.notes}
                          </div>
                        )}
                      </div>
                      <button onClick={() => removeLine(i)} style={{ ...btnIconRed, width: 26, height: 26 }}>
                        <X size={12} />
                      </button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => changeQty(i, -1)} style={{ ...btnIconSmall }}><Minus size={11} /></button>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#44362a", minWidth: 22, textAlign: "center" }}>{l.qty}</span>
                        <button onClick={() => changeQty(i, +1)} style={{ ...btnIconSmall }}><Plus size={11} /></button>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#c2410c" }}>
                        {fmtBRL(l.item.price * l.qty)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid #f3ead9", paddingTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#978368", marginBottom: 4 }}>
                  <span>Subtotal</span>
                  <span>{fmtBRL(cartTotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#44362a" }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#c2410c" }}>{fmtBRL(cartTotal)}</span>
                </div>
                <button onClick={sendOrder} style={{
                  width: "100%", padding: "14px", borderRadius: 14,
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#ffffff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  border: "1px solid #059669",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 12px 32px rgba(16,185,129,0.22)",
                }}>
                  <CheckCircle size={15} weight="duotone" /> Enviar para cozinha
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const backdrop: React.CSSProperties = {
  position: "fixed", inset: 0,
  background: "rgba(68,54,42,0.45)",
  backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
  zIndex: 50, display: "flex", alignItems: "flex-end",
};

const sheetStyle: React.CSSProperties = {
  width: "100%",
  background: "#ffffff",
  borderTop: "1px solid #f3ead9",
  borderTopLeftRadius: 24, borderTopRightRadius: 24,
  padding: "16px 20px 28px",
  boxShadow: "0 -20px 60px rgba(68,54,42,0.18)",
  paddingBottom: "calc(28px + env(safe-area-inset-bottom))",
};

const lblSheet: React.CSSProperties = {
  fontSize: 10, color: "#978368",
  textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600,
};

const btnIcon: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 10,
  background: "#faf6f0",
  border: "1px solid #f3ead9",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#978368", cursor: "pointer",
};

const btnIconBig: React.CSSProperties = {
  width: 44, height: 44, borderRadius: 14,
  background: "#fff7ed",
  border: "1px solid #fed7aa",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#c2410c", cursor: "pointer",
};

const btnIconSmall: React.CSSProperties = {
  width: 26, height: 26, borderRadius: 8,
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
