import { prisma } from "@/lib/db";
import { ensureRtpController, decideWinWithRtp } from "@/lib/rtp";
import { getBus } from "@/lib/bus";
import { evaluateRisk } from "@/lib/risk";

export type Outcome = {
	win: boolean;
	payout: number;
	payoutMultiplier: number;
	result: any;
};

export async function playRtpRound(params: {
	gameKey: string;
	userId: string;
	betAmount: number;
	buildOutcome: (args: { betAmount: number; targetRtp: number; currentWagered: number; currentPaid: number; payload?: any }) => Outcome;
	payload?: any;
}) {
	const { gameKey, userId, betAmount, buildOutcome, payload } = params;
	const rtp = await ensureRtpController(gameKey, 0.3);
	const wallet = await prisma.wallet.findFirst({ where: { userId, currency: "USDT", chain: "TRON" } });
	if (!wallet) throw new Error("No wallet");
	if (Number(wallet.balance) < betAmount) throw new Error("Insufficient balance");

	const risk = await evaluateRisk(userId, gameKey, betAmount);
	if (!risk.allowed) throw new Error(`Risk check failed: ${risk.reasons?.join(", ")}`);

	const outcome = buildOutcome({
		betAmount,
		targetRtp: rtp.targetRtp,
		currentWagered: Number(rtp.currentWagered),
		currentPaid: Number(rtp.currentPaid),
		payload,
	});

	const result = await prisma.$transaction(async (tx) => {
		const round = await tx.gameRound.create({
			data: {
				game: { connect: { key: gameKey } },
				user: { connect: { id: userId } },
				betAmount,
				payoutAmount: outcome.payout,
				seedServer: "server",
				seedClient: "client",
				nonce: 0,
				resultJson: outcome.result,
				status: "SETTLED",
				settledAt: new Date(),
			},
		});
		await tx.bet.create({
			data: {
				roundId: round.id,
				userId,
				amount: betAmount,
				payoutMultiplier: outcome.payoutMultiplier,
				win: outcome.win,
			},
		});
		await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { decrement: betAmount } } });
		await tx.transaction.create({
			data: {
				userId,
				walletId: wallet.id,
				type: "BET",
				status: "CONFIRMED",
				amount: betAmount,
				currency: "USDT",
				metaJson: { game: gameKey },
			},
		});
		if (outcome.payout > 0) {
			await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: outcome.payout } } });
			await tx.transaction.create({
				data: {
					userId,
					walletId: wallet.id,
					type: "PAYOUT",
					status: "CONFIRMED",
					amount: outcome.payout,
					currency: "USDT",
					metaJson: { game: gameKey },
				},
			});
		}
		await tx.rTPController.update({
			where: { id: rtp.id },
			data: {
				currentWagered: { increment: betAmount },
				currentPaid: { increment: outcome.payout },
			},
		});
		return { roundId: round.id };
	});

	// Emit after commit
	getBus().emit("game_event", {
		gameKey,
		userId,
		betAmount,
		payout: outcome.payout,
		win: outcome.win,
		at: new Date().toISOString(),
		meta: outcome.result,
	});

	return outcome;
}

export function coinflipOutcome(args: { betAmount: number; targetRtp: number; currentWagered: number; currentPaid: number; payload?: any }): Outcome {
	const { betAmount, targetRtp, currentWagered, currentPaid } = args;
	const win = decideWinWithRtp({ wager: betAmount, targetRtp, currentWagered, currentPaid, baseWinChance: 0.3 });
	const payoutMultiplier = win ? 2.0 : 0;
	return { win, payout: win ? betAmount * payoutMultiplier : 0, payoutMultiplier, result: { side: Math.random() < 0.5 ? "HEADS" : "TAILS" } };
}

export function diceOutcome(args: { betAmount: number; targetRtp: number; currentWagered: number; currentPaid: number; payload?: any }): Outcome {
	const { betAmount, targetRtp, currentWagered, currentPaid, payload } = args;
	const target = Math.max(2, Math.min(98, Number(payload?.rollUnder ?? 50)));
	const baseWinChance = target / 100;
	const willWin = decideWinWithRtp({ wager: betAmount, targetRtp, currentWagered, currentPaid, baseWinChance });
	const roll = Math.floor(Math.random() * 100) + 1;
	const win = willWin && roll <= target;
	const payoutMultiplier = win ? Math.max(1.01, 0.99 / baseWinChance) : 0;
	return { win, payout: win ? betAmount * payoutMultiplier : 0, payoutMultiplier, result: { roll, target } };
}

export function rouletteOutcome(args: { betAmount: number; targetRtp: number; currentWagered: number; currentPaid: number; payload?: any }): Outcome {
	const { betAmount, targetRtp, currentWagered, currentPaid, payload } = args;
	const choice = (payload?.choice ?? "RED").toUpperCase();
	const baseWinChance = choice === "GREEN" ? 1 / 37 : 18 / 37;
	const willWin = decideWinWithRtp({ wager: betAmount, targetRtp, currentWagered, currentPaid, baseWinChance });
	const num = Math.floor(Math.random() * 37);
	const color: "RED" | "BLACK" | "GREEN" = num === 0 ? "GREEN" : Math.random() < 0.5 ? "RED" : "BLACK";
	const win = willWin && color === choice;
	const payoutMultiplier = choice === "GREEN" ? 14 : 2;
	return { win, payout: win ? betAmount * payoutMultiplier : 0, payoutMultiplier, result: { num, color, choice } };
}

