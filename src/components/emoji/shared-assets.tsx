"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Images, Plus, RefreshCw, X } from "lucide-react";
import { assetName, SHARED_IMAGE_BYTES, type SharedAsset, type WorkshopIdentity } from "@/lib/emoji/shared";
import { workshopRequest } from "./workshop-account";
import styles from "./shared-assets.module.css";

type AssetPage = { assets: SharedAsset[]; nextOffset: number | null };
function AssetCard({ asset, busy, canAdd, onUse, onRename, onDelete }: { asset: SharedAsset; busy: boolean; canAdd: boolean; onUse: () => void; onRename: (name: string) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(asset.name);
  const [confirming, setConfirming] = useState(false);
  return <li className={styles.card}>
    <button type="button" className={styles.assetPreview} disabled={busy || !canAdd || asset.status !== "ready"} aria-label={`${asset.name}をエディタに追加`} onClick={onUse}>
      {asset.status === "ready" ? <Image src={`/api/emoji/assets/${asset.id}/image`} alt={asset.name} width={180} height={120} unoptimized /> : <span>{asset.status === "pending" ? "登録未完了" : "削除未完了"}</span>}
      {asset.status === "ready" && <span className={styles.addHint}><Plus size={14} />追加</span>}
    </button>
    {editing ? <form className={styles.rename} onSubmit={event => { event.preventDefault(); if (assetName(name)) { onRename(name.trim()); setEditing(false); } }}>
      <input autoFocus aria-label="新しい素材名" maxLength={80} value={name} onChange={event => setName(event.target.value)} />
      <button disabled={busy || !assetName(name)}>保存</button><button type="button" onClick={() => setEditing(false)}>取消</button>
    </form> : <strong title={asset.name}>{asset.name}</strong>}
    <small title={asset.ownerName}>{asset.ownerName}</small>
    {asset.canManage && <div className={styles.cardActions}>
      {confirming ? <><span>削除しますか？</span><button type="button" disabled={busy} onClick={onDelete}>削除する</button><button type="button" onClick={() => setConfirming(false)}>取消</button></> : <>
        {asset.status === "ready" && <button type="button" disabled={busy} onClick={() => { setName(asset.name); setEditing(true); }}>名前を変更</button>}
        <button type="button" disabled={busy} onClick={() => setConfirming(true)}>{asset.status === "deleting" ? "削除を再試行" : "削除"}</button>
      </>}
    </div>}
  </li>;
}

export default function SharedAssets({ identity, identityError, canAdd, onUse, onRefreshIdentity }: { identity: WorkshopIdentity | null; identityError: string; canAdd: boolean; onUse: (file: File) => Promise<void>; onRefreshIdentity: () => Promise<void> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<SharedAsset[]>([]);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const uploadInput = useRef<HTMLInputElement>(null);
  const connected = Boolean(identity?.user && identity.storageConfigured);
  const load = useCallback(async (offset = 0) => {
    setLoading(true); setError("");
    try {
      const page = await workshopRequest<AssetPage>(`/api/emoji/assets?offset=${offset}`);
      setAssets(previous => offset === 0 ? page.assets : [...previous, ...page.assets.filter(asset => !previous.some(item => item.id === asset.id))]);
      setNextOffset(page.nextOffset);
    } catch (error) { setError(error instanceof Error ? error.message : "素材を取得できませんでした。"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (open && connected) void load(); }, [open, connected, identity?.user?.id, load]);
  useEffect(() => { if (!identity?.user) { setAssets([]); setNextOffset(null); } }, [identity?.user]);
  function close() { dialog.current?.close(); setOpen(false); }
  async function run(action: () => Promise<void>) {
    setBusy(true); setError("");
    try { await action(); }
    catch (error) { setError(error instanceof Error ? error.message : "処理できませんでした。"); }
    finally { setBusy(false); }
  }
  return <>
    <button type="button" className={styles.openLibrary} onClick={() => { setOpen(true); dialog.current?.showModal(); }}><Images size={15} />共有素材</button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="shared-assets-title" onClose={() => setOpen(false)} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const r = event.currentTarget.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close();
    }}>
      <header><div><h2 id="shared-assets-title">共有素材</h2><p>{identity?.guild?.name || "サーバーのメンバーと画像を共有"}</p></div><button type="button" aria-label="共有素材を閉じる" onClick={close}><X size={20} /></button></header>
      {!connected ? <div className={styles.empty}>
        {identityError ? <><p role="alert">{identityError}</p><button type="button" onClick={() => { void onRefreshIdentity(); }}>再確認</button></> : !identity ? <p>ログイン状態を確認中…</p> : !identity.configured ? <p>共有素材は準備中です。画像は「画像」から端末内で読み込めます。</p> : !identity.user ? <><p>Discordでログインすると、サーバーの共有素材を使えます。</p><a href="/api/auth/discord" target="_blank" rel="noopener">Discordでログイン</a><small>別タブでログイン後、このタブに戻ると編集を続けられます。</small></> : <p>共有素材の保存先を準備中です。</p>}
      </div> : <>
        <div className={styles.libraryTools}>
          <label className={styles.uploadButton}><Plus size={15} />素材を登録<input ref={uploadInput} type="file" accept="image/png,image/jpeg,image/webp" aria-label="共有する画像を選ぶ" disabled={busy || loading} onChange={event => {
            const selected = event.target.files?.[0];
            if (!selected) return;
            if (selected.size > SHARED_IMAGE_BYTES) { setError("共有画像は4 MiB以下にしてください。"); event.target.value = ""; return; }
            setError(""); setFile(selected); setName(selected.name.replace(/\.[^.]+$/, "").slice(0, 80));
          }} /></label>
          <span>PNG・JPEG・WebP / 4 MiBまで</span>
          <button type="button" aria-label="共有素材を更新" title="一覧を更新" disabled={busy || loading} onClick={() => { void load(); }}><RefreshCw size={15} /></button>
        </div>
        {file && <form className={styles.uploadForm} onSubmit={event => { event.preventDefault(); void run(async () => {
          const form = new FormData(); form.set("file", file); form.set("name", name.trim());
          const { asset } = await workshopRequest<{ asset: SharedAsset }>("/api/emoji/assets", { method: "POST", body: form });
          setAssets(previous => [asset, ...previous]); setFile(null); if (uploadInput.current) uploadInput.current.value = "";
        }); }}>
          <label>素材名<input autoFocus required maxLength={80} aria-label="登録する素材名" value={name} onChange={event => setName(event.target.value)} disabled={busy} /></label>
          <small title={file.name}>{file.name}</small>
          <button disabled={busy || !assetName(name)}>{busy ? "処理中…" : "サーバーに共有"}</button><button type="button" disabled={busy} onClick={() => { setFile(null); if (uploadInput.current) uploadInput.current.value = ""; }}>取消</button>
        </form>}
        {error && <p className={styles.error} role="alert">{error}</p>}
        {!canAdd && <p className={styles.notice}>レイヤーを削除すると素材を追加できます。</p>}
        <div className={styles.content} aria-busy={loading || busy}>
          {!assets.length && <p className={styles.empty}>{loading ? "素材を読み込み中…" : error ? "一覧を更新して再試行してください。" : "共有素材はまだありません。"}</p>}
          <ul className={styles.grid}>{assets.map(asset => <AssetCard key={asset.id} asset={asset} busy={busy || loading} canAdd={canAdd} onUse={() => { void run(async () => {
            const response = await fetch(`/api/emoji/assets/${asset.id}/image`, { cache: "no-store" });
            if (!response.ok) { const data = await response.json(); throw new Error(data.error || "画像を取得できませんでした。"); }
            await onUse(new File([await response.blob()], `${asset.name}.webp`, { type: "image/webp" })); close();
          }); }} onRename={name => { void run(async () => {
            const changed = await workshopRequest<{ asset: SharedAsset }>(`/api/emoji/assets/${asset.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
            setAssets(previous => previous.map(item => item.id === asset.id ? changed.asset : item));
          }); }} onDelete={() => { void run(async () => {
            await workshopRequest(`/api/emoji/assets/${asset.id}`, { method: "DELETE" }); setAssets(previous => previous.filter(item => item.id !== asset.id)); await load();
          }); }} />)}</ul>
          {nextOffset !== null && <button type="button" className={styles.more} disabled={busy || loading} onClick={() => { void load(nextOffset); }}>{loading ? "読み込み中…" : "もっと見る"}</button>}
        </div>
      </>}
    </dialog>
  </>;
}
