import { describe, it, expect } from 'vitest';
import { generateStandardDeck } from './deck';
import { provablyFairShuffle, fisherYatesShuffle } from './shuffle';

describe('shuffle', () => {
  it('is deterministic for same seed+nonce', () => {
    const deck = generateStandardDeck();
    const seed = 'a'.repeat(64);
    const a = provablyFairShuffle(deck, seed, 1);
    const b = provablyFairShuffle(deck, seed, 1);
    expect(a.deck).toEqual(b.deck);
    expect(a.proof.deckHash).toEqual(b.proof.deckHash);
  });

  it('fisher-yates uses rng', () => {
    const arr = [1,2,3,4,5];
    const rng = (() => {
      let i = 0; const vals = [0.1, 0.2, 0.3, 0.4];
      return () => vals[i++ % vals.length];
    })();
    const out = fisherYatesShuffle(arr, rng);
    expect(out.length).toBe(5);
  });
});

