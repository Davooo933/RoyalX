import type { Card } from './deck';

export type HandRank = {
  category: number; // 0..9 (high card..straight flush)
  primary: number[]; // tie breakers
};

export function evaluateFive(cards: Card[]): HandRank {
  const primary = cards.map(c => c.rank).sort((a,b)=>b-a);
  return { category: 0, primary };
}

export function compareHands(a: HandRank, b: HandRank): number {
  if (a.category !== b.category) return a.category - b.category;
  for (let i = 0; i < Math.max(a.primary.length, b.primary.length); i++) {
    const av = a.primary[i] ?? 0;
    const bv = b.primary[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

import type { Card } from ./deck;

export type HandRank = {
  category: number; // 0..9 (high card..straight flush)
  primary: number[]; // tie breakers
};

export function evaluateFive(cards: Card[]): HandRank {
  const primary = cards.map(c => c.rank).sort((a,b)=>b-a);
  return { category: 0, primary };
}

export function compareHands(a: HandRank, b: HandRank): number {
  if (a.category !== b.category) return a.category - b.category;
  for (let i = 0; i < Math.max(a.primary.length, b.primary.length); i++) {
    const av = a.primary[i] ?? 0;
    const bv = b.primary[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}
