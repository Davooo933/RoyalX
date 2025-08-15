import crypto from "crypto";
import { prisma } from "@/lib/db";

export type ProvablyFairInput = {
	serverSeed: string;
	clientSeed: string;
	nonce: number;
	modulo: number;
};

export function hmacToFloat({ serverSeed, clientSeed, nonce, modulo }: ProvablyFairInput): number {
	const payload = `${clientSeed}:${nonce}`;
	const hmac = crypto.createHmac("sha256", serverSeed).update(payload).digest("hex");
	let index = 0;
	while (index + 5 <= hmac.length) {
		const slice = hmac.substring(index, index + 5);
		const value = parseInt(slice, 16);
		if (value < 1_000_000) {
			return (value % modulo) / modulo;
		}
		index += 5;
	}
	return parseInt(hmac.substring(hmac.length - 5), 16) / 0xfffff;
}

export async function getCurrentRtp(gameKey?: string) {
	const rtp = await prisma.rTPController.findFirst({
		where: gameKey ? { game: { key: gameKey } } : { scope: "GLOBAL" },
	});
	return rtp;
}

export async function ensureRtpController(gameKey?: string, defaultTarget = 0.3) {
	if (gameKey) {
		let game = await prisma.game.findUnique({ where: { key: gameKey } });
		if (!game) {
			game = await prisma.game.create({ data: { key: gameKey, name: gameKey, category: "MINI", rtpTarget: defaultTarget } });
		}
		let entry = await prisma.rTPController.findFirst({ where: { gameId: game.id } });
		if (!entry) {
			entry = await prisma.rTPController.create({ data: { gameId: game.id, targetRtp: defaultTarget } });
		}
		return entry;
	}
	let global = await prisma.rTPController.findFirst({ where: { scope: "GLOBAL" } });
	if (!global) {
		global = await prisma.rTPController.create({ data: { scope: "GLOBAL", targetRtp: defaultTarget } });
	}
	return global;
}

export function decideWinWithRtp({
	wager: _wager,
	currentWagered,
	currentPaid,
	targetRtp,
	baseWinChance = 0.30,
}: {
	wager: number;
	currentWagered: number;
	currentPaid: number;
	targetRtp: number;
	baseWinChance?: number;
}) {
	const realizedRtp = currentWagered > 0 ? currentPaid / currentWagered : 0;
	let winChance = baseWinChance;
	if (realizedRtp < targetRtp) {
		winChance = Math.min(0.85, baseWinChance + (targetRtp - realizedRtp) * 0.5);
	} else if (realizedRtp > targetRtp) {
		winChance = Math.max(0.05, baseWinChance - (realizedRtp - targetRtp) * 0.5);
	}
	const random = Math.random();
	return random < winChance;
}