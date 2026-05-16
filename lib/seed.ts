import { MenuItem, Table } from "./types";

export const SEED_MENU: MenuItem[] = [
  {
    id: "m1", category: "entradas", available: true,
    name: "Bruschetta Trufada",
    description: "Pão rústico tostado, tomate confitado, manjericão e azeite de trufa",
    price: 28, image: "Pizza",
  },
  {
    id: "m2", category: "entradas", available: true,
    name: "Carpaccio de Mignon",
    description: "Lâminas finas de filé mignon, rúcula, parmesão e molho de mostarda",
    price: 42, image: "Plant",
  },
  {
    id: "m3", category: "entradas", available: true,
    name: "Polvo Grelhado",
    description: "Tentáculo de polvo na brasa, batata rústica e azeite cítrico",
    price: 56, image: "Fish",
  },
  {
    id: "m4", category: "principais", available: true,
    name: "Filé ao Molho Madeira",
    description: "Mignon grelhado ao ponto, molho madeira aveludado, batata gratinada",
    price: 89, image: "Hamburger",
  },
  {
    id: "m5", category: "principais", available: true,
    name: "Risoto de Funghi",
    description: "Arroz arbóreo cremoso, mix de cogumelos selvagens e parmesão 24 meses",
    price: 68, image: "Bowl",
  },
  {
    id: "m6", category: "principais", available: true,
    name: "Salmão Crocante",
    description: "Salmão grelhado, crosta de gergelim, purê de batata doce e legumes salteados",
    price: 78, image: "Fish",
  },
  {
    id: "m7", category: "principais", available: false,
    name: "Cordeiro ao Vinho",
    description: "Carré de cordeiro em redução de vinho tinto, batatas confitadas",
    price: 112, image: "ForkKnife",
  },
  {
    id: "m8", category: "bebidas", available: true,
    name: "Vinho Malbec (taça)",
    description: "Mendoza, Argentina · Notas frutadas e taninos suaves",
    price: 32, image: "Wine",
  },
  {
    id: "m9", category: "bebidas", available: true,
    name: "Drink da Casa",
    description: "Gin, cucumber, hortelã, tônica artesanal",
    price: 38, image: "Martini",
  },
  {
    id: "m10", category: "bebidas", available: true,
    name: "Água com gás 500ml",
    description: "Mineral natural",
    price: 9, image: "Drop",
  },
  {
    id: "m11", category: "bebidas", available: true,
    name: "Suco Verde",
    description: "Couve, limão, gengibre, abacaxi e hortelã",
    price: 16, image: "Plant",
  },
  {
    id: "m12", category: "sobremesas", available: true,
    name: "Petit Gateau",
    description: "Bolinho de chocolate quente com sorvete de creme",
    price: 28, image: "Cake",
  },
  {
    id: "m13", category: "sobremesas", available: true,
    name: "Cheesecake de Frutas Vermelhas",
    description: "Base crocante, creme suave, calda artesanal",
    price: 24, image: "IceCream",
  },
];

export const SEED_TABLES: Table[] = [
  { id: "t1", number: 1, capacity: 2, status: "livre" },
  { id: "t2", number: 2, capacity: 4, status: "ocupada", openedAt: Date.now() - 1000 * 60 * 35 },
  { id: "t3", number: 3, capacity: 2, status: "livre" },
  { id: "t4", number: 4, capacity: 6, status: "ocupada", openedAt: Date.now() - 1000 * 60 * 18 },
  { id: "t5", number: 5, capacity: 4, status: "aguardando", openedAt: Date.now() - 1000 * 60 * 5 },
  { id: "t6", number: 6, capacity: 2, status: "livre" },
  { id: "t7", number: 7, capacity: 4, status: "livre" },
  { id: "t8", number: 8, capacity: 8, status: "fechando", openedAt: Date.now() - 1000 * 60 * 90 },
];
