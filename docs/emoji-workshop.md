# 絵文字工房

関連Issue: https://github.com/hukidamari/hukidamari-hub/issues/1

## 現在の実装範囲

`/emoji` で画像1つ＋文字1つを編集する、ブラウザ内で完結する試作。

- PNG / JPEG / WebPの読み込み（5 MiB、1600万画素まで）
- 画像と文字の自動配置、ドラッグ・矢印キー・数値による移動、選択枠の四隅ハンドル・スライダーによるサイズ変更
- 改行、フォント、文字色、縁の色・太さ、影
- PixiJSのWebGLフィルターによるGLSLエフェクト（うねうね・ふちが光る・ドット・ずれ）
- 透明・明暗背景、32px / 16px表示での確認
- キャンバスで選択した対象に応じた設定パネル。文字・画像・効果の切替
- 書体見本と色スウォッチ。縁取り・影は常時表示し、座標は詳細設定から開く
- 128×128透明PNGの書き出し（背景・選択枠は含まない）

ローカル画像は端末内でのみ使用し、アップロードしない。編集データも保存しない。
共有素材・認証・Discord登録はまだ接続していない。未接続の機能を成功したように見せるモックAPIは置かない。

## ローカル開発

Node.jsとpnpmを使用する。pnpmが未導入の場合は、以下の `pnpm` を `npx --yes pnpm@10` に置き換えて実行できる。`.env.local` に以下を設定する。

```dotenv
SITE_URL=http://localhost:3000
```

```sh
pnpm install
pnpm dev
```

http://localhost:3000/emoji を開く。

ファイル監視の上限（EMFILE）に当たる環境では、次でポーリングに切り替えられる。

```sh
WATCHPACK_POLLING=1000 pnpm exec next dev --webpack --hostname 127.0.0.1
```

既存のpostbuildスクリプトはNext.jsとは別プロセスで起動するため、ビルド検証時は環境変数を明示する。

```sh
SITE_URL=http://localhost:3000 pnpm build
pnpm lint
pnpm exec tsc --noEmit
```

## 構成

- `src/components/emoji/emoji-editor.tsx`: 入力、選択・ドラッグ操作、プレビューと書き出しUI
- `src/lib/emoji/model.ts`: 編集状態と初期配置
- `src/lib/emoji/renderer.ts`: PixiJS描画とPNG出力。ブラウザでのみ動的ロードする
- `src/lib/emoji/wave-filter.ts`: 共通頂点シェーダーと波形フィルター。時間を自動更新せず、位相を固定して静止画を書き出す
- `src/lib/emoji/effect-filters.ts`: アルファから生成する発光、ピクセル化、RGBチャンネルの水平ずれ

512pxの作業座標で描画し、固定の正方形を128pxに縮小する。位置調整の数値は出力画像の128px座標で表示する。文字は描画領域に収まるよう初期サイズを調整し、その後にユーザー指定の倍率を適用する。

Dela Gothic OneはGoogle Fontsの配布ファイルを改変せず同梱。ライセンスと著作権表記は `public/fonts/dela-gothic-one/OFL.txt`。ゴシック体・明朝体の選択肢は端末のシステムフォントなので見た目は端末により異なる。

## 次の接続作業

- Discord OAuthとサーバー所属・管理者判定、セッション管理
- Supabase FreeのPostgres / 非公開Storageへの素材保存
- メンバー全員が追加・利用、本人が自身の素材を変更・削除、管理者が全素材を管理
- 無料枠に収める総容量制限と、画像実データのサーバー検証
- Vercel APIから固定guildへ絵文字を登録。権限・空き枠・429・二重送信・結果不明時を扱う

Botアプリケーション・OAuth callback・Supabaseプロジェクトの実接続設定は未実施。ebifryの変更やラズパイへの通信は不要。

## 試作時の確認

- TypeScript、Next.js本番ビルド（postbuild含む）、lintを実行。lintは既存の未使用変数の警告のみ。
- ego-browserで画像の読み込み、ドラッグ後の位置、空の状態での出力禁止、PNGダウンロードを確認。
- ダウンロードしたPNGが128×128のRGBAであること、文字・画像・波形エフェクトが含まれることを確認。
- スマホ幅390pxで横方向のはみ出しを確認し、ナビゲーションを調整。
- Next.jsのビルドで見つかった既存の記事詳細・ページ送りの `params` 型をPromiseに修正（処理は元からawaitしていた）。

## ページレイアウト

通常ページは `src/app/(site)`、エディタは `src/app/(editor)` のRoute Groupで分離。URLは変わらない。ヘッダーは共通コンポーネント、フッターは通常ページのレイアウトだけに置く。

エディタは100dvhのシェル内でヘッダーと残りの編集領域をflex配置する。ページ全体のスクロールは発生させず、設定パネル内でスクロールする。スマホではキャンバスと設定を上下に分ける。

### フォント追加・選択UI

