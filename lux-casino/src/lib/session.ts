import { SessionOptions, getIronSession } from "iron-session";
import { cookies } from "next/headers";

export type SessionUser = {
	id: string;
	email: string;
	role: "ADMIN" | "USER";
};

export type AppSession = {
	user?: SessionUser;
};

export const sessionOptions: SessionOptions = {
	cookieName: process.env.IRON_SESSION_COOKIE_NAME || "lux_casino_session",
	password: process.env.IRON_SESSION_PASSWORD || "",
	cookieOptions: {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
	},
};

export async function getSession() {
	const store = await cookies();
	return getIronSession<AppSession>(store, sessionOptions);
}