import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("migration enforces private access, asset validation, quota reservations and recovery accounting", async () => {
  const db = new PGlite();
  try {
    // Supabase supplies these roles/schema. The actual migration is executed unchanged.
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema storage;
      create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);`);
    await db.exec(await readFile(new URL("../supabase/migrations/202610180001_emoji_assets.sql", import.meta.url), "utf8"));
    assert.equal((await db.query<{ public: boolean }>("select public from storage.buckets where id = 'emoji-assets'")).rows[0].public, false);
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      await assert.rejects(db.query("select * from public.emoji_assets"), /permission denied/);
      await assert.rejects(db.query("select * from public.reserve_emoji_asset('00000000-0000-4000-8000-000000000001', '123456789012345678', '223456789012345678', 'owner', 'asset', 100, 32, 32)"), /permission denied/);
      await db.exec("reset role");
    }
    await db.exec("set role service_role");
    const reserve = (id: number, bytes = 4194304) => db.query(`select * from public.reserve_emoji_asset($1, '123456789012345678', '223456789012345678', 'owner', 'asset', $2, 32, 32)`, [`00000000-0000-4000-8000-${String(id).padStart(12, "0")}`, bytes]);
    for (let id = 1; id <= 32; id++) await reserve(id);
    await assert.rejects(reserve(33, 1), /asset_quota_exceeded/);
    await db.exec("update public.emoji_assets set status = 'deleting'");
    await assert.rejects(reserve(34, 1), /asset_quota_exceeded/); // Interrupted deletes still consume quota.
    await db.exec("delete from public.emoji_assets where id = '00000000-0000-4000-8000-000000000001'");
    await reserve(35); // Only confirmed deletion releases capacity.
    await db.exec("delete from public.emoji_assets");
    for (let id = 1; id <= 500; id++) await reserve(id, 1);
    await assert.rejects(reserve(501, 1), /asset_quota_exceeded/);
    await db.exec("delete from public.emoji_assets");
    await assert.rejects(reserve(1, 4194305), /check constraint/);
    await assert.rejects(db.query("insert into public.emoji_assets (id,guild_id,owner_id,owner_name,name,bytes,width,height) values ('00000000-0000-4000-8000-000000000001','invalid','223456789012345678','owner','asset',1,32,32)"), /check constraint/);
  } finally { await db.close(); }
});
