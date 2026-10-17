import { api, privateJson } from "@/lib/server/http";
import { authConfig, storageConfigured } from "@/lib/server/workshop-config";
import { loginSession, requireMember } from "@/lib/server/workshop-session";

export const runtime = "nodejs";
export async function GET() {
  return api(async () => {
    const configured = Boolean(authConfig());
    const base = { configured, storageConfigured: storageConfigured(), user: null, guild: null };
    if (!configured) return privateJson(base);
    const session = await loginSession();
    if (!session.user) return privateJson(base);
    return privateJson({ ...base, ...await requireMember() });
  });
}