フォント定義は `src/lib/emoji/model.ts` の `FONTS`。書体選択はダイアログで入力文字を比較し、フォント名で検索できる。表示された候補のみ `FontFace` API で読み込み、読み込み完了後にPixiへ渡す。読み込み前の代替書体でPNGを書き出さない。フォントは自サイト配信、Google Fonts APIへの実行時アクセスなし。配信容量を減らすため追加フォントは全文字を保持したWOFF2へ可逆変換（作者提供WOFF2がある場合はそのまま）。

| 書体 | 配布元 | ライセンス・版 |
| --- | --- | --- |
| DotGothic16 / Yusei Magic / Mochiy Pop One / Stick / WDXL Lubrifont JP N | https://github.com/google/fonts/tree/main/ofl | 各ディレクトリのOFL.txt |
| ポプらむ☆キウイ | https://kiwi-kawagoto.com/poprumkiwi/index.html | SIL OFL 1.1、LINE Seed派生。作者同梱の説明書とOFL全文を同梱 |
| にくまるフォント | https://www.fontna.com/blog/nikumaru_font.html | M+ FONT LICENSE、Version 1.00。BOOTHはログイン必須のため公開再配布 https://github.com/sayonari/jimakuChan/blob/master/font/nikumaru.otf から取得。内部の作者・著作権を確認 |
| あかずきんポップ | https://booth.pm/ja/items/1748058 | M+ FONT LICENSE、Version 2.000。公開再配布 https://github.com/zk-phi/MEGAMOJI/blob/master/src/fonts/AkazukiPOP.woff と同リポジトリのresources/licenses/mplus.txtから取得 |
| けいふぉんと！ | https://font.sumomo.ne.jp/font_1.html | 作者配布 k-font.zip のApache 2.0・M+・著作権表示を同梱 |
| 851マカポップ | https://pm85122.onamae.jp/851mkpop.html | 指定版1.01、851MkPOP_101.ttf。作者規約をLICENSE.htmlに保存 |
| 851チカラヨワク | https://pm85122.onamae.jp/851ch-yw.html | 指定版0.02、851CHIKARA-YOWAKU_002.ttf。作者規約をLICENSE.htmlに保存 |

各ライセンス原文は `public/fonts/` の対応ディレクトリに保持する。

### エフェクト

全体に複数の効果を重ねて適用できる。`model.ts` の `EFFECTS` に表示名と調整項目を集約する。`effects` 配列が適用順を表し、効果ごとの強さ・位相・向き・色は `effectSettings` に独立して保持する。

- うねうね: 指定した向きへの波形変形。強さ、向き（0〜360°）、波の位置を調整。
- ふちが光る: 輪郭の外側に光を付ける。光の広がりと色を調整。初期色は暖色、スウォッチと任意の色を利用できる。
- ドット: 作業座標に固定したグリッドでピクセル化。粗さを調整。
- ずれ: 赤・青チャンネルを指定した向きへずらす。ずれ幅と向き（0〜360°）を調整。

効果ボタンで個別にオン・オフし、オンにした順に追加する。設定欄は適用順に並び、上下ボタンで順序を変更できる。「すべてオフ」で一括解除する。オフにしても調整値を保持し、再度オンにすると強さ・向き・色を復元する。強さ0の効果はフィルター列から除外する。透明部分は透明のまま扱い、発光とRGBずれはpremultiplied alphaで合成する。フィルター領域は固定の512px座標とし、内容の大きさが変わってもグリッド・波長を安定させる。適用後も128pxの出力枠の外側は切り取る。

追加時にego-browserで全効果のPNG保存、128pxサイズ・透明な隅、強さ0で無加工と同一になること、390×844画面内への収まりを確認。重ねがけ対応時は4効果の同時適用、順序変更による描画の変化、各強さの独立・再有効化時の復元、一括解除で元のPNGに戻ることも確認。向き・色の追加時は、うねうねとRGBずれの角度変更による描画の変化、青い光でのPNG保存、オフ・オン後の角度・色の復元、スマホ表示も確認。

### キャンバス上のサイズ変更

選択中の文字・画像に四隅のハンドルを表示する。マウス・タッチのドラッグで縦横比を維持し、反対側の角を基準に20〜200%の範囲で拡縮する（中心位置は作業領域内に制限）。ハンドルは常にオブジェクトの実際の四隅に置き、キャンバス端へ押し戻さない。描画はキャンバス内で切り取り、選択枠とハンドルは周囲の余白まで表示する。プレビュー領域から出た操作部品は切り取り、他の設定欄への重なりを防ぐ。設定欄の倍率も連動する。

ハンドルにフォーカスして上・右で1%拡大、下・左で1%縮小。Shift併用は10%。選択枠・ハンドルはDOMの操作部品で、PNGには含めない。

文字のドラッグ縮小で反対側の角と縦横比が保持されること、倍率の同期、キーボード調整、画像のドラッグ拡大・タッチ縮小、保存PNGと390px幅での表示をego-browserで確認。
