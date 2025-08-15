import { prisma } from "@/lib/db";

export type RiskDecision = { allowed: boolean; reasons?: string[] };

export async function getRiskValue(key: string, fallback: string): Promise<string> {
	const rule = await prisma.riskRule.findUnique({ where: { key } });
	return rule?.enabled ? rule.value : fallback;
}

export async function evaluateRisk(userId: string, gameKey: string, betAmount: number): Promise<RiskDecision> {
	const reasons: string[] = [];
	const maxBet = Number(await getRiskValue("max_bet_usdt", "1000"));
	if (betAmount > maxBet) reasons.push(`Bet exceeds max ${maxBet}`);

	const cooldownMs = Number(await getRiskValue("cooldown_ms", "1000"));
	const since = new Date(Date.now() - cooldownMs);
	const recent = await prisma.gameRound.count({ where: { userId, game: { key: gameKey }, startedAt: { gt: since } } });
	if (recent > 0) reasons.push("Cooldown active");

	const windowMs = Number(await getRiskValue("velocity_window_ms", "60000"));
	const windowSince = new Date(Date.now() - windowMs);
	const rounds = await prisma.gameRound.count({ where: { userId, startedAt: { gt: windowSince } } });
	const maxRounds = Number(await getRiskValue("max_rounds_window", "30"));
	if (rounds > maxRounds) reasons.push("Velocity exceeded");

	return { allowed: reasons.length === 0, reasons };
}