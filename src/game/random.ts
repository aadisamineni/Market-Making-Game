import type { RandomSource } from '../domain/types';

export const cryptoRandomSource: RandomSource = {
  int(maxExclusive: number): number {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
      throw new Error('maxExclusive must be a positive integer.');
    }
    const cryptoApi = globalThis.crypto;
    if (cryptoApi?.getRandomValues) {
      const maxUint = 0xffffffff;
      const bucketSize = Math.floor((maxUint + 1) / maxExclusive) * maxExclusive;
      const value = new Uint32Array(1);
      do {
        cryptoApi.getRandomValues(value);
      } while (value[0] >= bucketSize);
      return value[0] % maxExclusive;
    }
    return Math.floor(Math.random() * maxExclusive);
  },
};

export const createSequenceRandomSource = (values: number[]): RandomSource => {
  let index = 0;
  return {
    int(maxExclusive: number): number {
      if (index >= values.length) {
        throw new Error('Deterministic random source exhausted.');
      }
      const value = values[index];
      index += 1;
      if (!Number.isInteger(value) || value < 0 || value >= maxExclusive) {
        throw new Error(`Deterministic value ${value} is invalid for range ${maxExclusive}.`);
      }
      return value;
    },
  };
};
