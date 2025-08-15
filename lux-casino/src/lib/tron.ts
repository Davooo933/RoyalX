let _tronWeb: any | null = null;

export function getTronWeb() {
	if (typeof window !== "undefined") return null;
	if (_tronWeb) return _tronWeb;
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const TronWeb = require("tronweb");
	const fullNode = process.env.TRON_FULL_NODE || "https://api.trongrid.io";
	const solidityNode = process.env.TRON_SOLIDITY_NODE || fullNode;
	const eventServer = process.env.TRON_EVENT_SERVER || fullNode;
	const privateKey = process.env.TRON_PRIVATE_KEY || "";
	_tronWeb = new TronWeb({ fullHost: fullNode, privateKey, fullNode, solidityNode, eventServer });
	return _tronWeb;
}

export function getUsdtContractAddress() {
	return process.env.USDT_TRC20_CONTRACT || "";
}

export async function getUsdtBalance(address: string): Promise<string> {
	const tronWeb = getTronWeb();
	if (!tronWeb) throw new Error("TronWeb unavailable on client");
	const contract = await tronWeb.contract().at(getUsdtContractAddress());
	const balance = await contract.balanceOf(address).call();
	return tronWeb.fromSun(balance.toString());
}

export async function transferUsdt(to: string, amountInUSDT: string) {
	const tronWeb = getTronWeb();
	if (!tronWeb) throw new Error("TronWeb unavailable on client");
	const contract = await tronWeb.contract().at(getUsdtContractAddress());
	const amountInSun = tronWeb.toSun(amountInUSDT);
	return contract.transfer(to, amountInSun).send();
}

export async function createTronAccount() {
	const tronWeb = getTronWeb();
	if (!tronWeb) throw new Error("TronWeb unavailable on client");
	return tronWeb.createAccount();
}