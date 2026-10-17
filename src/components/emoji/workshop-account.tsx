"use client";

import { useCallback, useEffect, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import type { WorkshopIdentity } from "@/lib/emoji/shared";
import styles from "./shared-assets.module.css";

export class WorkshopRequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export async function workshopRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, cache: "no-store" });
  const value = await response.json();
  if (!response.ok) throw new WorkshopRequestError(value.error || "処理できませんでした。もう一度お試しください。", response.status);
  return value as T;
}
const loginErrors: Record<string, string> = {
  cancelled: "ログインをキャンセルしました。", not_member: "このサーバーのメンバーだけが共有素材を利用できます。",
  invalid_state: "ログインの有効期限が切れました。もう一度お試しください。", oauth_failed: "ログインできませんでした。もう一度お試しください。",
  discord_unavailable: "Discordへ接続できません。少し待って再試行してください。",
};
export function useWorkshopIdentity() {
  const [identity, setIdentity] = useState<WorkshopIdentity | null>(null);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try { const next = await workshopRequest<WorkshopIdentity>("/api/auth/session"); setIdentity(next); setError(""); }
    catch (error) {
      if (error instanceof WorkshopRequestError && [401, 403].includes(error.status)) setIdentity(previous => previous ? { ...previous, user: null, guild: null } : null);
      setError(error instanceof Error ? error.message : "ログイン状態を取得できませんでした。");
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(window.location.search);
    const code = params.get("auth_error");
    void workshopRequest<WorkshopIdentity>("/api/auth/session", { signal: controller.signal }).then(next => {
      setIdentity(next); setError(code ? loginErrors[code] || loginErrors.oauth_failed : "");
    }).catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "ログイン状態を取得できませんでした。"); });
    if (code) {
      // Show the callback result once, then keep the code out of copied links.
      const url = new URL(window.location.href); url.searchParams.delete("auth_error");
      window.history.replaceState(window.history.state, "", url);
    }
    const focus = () => { void refresh(); };
    window.addEventListener("focus", focus);
    return () => { controller.abort(); window.removeEventListener("focus", focus); };
  }, [refresh]);
  return { identity, error, refresh, setError };
}

export function WorkshopAccount({ identity, error, onRefresh, onError }: { identity: WorkshopIdentity | null; error: string; onRefresh: () => Promise<void>; onError: (value: string) => void }) {
  const [busy, setBusy] = useState(false);
  return <div className={styles.account}>
    {error && <button type="button" className={styles.accountError} title={error} onClick={() => { void onRefresh(); }}>ログイン状態を再確認</button>}
    {identity?.user ? <>
      <span title={identity.user.name}>{identity.user.name}</span>
      <button type="button" aria-label="ログアウト" title="ログアウト" disabled={busy} onClick={async () => {
        setBusy(true);
        try { await workshopRequest("/api/auth/logout", { method: "POST" }); await onRefresh(); }
        catch (error) { onError(error instanceof Error ? error.message : "ログアウトできませんでした。"); }
        finally { setBusy(false); }
      }}><LogOut size={15} /></button>
    </> : identity?.configured ? <a href="/api/auth/discord" target="_blank" rel="noopener" title="別タブでログインします。編集内容はこのタブに残ります。"><LogIn size={15} />Discordでログイン</a> : <span className={styles.unavailable} title="Discord認証の接続設定が必要です">{identity ? "ログイン準備中" : "確認中…"}</span>}
  </div>;
}
