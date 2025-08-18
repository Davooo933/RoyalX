export type Erc20Transfer = {
  txHash: string;
  from: string;
  to: string;
  value: string; // minor units as string
  blockNumber: number;
};

export async function getErc20Balance(_providerUrl: string, _contract: string, _address: string): Promise<string> {
  return '0';
}

export function validateEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Ethereum USDT (ERC20) helpers - stubbed without external deps
export type Erc20Transfer = {
  txHash: string;
  from: string;
  to: string;
  value: string; // minor units as string
  blockNumber: number;
};

export async function getErc20Balance(_providerUrl: string, _contract: string, _address: string): Promise<string> {
  // Implement via ethers in production
  return '0';
}

export function validateEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

