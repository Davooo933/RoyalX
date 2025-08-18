import { createHmac, createHash, hkdfSync, randomBytes } from 'node:crypto';
import type { Card } from './deck';

export type ShuffleProof = {
  seedHex: string;
  nonce: number;
  deckHash: string;
};

export function fisherYatesShuffle<T>(array: T[], randomFloat: () => number): T[] {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const r = randomFloat();
    const j = Math.floor(r * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createSeededRng(seed: Uint8Array, nonce: number): () => number {
  const salt = Buffer.from('poker-shuffle');
  const info = Buffer.from(`deck-nonce-${nonce}`);
  const key = hkdfSync('sha256', seed, salt, info, 32);
  let counter = 0;
  let buffer = Buffer.alloc(0);

  const refill = () => {
    const h = createHmac('sha256', key).update(Buffer.from(counter.toString())).digest();
    counter += 1;
    buffer = Buffer.concat([buffer, h]);
  };

  return () => {
    if (buffer.length < 4) refill();
    const chunk = buffer.subarray(0, 4);
    buffer = buffer.subarray(4);
    const value = chunk.readUInt32BE(0);
    return value / 2 ** 32;
  };
}

export function provablyFairShuffle(deck: Card[], seedHex?: string, nonce: number = 0): { deck: Card[]; proof: ShuffleProof } {
  const seed = seedHex ? Buffer.from(seedHex, 'hex') : randomBytes(32);
  const rng = createSeededRng(seed, nonce);
  const shuffled = fisherYatesShuffle(deck, rng);
  const deckBytes = Buffer.from(JSON.stringify(shuffled));
  const deckHash = createHash('sha256').update(deckBytes).digest('hex');
  return { deck: shuffled, proof: { seedHex: seed.toString('hex'), nonce, deckHash } };
}

import { createHmac, createHash, hkdfSync, randomBytes } from node:crypto;
import type { Card } from ./deck;

export type ShuffleProof = {
  seedHex: string;
  nonce: number;
  deckHash: string;
};

export function fisherYatesShuffle<T>(array: T[], randomFloat: () => number): T[] {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const r = randomFloat();
    const j = Math.floor(r * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createSeededRng(seed: Uint8Array, nonce: number): () => number {
  const salt = Buffer.from(poker-shuffle);
  const info = Buffer.from(`deck-nonce-${nonce}`);
  const key = hkdfSync(sha256, seed, salt, info, 32);
  let counter = 0;
  let buffer = Buffer.alloc(0);

  const refill = () => {
    const h = createHmac(sha256, key).update(Buffer.from(counter.toString())).digest();
    counter += 1;
    buffer = Buffer.concat([buffer, h]);
  };

  return () => {
    if (buffer.length < 4) refill();
    const chunk = buffer.subarray(0, 4);
    buffer = buffer.subarray(4);
    const value = chunk.readUInt32BE(0);
    return value / 2 ** 32;
  };
}

export function provablyFairShuffle(deck: Card[], seedHex?: string, nonce: number = 0): { deck: Card[]; proof: ShuffleProof } {
  const seed = seedHex ? Buffer.from(seedHex, hex) : randomBytes(32);
  const rng = createSeededRng(seed, nonce);
  const shuffled = fisherYatesShuffle(deck, rng);
  const deckBytes = Buffer.from(JSON.stringify(shuffled));
  const deckHash = createHash(sha256).update(deckBytes).digest(hex);
  return { deck: shuffled, proof: { seedHex: seed.toString(hex), nonce, deckHash } };
}
