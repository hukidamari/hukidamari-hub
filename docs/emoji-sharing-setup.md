# 認証と共有素材の接続

## 開発環境

localhostも本番と同じDiscord OAuth・Supabase APIを使う。ログインを省略する開発用ユーザーや、保存成功を返す仮APIは設けない。設定がない状態でもローカル画像・テキストの編集とPNG保存は利用できる。

開発用のDiscordアプリ、テスト用Discordサーバー、本番と分けたSupabaseプロジェクトを用意する。Supabase AuthのDiscordプロバイダー設定は不要。認証はNext.jsがDiscordへ直接接続し、Supabaseは非公開の素材DB・Storageとして使う。Botの招待やBotトークンもこの段階では不要。

### Discord

1. [Discord Developer Portal](https://discord.com/developers/applications)で開発用アプリを作成する。
2. OAuth2のRedirectsへ `http://localhost:3000/api/auth/discord/callback` を登録する。
3. Client IDとClient Secretを `.env.local` の `DISCORD_CLIENT_ID`・`DISCORD_CLIENT_SECRET` に設定する。
4. テスト用DiscordサーバーのIDを `DISCORD_GUILD_ID` に設定する（Discordの開発者モードでコピー可能）。

要求するスコープは `identify guilds` のみ。メールアドレスやメッセージは取得しない。サーバー一覧から対象サーバーへの所属・所有者・Administrator権限を判定する。サーバー管理（Manage Guild）だけでは素材管理者にしない。[Discord OAuth2](https://docs.discord.com/developers/topics/oauth2)、[Get Current User Guilds](https://docs.discord.com/developers/resources/user#get-current-user-guilds)。

### Supabase

1. 開発用の専用プロジェクトを作成する。Freeプランで利用する構成で、有料プランへの変更は不要。
2. SQL Editorで `supabase/migrations/202610180001_emoji_assets.sql` を実行する。テーブル・容量予約関数・非公開の `emoji-assets` バケットを作成する。既存の本番プロジェクトへ検証目的で実行しない。
3. Project URLを `SUPABASE_URL`、service role keyを `SUPABASE_SERVICE_ROLE_KEY` に設定する。

DBはRLSを有効にし、anon・authenticatedロールからの操作と予約関数の実行を拒否する。Storageもクライアント用の許可ポリシーを作らない。service role keyはサーバーのみに置く。[Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)。

### セッションと起動

`.env.sample` のキーを参考に `.env.local` へ設定する。`SESSION_PASSWORD` は次のコマンドで生成した32文字以上のランダム値を使う。秘密情報をコミット・チャットへ貼り付けない。

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

```dotenv
SITE_URL=http://localhost:3000
DISCORD_CLIENT_ID=開発用アプリのID
DISCORD_CLIENT_SECRET=開発用アプリの秘密鍵
DISCORD_GUILD_ID=テスト用サーバーのID
SESSION_PASSWORD=生成したランダム値
SUPABASE_URL=https://プロジェクトID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=サーバー専用キー
```

Node.js 22.13以降を使用し、環境変数を変更したら開発サーバーを再起動する。`http://localhost:3000/emoji` を開く。`127.0.0.1` と `localhost` はCookieの保存先が異なるため、`SITE_URL` とブラウザのホスト名を揃える。

ログインは別タブで開く。認証後は元のタブへ戻るとログイン状態を再取得するため、編集中のレイヤーは維持できる。

## 本番・Preview

本番には本番用Discordアプリ・サーバー・Supabase・別の `SESSION_PASSWORD` を設定する。VercelのProduction環境だけに本番の秘密情報を置き、Previewへコピーしない。

`SITE_URL` は本番のHTTPSオリジンに設定し、その `/api/auth/discord/callback` をDiscordのRedirectsへ登録する。HTTPSでは `__Host-` CookieにSecure・HttpOnly・SameSite=Laxを設定する。HTTPはlocalhost等のループバック開発環境に限る。

Previewで認証を試すときは、固定したPreviewドメインのRedirectsと開発用接続情報を用意する。未設定のPreviewではエディタのみ利用できる。

## 保存と権限

- 「画像」: 端末内だけで使い、サーバーへ送らない。
- 「共有素材 → 素材を登録 → サーバーに共有」: 指定したサーバー内で共有する。登録後は一覧の画像を押してレイヤーに追加する。
- 全メンバーが一覧・追加・利用可能。本人とDiscordのサーバー所有者・Administratorだけが名前変更・削除可能。ファイル自体の変更は削除・再登録する。
- ログアウト後も編集中のレイヤーは残るが、共有素材の新たな取得や操作はできない。一度取得・保存した画像の回収はしない。
- ログインは最長7日かDiscordトークンの期限まで。期限切れは再ログインする。読み取りの所属・権限情報は最大60秒再利用し、変更操作は毎回検証する。Discord障害・429時に認証を省略しない。
- 読み取り結果・画像は `private, no-store`。公開URLや無認証のサムネイルを作らない。

Vercelのリクエストサイズ制限に収めるため、共有画像は1枚4 MiBまで。PNG/JPEG/WebPの静止画像を最大1600万画素までデコードし、メタデータを除いた可逆WebPで保存する。変換後4 MiBを超える場合も拒否する。

素材全体の上限は専用プロジェクトあたり128 MiB・500件。複数サーバーで使う場合もこの合計を超えない。無料枠内でも転送量などは利用状況に依存するため、Supabaseの使用量を確認する。

登録は `pending → ready`、削除は `ready → deleting → レコード削除`。StorageとDBは同一トランザクションにできないため、失敗時は容量予約を残して過少計上を防ぐ。中断した登録は10分後に本人・管理者が一覧から削除できる。削除未完了は同じ削除操作で再試行できる。管理者がDB行だけを削除するとStorageの容量が残るため、通常は画面の削除操作を使う。

## 検証

```sh
pnpm test:emoji
pnpm exec tsc --noEmit
pnpm lint
SITE_URL=http://localhost:3000 pnpm build
pnpm test:emoji:http
```

`test:emoji` は画像実データ・本文サイズ・Origin・Cookie改ざん・Discord応答の異常と、保存・失敗時の後始末の順序を検証する。DBテストはPGlite上で同じマイグレーションを実行し、匿名・authenticatedの拒否、容量予約と上限、中断した処理の計上を確認する。

`test:emoji:http` はビルド済みのNext.jsを空きポートで一時起動する。テスト専用に生成したセッション鍵とダミーのアプリIDをプロセスへ渡し、未ログイン・改ざん・期限切れ・別サーバーのCookieや外部Originの拒否、OAuth state・PKCE・issuer検証を実際のHTTPルートで確認する。Discord・Supabaseへは接続せず、実ユーザーの代わりにはしない。

接続設定後はテストサーバーのメンバー2名と管理者で、ログイン・メンバー外の拒否・素材登録・別メンバーからの利用・本人と管理者のみの変更/削除・ログアウト・再ログインを確認する。本番への公開前にこの実接続確認を完了する。

実装時に型チェック・lint・本番ビルド、12件の単体/DB/保存処理テストとHTTP認証テストを実行した。lintは既存の未使用変数8件の警告のみ。ego-browserではPC画面で未設定時の表示と共有ダイアログ、APIが準備中として拒否することを確認した。Discord・Supabaseの実接続設定は未入力のため、実アカウントでのログイン・共有素材の保存と利用は未確認。
