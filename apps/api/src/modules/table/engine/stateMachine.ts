import type { Card } from './deck';
import { createHmac } from 'node:crypto';

export type PlayerState = {
  userId: string;
  stackMinor: bigint;
  hole?: Card[];
  hasFolded: boolean;
  sittingOut: boolean;
};

export type TableState = {
  id: string;
  players: PlayerState[];
  community: Card[];
  potMinor: bigint;
  dealerIndex: number;
  street: 'pre' | 'flop' | 'turn' | 'river' | 'showdown';
  actionIndex: number;
};

export function computeStateHash(state: TableState, secret: string): string {
  const ordered = {
    id: state.id,
    players: state.players.map(p => ({ userId: p.userId, stackMinor: p.stackMinor.toString(), hasFolded: p.hasFolded, sittingOut: p.sittingOut })),
    community: state.community.map(c => `${c.rank}-${c.suit}`),
    potMinor: state.potMinor.toString(),
    dealerIndex: state.dealerIndex,
    street: state.street,
    actionIndex: state.actionIndex
  };
  const msg = JSON.stringify(ordered);
  return createHmac('sha256', secret).update(msg).digest('hex');
}

import type { Card } from ./deck;
import { createHmac } from node:crypto;

export type PlayerState = {
  userId: string;
  stackMinor: bigint;
  hole?: Card[];
  hasFolded: boolean;
  sittingOut: boolean;
};

export type TableState = {
  id: string;
  players: PlayerState[];
  community: Card[];
  potMinor: bigint;
  dealerIndex: number;
  street: pre | flop | turn | river | showdown;
  actionIndex: number;
};

export function computeStateHash(state: TableState, secret: string): string {
  const ordered = {
    id: state.id,
    players: state.players.map(p => ({ userId: p.userId, stackMinor: p.stackMinor.toString(), hasFolded: p.hasFolded, sittingOut: p.sittingOut })),
    community: state.community.map(c => `${c.rank}-${c.suit}`),
    potMinor: state.potMinor.toString(),
    dealerIndex: state.dealerIndex,
    street: state.street,
    actionIndex: state.actionIndex
  };
  const msg = JSON.stringify(ordered);
  return createHmac(sha256, secret).update(msg).digest(hex);
}
