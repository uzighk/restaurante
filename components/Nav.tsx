"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Storefront, ForkKnife, ListChecks, ArrowsClockwise } from "@phosphor-icons/react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useIsMobile } from "@/hooks/useIsMobile";

const nav = [
  { href: "/", shortLabel: "Painel", label: "Painel", icon: Storefront, match: (p: string) => p === "/" || p.startsWith("/mesa") },
  { href: "/cozinha", shortLabel: "Cozinha", label: "Cozinha", icon: ListChecks, match: (p: string) => p === "/cozinha" },
  { href: "/cardapio/2", shortLabel: "Cardápio", label: "Cardápio (mesa 2)", icon: ForkKnife, match: (p: string) => p.startsWith("/cardapio") },
];

export function Nav() {
  const pathname = usePathname();
  const { resetData } = useRestaurant();
  const isMobile = useIsMobile();

  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 10, padding: isMobile ? "10px 14px" : "14px 22px", flexShrink: 0,
      background: "rgba(255, 251, 244, 0.85)",
      backdropFilter: "blur(24px) saturate(160%)",
      WebkitBackdropFilter: "blur(24px) saturate(160%)",
      borderBottom: "1px solid #f3ead9",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", flexShrink: 0 }}>
        <div style={{
          width: isMobile ? 30 : 32, height: isMobile ? 30 : 32, borderRadius: 10,
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(234,88,12,0.25)",
        }}>
          <ForkKnife size={15} weight="duotone" color="#ffffff" />
        </div>
        {!isMobile && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#44362a", letterSpacing: "-0.01em" }}>Tavola</div>
            <div style={{ fontSize: 10, color: "#978368", marginTop: 1, whiteSpace: "nowrap" }}>Sistema de Restaurante</div>
          </div>
        )}
        {isMobile && (
          <div style={{ fontSize: 14, fontWeight: 700, color: "#44362a", letterSpacing: "-0.01em" }}>Tavola</div>
        )}
      </Link>

      <nav style={{ display: "flex", gap: 4, alignItems: "center", minWidth: 0 }}>
        {nav.map(({ href, shortLabel, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href} href={href}
              title={label}
              style={{
                display: "flex", alignItems: "center", gap: isMobile ? 0 : 7,
                padding: isMobile ? "8px 10px" : "8px 14px", borderRadius: 11,
                background: active ? "#fff7ed" : "transparent",
                border: active ? "1px solid #fdba74" : "1px solid transparent",
                color: active ? "#c2410c" : "#978368",
                fontSize: 12.5, fontWeight: active ? 600 : 500,
                textDecoration: "none", transition: "all 0.15s", whiteSpace: "nowrap",
              }}
            >
              <Icon size={14} weight={active ? "duotone" : "regular"} color={active ? "#ea580c" : "#978368"} />
              {!isMobile && shortLabel}
              {isMobile && active && <span style={{ marginLeft: 6 }}>{shortLabel}</span>}
            </Link>
          );
        })}
        <button
          onClick={() => { if (confirm("Resetar todos os dados (menu, mesas, comandas)?")) resetData(); }}
          title="Resetar dados"
          style={{
            marginLeft: 6, width: 32, height: 32, borderRadius: 10,
            background: "#ffffff", border: "1px solid #f3ead9",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#978368", cursor: "pointer", flexShrink: 0,
          }}
        >
          <ArrowsClockwise size={12} />
        </button>
      </nav>
    </header>
  );
}
