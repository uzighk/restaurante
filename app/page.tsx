"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Clock, ForkKnife, CheckCircle, Plus, QrCode } from "@phosphor-icons/react";
import { Nav } from "@/components/Nav";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Table, TableStatus } from "@/lib/types";

const STATUS_STYLE: Record<TableStatus, { bg: string; border: string; text: string; dot: string }> = {
  livre: {
    bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)",
    text: "rgba(252,211,77,0.55)", dot: "rgba(255,255,255,0.3)",
  },
  ocupada: {
    bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.28)",
    text: "#fcd34d", dot: "#f59e0b",
  },
  aguardando: {
    bg: "rgba(220,38,38,0.10)", border: "rgba(220,38,38,0.30)",
    text: "#fca5a5", dot: "#ef4444",
  },
  fechando: {
    bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.28)",
    text: "#6ee7b7", dot: "#10b981",
  },
};

function fmtMin(ms: number) {
  const min = Math.floor((Date.now() - ms) / 60000);
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60); const r = min % 60;
  return `${h}h${r > 0 ? ` ${r}min` : ""}`;
}

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PainelPage() {
  const router = useRouter();
  const { tables, orders, loaded } = useRestaurant();
  const isMobile = useIsMobile();

  if (!loaded) {
    return (
      <div className="bg-ambience" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 26, height: 26, border: "2px solid rgba(245,158,11,0.2)", borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  const counts = tables.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  const livre = counts.livre || 0;
  const ativas = tables.length - livre;

  function activeOrderTotal(tableId: string) {
    const o = orders.find((x) => x.tableId === tableId && x.status === "aberta");
    if (!o) return 0;
    return o.items.reduce((s, it) => s + it.price * it.qty, 0);
  }

  function pendingItemsCount(tableId: string) {
    const o = orders.find((x) => x.tableId === tableId && x.status === "aberta");
    if (!o) return 0;
    return o.items.filter((it) => it.status === "pedido" || it.status === "preparando").length;
  }

  return (
    <div className="bg-ambience" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Nav />

      {/* Header strip */}
      <div style={{
        padding: isMobile ? "16px 16px 0" : "20px 24px 0",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "space-between",
        gap: isMobile ? 12 : 0,
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, color: "#fef3c7", letterSpacing: "-0.02em" }}>
            Painel da casa
          </h1>
          <p style={{ fontSize: 12, color: "rgba(252,211,77,0.5)", marginTop: 4 }}>
            {ativas} mesa{ativas !== 1 ? "s" : ""} ativa{ativas !== 1 ? "s" : ""} · {livre} livre{livre !== 1 ? "s" : ""}
          </p>
        </div>

        <div style={{
          display: "flex", gap: 8,
          overflowX: isMobile ? "auto" : "visible",
          margin: isMobile ? "0 -16px" : 0,
          padding: isMobile ? "0 16px 2px" : 0,
        }}>
          <Stat label="Ocupadas" value={counts.ocupada || 0} color="#f59e0b" />
          <Stat label="Aguardando" value={counts.aguardando || 0} color="#ef4444" />
          <Stat label="Fechando" value={counts.fechando || 0} color="#10b981" />
        </div>
      </div>

      {/* Tables grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 16px 24px" : "22px 24px 28px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 12,
        }}>
          {tables.map((table) => (
            <MesaCard
              key={table.id}
              table={table}
              total={activeOrderTotal(table.id)}
              pending={pendingItemsCount(table.id)}
              onClick={() => router.push(`/mesa/${table.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      padding: "8px 14px", borderRadius: 12,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(245,158,11,0.12)",
      display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#fef3c7" }}>{value}</span>
        <span style={{ fontSize: 9, color: "rgba(252,211,77,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2, whiteSpace: "nowrap" }}>{label}</span>
      </div>
    </div>
  );
}

function MesaCard({ table, total, pending, onClick }: {
  table: Table; total: number; pending: number; onClick: () => void;
}) {
  const s = STATUS_STYLE[table.status];
  const label = ({
    livre: "Livre", ocupada: "Ocupada",
    aguardando: "Pedido novo", fechando: "Fechando conta",
  } as Record<TableStatus, string>)[table.status];

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.12 }}
      style={{
        position: "relative", padding: 16, borderRadius: 18,
        background: s.bg, border: `1px solid ${s.border}`,
        textAlign: "left", cursor: "pointer",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        display: "flex", flexDirection: "column", gap: 12,
        minHeight: 160,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(252,211,77,0.55)", marginBottom: 2, letterSpacing: "0.04em" }}>MESA</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#fef3c7", lineHeight: 1 }}>{String(table.number).padStart(2, "0")}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 20, background: "rgba(0,0,0,0.25)" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: s.text, whiteSpace: "nowrap" }}>{label}</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(252,211,77,0.55)", fontSize: 11 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Users size={12} /> {table.capacity}
        </span>
        {table.openedAt && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={12} /> {fmtMin(table.openedAt)}
          </span>
        )}
        {pending > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#fca5a5" }}>
            <ForkKnife size={12} /> {pending} no preparo
          </span>
        )}
      </div>

      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {total > 0 ? (
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fcd34d" }}>{fmtBRL(total)}</span>
        ) : (
          <span style={{ fontSize: 11, color: "rgba(252,211,77,0.3)" }}>—</span>
        )}
        {table.status === "livre" ? (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(252,211,77,0.5)" }}>
            <Plus size={11} weight="bold" /> Abrir
          </span>
        ) : (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: s.text }}>
            <CheckCircle size={11} weight="duotone" /> Ver comanda
          </span>
        )}
      </div>
    </motion.button>
  );
}