export function plinkoOutcome(args: { betAmount: number; targetRtp: number; currentWagered: number; currentPaid: number; payload?: any }): Outcome {
	const { betAmount, targetRtp, currentWagered, currentPaid } = args;
	const multipliers = [0, 0.2, 0.5, 0.8, 1, 1.5, 2, 5, 10];
	const willWin = decideWinWithRtp({ wager: betAmount, targetRtp, currentWagered, currentPaid, baseWinChance: 0.3 });
	const idx = willWin ? Math.min(multipliers.length - 1, Math.floor(Math.random() * multipliers.length)) : Math.floor(Math.random() * 4);
	const m = multipliers[idx];
	const win = m > 1;
	return { win, payout: betAmount * m, payoutMultiplier: m, result: { slot: idx, multiplier: m } };
}

export function doubleOutcome(args: { betAmount: number; targetRtp: number; currentWagered: number; currentPaid: number; payload?: any }): Outcome {
	const { betAmount, targetRtp, currentWagered, currentPaid, payload } = args;
	const choice = (payload?.choice ?? "BLACK").toUpperCase();
	const baseWinChance = choice === "GREEN" ? 0.05 : 0.475;
	const willWin = decideWinWithRtp({ wager: betAmount, targetRtp, currentWagered, currentPaid, baseWinChance });
	const colors = ["GREEN", "BLACK", "RED"] as const;
	const landed = colors[Math.floor(Math.random() * colors.length)] as string;
	const win = willWin && landed === choice;
	const payoutMultiplier = choice === "GREEN" ? 14 : 2;
	return { win, payout: win ? betAmount * payoutMultiplier : 0, payoutMultiplier, result: { landed, choice } };
}

export function hiloOutcome(args: { betAmount: number; targetRtp: number; currentWagered: number; currentPaid: number; payload?: any }): Outcome {
	const { betAmount, targetRtp, currentWagered, currentPaid, payload } = args;
	const choice = (payload?.choice ?? "HIGH").toUpperCase();
	const baseWinChance = 0.5;
	const willWin = decideWinWithRtp({ wager: betAmount, targetRtp, currentWagered, currentPaid, baseWinChance });
	const card = Math.floor(Math.random() * 13) + 1; // 1..13
	const win = willWin && (choice === "HIGH" ? card >= 8 : card <= 6);
	const payoutMultiplier = 1.9;
	return { win, payout: win ? betAmount * payoutMultiplier : 0, payoutMultiplier, result: { card, choice } };
}

export function binsOutcome(args: { betAmount: number; targetRtp: number; currentWagered: number; currentPaid: number; payload?: any }): Outcome {
	const { betAmount, targetRtp, currentWagered, currentPaid, payload } = args;
	const bin = Number(payload?.bin ?? 5);
	const baseWinChance = 1 / 10;
	const willWin = decideWinWithRtp({ wager: betAmount, targetRtp, currentWagered, currentPaid, baseWinChance });
	const landed = Math.floor(Math.random() * 10) + 1;
	const win = willWin && landed === bin;
	const payoutMultiplier = 9.5;
	return { win, payout: win ? betAmount * payoutMultiplier : 0, payoutMultiplier, result: { landed, bin } };
}

export function wheelOutcome(args: { betAmount: number; targetRtp: number; currentWagered: number; currentPaid: number; payload?: any }): Outcome {
	const { betAmount, targetRtp, currentWagered, currentPaid, payload } = args;
	const segments = payload?.segments || [1, 1, 2, 3, 5, 10, 20];
	const willWin = decideWinWithRtp({ wager: betAmount, targetRtp, currentWagered, currentPaid, baseWinChance: 0.3 });
	const landedIdx = Math.floor(Math.random() * segments.length);
	const m = willWin ? segments[landedIdx] : 0;
	const win = m > 1;
	return { win, payout: betAmount * m, payoutMultiplier: m, result: { index: landedIdx, multiplier: m } };
}

export function blackjackOutcome(args: { betAmount: number; targetRtp: number; currentWagered: number; currentPaid: number; payload?: any }): Outcome {
	const { betAmount, targetRtp, currentWagered, currentPaid } = args;
	const willWin = decideWinWithRtp({ wager: betAmount, targetRtp, currentWagered, currentPaid, baseWinChance: 0.42 });
	const payoutMultiplier = willWin ? 2 : 0;
	return { win: willWin, payout: willWin ? betAmount * payoutMultiplier : 0, payoutMultiplier, result: { player: [10, 11], dealer: [10, 9] } };
}

export function slotOutcome(args: { betAmount: number; targetRtp: number; currentWagered: number; currentPaid: number; payload?: any }): Outcome {
	const { betAmount, targetRtp, currentWagered, currentPaid } = args;
	const willWin = decideWinWithRtp({ wager: betAmount, targetRtp, currentWagered, currentPaid, baseWinChance: 0.30 });
	const multipliers = [0, 0, 0.5, 1, 2, 5, 10, 20, 50, 100];
	const m = willWin ? multipliers[Math.floor(Math.random() * multipliers.length)] : 0;
	return { win: m > 1, payout: betAmount * m, payoutMultiplier: m, result: { reels: [["A","K","Q"],["J","10","A"],["Q","K","9"]], multiplier: m } };
}