import { EventEmitter } from "events";

let bus: EventEmitter | null = null;

export function getBus(): EventEmitter {
	if (!bus) bus = new EventEmitter();
	return bus;
}

export type GameEvent = {
	gameKey: string;
	userId: string;
	betAmount: number;
	payout: number;
	win: boolean;
	at: string;
	meta?: any;
};