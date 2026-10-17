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
- 「共有素材 → 画像を登録／今の画像を共有 → サーバーに共有」: 指定したサーバー内で共有する。登録後は一覧の画像を押してレイヤーに追加する。
- 共有素材はエディタ左側に常時表示し、ログイン後に一覧を取得する。登録時だけプレビュー・素材名の確認ダイアログを開く。「今の画像を共有」はキャンバスの合成結果を画像として保存し、編集レシピは保存しない。
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


## Discordサーバーへの絵文字登録

ヘッダーの「サーバーに追加」から、画像・名前・登録先を確認して登録する。ログイン中のユーザーが対象サーバーの所有者、Administrator、または `CREATE_GUILD_EXPRESSIONS`（絵文字を作成、bit 43）を持つ場合に利用できる。所属だけでは登録不可。`MANAGE_GUILD_EXPRESSIONS` 単独も作成権限として扱わない。送信と結果確認のたびにDiscord OAuthで所属・権限を再取得する。

### 接続設定

1. 開発用DiscordアプリのBotページでTokenを取得し、Git管理外の `.env.local` に `DISCORD_BOT_TOKEN` を設定する。OAuthのClient Secretとは別の値。既存BotのTokenを不用意にリセットしない。
2. Botを対象のテストサーバーに招待する。OAuth2 URL Generatorで `bot` スコープと `Create Expressions` 権限（`8796093022208`）を選ぶ。Administrator権限、Gateway接続、特権Intent、ebifryとの通信は不要。
3. 開発用SupabaseのSQL Editorで `supabase/migrations/202610180002_emoji_registrations.sql` を適用する。登録記録と重複送信防止の予約関数が作られる。匿名・authenticatedからの直接操作は禁止。
4. 開発サーバーを再起動する。`/api/auth/session` の `registrationConfigured` は必要な環境変数の有無を表すだけで、Botの招待・権限・DBの適用成功までは保証しない。
5. 権限を持つ実アカウントで確認ダイアログから登録し、Discordの絵文字一覧で結果を確認する。実サーバーへのテスト登録はユーザーが確認した画像・名前で行う。

### APIと制限

- `POST /api/emoji/register`: 同一Origin/Host、毎回の所属・作成権限確認。multipartの `requestId`（UUID v4）、`name`、`file` を受け取る。サーバーID・ユーザーIDは認証情報から取得。
- 名前は半角英数字・アンダースコア2〜32文字。同名（大文字小文字を無視）は登録前に拒否する。
- 画像は128×128の静止PNG、256 KiB以下。実データの形式・寸法・アニメーションを検証し、サーバー側でPNGに再エンコードしてメタデータを除去する。
- Bot TokenでDiscordのCreate Guild Emojiへ直接登録する。監査理由に操作ユーザーIDと登録番号を含める。空き枠はDiscordの実際の応答（30008）で判定し、枠数を固定値で推測しない。
- `GET /api/emoji/register?requestId=...`: 本人の登録結果を再確認する。画像を再送しない。
- 登録結果は `pending / succeeded / failed / unknown`。結果不明時は自動で再送しない。同じ登録番号は保存済み結果を返し、内容の差し替えは拒否。同じサーバー・名前の処理中/結果不明記録があれば新しい番号でも拒否する。
- Supabaseのトランザクション内でサーバー単位に予約を直列化する。直近60秒の処理中登録がある間は次の登録を止める。Discordの429やrate-limitヘッダーによる待ち時間をDBへ保存し、次回の登録でも尊重する。
- アプリ独自の連続操作制限はユーザーごとに10分間で5回。Discordの制限値を表すものではない。
- ダイアログを閉じても登録状態を保持する。再読み込みに備えて登録番号と名前だけをsessionStorageへ保存する。画像・編集レシピは保存しない。登録記録にも画像やTokenは保存しない。

### 結果不明の復旧

Discordへの送信後にタイムアウト・5xx・DB保存失敗が起きた場合は、登録済みの可能性がある。同じ名前での再送を止め、「登録結果を確認」でDBの結果を読み直す。60秒以上のpendingも画面上は結果不明として扱う。

サーバー管理者はDiscordの絵文字一覧と監査ログの登録番号を確認する。該当絵文字が確認できた場合に限り、管理用SQLで該当する `request_id` の記録を `succeeded` にして `emoji_id` を記録する。未登録だと確認できた場合に限り `failed` にする。根拠なく記録を削除・失敗へ変更すると重複登録のおそれがある。処理中プロセスが終了したことも確認する。

Bot作成APIに冪等キーの保証がないため、通信断でのexactly-once成功は保証しない。不明な操作を自動再実行しないことで重複を抑える。登録記録の自動削除は行わず、復旧確認前の記録を残す。

公式資料: [Create Guild Emoji](https://docs.discord.com/developers/resources/emoji#create-guild-emoji)、[Permissions](https://docs.discord.com/developers/topics/permissions)、[Rate Limits](https://docs.discord.com/developers/topics/rate-limits)。


### 今回の検証記録

2026-10-18: 型チェック、lint（既存警告8件のみ）、本番ビルドとpostbuild、18件の単体/DB/保存処理テスト、HTTP認証テスト1件が成功。追加マイグレーションを開発用Supabaseへ適用し、サーバーキーで登録テーブルの読み取り接続を確認。PCの1024×768・1440×900で未ログイン時の確認ダイアログ、画像・名前入力、送信禁止、Escapeとフォーカス復帰、横スクロールなしを確認した。

Bot Tokenは未設定。実Discord登録、ログイン済みの登録成功画面、実際の権限不足/空き枠不足/429は未確認。これらのAPI分岐はテスト用Discord応答で検証した。次はBot設定・招待後にテストサーバーへの実登録を行う。
