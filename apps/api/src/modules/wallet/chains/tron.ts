export type Trc20Transfer = {
  txHash: string;
  from: string;
  to: string;
  value: string; // minor units as string
  blockNumber: number;
};

export function validateTronAddress(address: string): boolean {
  return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address);
}

