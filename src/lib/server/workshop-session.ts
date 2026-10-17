import "server-only";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { discordGuild } from "./discord";
import { ApiError } from "./http";
import { requireAuthConfig } from "./workshop-config";

export type Member = { user: { id: string; name: string }; guild: { id: string; name: string; isAdmin: boolean; canCreateEmoji?: boolean } };
type LoginSession = Member & { token: string; expiresAt: number; checkedAt: number };
type OAuthAttempt = { state: string; verifier: string; createdAt: number };
export async function loginSession() {
  const config = requireAuthConfig();
  return getIronSession<LoginSession>(await cookies(), {
    password: config.password, cookieName: config.secure ? "__Host-workshop" : "workshop", ttl: 7 * 86400,
    cookieOptions: { httpOnly: true, secure: config.secure, sameSite: "lax", path: "/" },
  });
}
export async function oauthAttempt() {
  const config = requireAuthConfig();
  return getIronSession<OAuthAttempt>(await cookies(), {
    password: config.password, cookieName: config.secure ? "__Host-workshop-oauth" : "workshop-oauth", ttl: 600,
    cookieOptions: { httpOnly: true, secure: config.secure, sameSite: "lax", path: "/" },
  });
}
export async function requireMember(fresh = false): Promise<Member> {
  const config = requireAuthConfig();
  const session = await loginSession();
  if (!session.user?.id || !session.token || !session.expiresAt || session.expiresAt <= Date.now() || session.guild?.id !== config.guildId) {
    session.destroy();
    throw new ApiError(401, "login_required", "Discordにログインしてください。");
  }
  // Read-only thumbnails reuse membership for at most a minute. Every mutation checks Discord again.
  if (fresh || !session.checkedAt || Date.now() - session.checkedAt >= 60_000) {
    try {
      session.guild = await discordGuild(session.token);
      session.checkedAt = Date.now();
      await session.save();
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) session.destroy();
      throw error;
    }
  }
  return { user: session.user, guild: session.guild };
}
