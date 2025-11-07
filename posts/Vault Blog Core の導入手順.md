---
slug: how-to-setup
title:
published: true
tags:
  - setup
  - usage
  - introduce
description:
thumbnail:
createdAt: 2025-11-06T00:37:20+09:00
updatedAt: 2025-11-06T00:37:20+09:00
---
**Vault Blog Core** の導入手順を説明します。

## リポジトリの準備

まずは Git リポジトリを準備します。
下記手順で進めてください。

1. [GitHub - no-la/vault-blog-core](https://github.com/no-la/vault-blog-core) に行き、右上にある `Fork` ボタンから fork を作成
2. プロジェクトを置きたいディレクトリに移動し `git clone <リポジトリURL>` で clone を作成

> [!Note]
> fork でなくてもOKですが、**Vault Blog Core** は今後も修正・改善をするつもりなので、当リポジトリを上流に置いておくと良いことがありそうな気がします🎋


## 環境構築

### Node.js と pnpm の確認

Node.js のバージョンは `20.9` 以上を推奨します。
確認、更新、インストールなどしてください。

```sh
node -v
```

次に pnpm があることを確認します。

```sh
pnpm -v
```

pnpm が無い場合は[インストール \| pnpm](https://pnpm.io/ja/installation) などを参考にインストールしてください。

### 依存関係のインストール

プロジェクトのルートディレクトリに移動して、次のコマンドを実行してください。

```sh
pnpm install
```


## 環境変数の準備

環境変数の準備をします。

`.env.sample` をコピーして `.env` を作ります。

```sh
cp .env.sample .env
```

下記説明を参考に、自分用に書き換えてください。

| 変数名                    | 説明                                       |
| ---------------------- | ---------------------------------------- |
| `POST_SOURCE_DIR`      | 投稿用のMarkdownファイルを置くディレクトリ                |
| `IMAGE_SOURCE_DIR`     | 投稿用の画像ファイルを置くディレクトリ                      |
| `SOUND_SOURCE_DIR`     | 投稿用の音声ファイルを置くディレクトリ                      |
| `MOVIE_SOURCE_DIR`     | 投稿用の動画ファイルを置くディレクトリ                      |
| `THUMBNAIL_SOURCE_DIR` | 記事のサムネイル用画像ディレクトリ                        |
| `SITE_URL`             | サイトのルートURL（例: `"http://localhost:3000"`） |

`SITE_URL` については、開発環境での実行用に `"http://localhost:3000"` としています。

> [!Note]
> 開発主は `IMAGE_SOURCE_DIR`, `SOUND_SOURCE_DIR`, `MOVIE_SOURCE_DIR`, `THUMBNAIL_SOURCE_DIR` を全て同じディレクトリにしています。

> [!Hint]
> このページではサンプルのままにしておいても大丈夫だと思いますが、今後 Markdown ファイルの収集コマンド `sh script/run-update-posts.sh` を実行する前に **必ず自分用に変更してください。**

## 起動確認

次のコマンドで開発サーバを起動します。

```sh
pnpm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスし、このサイトと同じ内容が表示されればセットアップ完了です！🎉

次は、[[Vercelにデプロイするまでの手順]]で、実際にデプロイをして、プロジェクトを公開してみましょう！
「まだデプロイはしたくないよ～」という方は、[[Vault Blog Core による記事投稿までの手順]]で、実際に自分の記事を投稿してみましょう！
