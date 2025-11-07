---
slug: how-to-post
title:
published: true
tags:
  - usage
  - introduce
description:
thumbnail:
createdAt: 2025-11-06T17:46:04+09:00
updatedAt: 2025-11-06T17:46:04+09:00
---
[[Vault Blog Core の導入手順]]で導入した **Vault Blog Core** を用いて、実際に記事を投稿するまでの手順を説明します。

大まかな流れは次の通りです。

1. ディレクトリの確認
2. `サンプル.md` の作成
3. 投稿


## 1. ディレクトリの確認

[[Vault Blog Core の導入手順]]で言及した、各ディレクトリと `.env` の各変数の対応に注意してください。

| 変数名                    | 説明                                       |
| ---------------------- | ---------------------------------------- |
| `POST_SOURCE_DIR`      | 投稿用のMarkdownファイルを置くディレクトリ                |
| `IMAGE_SOURCE_DIR`     | 投稿用の画像ファイルを置くディレクトリ                      |
| `SOUND_SOURCE_DIR`     | 投稿用の音声ファイルを置くディレクトリ                      |
| `MOVIE_SOURCE_DIR`     | 投稿用の動画ファイルを置くディレクトリ                      |
| `THUMBNAIL_SOURCE_DIR` | 記事のサムネイル用画像ディレクトリ                        |

以下、この変数名を用いてディレクトリを表し、説明を続けます。

## 2. `サンプル.md` の作成

`POST_SOURCE_DIR` に `サンプル.md` を作成し、下記内容を挿入します。

```
---
slug: sample-post
title: sample-title
published: true
tags:
  - sample
description: This is sample description.
thumbnail:
createdAt: 2030-01-06T00:00:00+09:00
updatedAt: 2030-01-01T00:00:00+09:00
---

これは投稿サンプルです。

```


せっかくなので画像ファイルの埋め込みも試してみましょう。
お好きな画像を `IMAGE_SOURCE_DIR` に置き、`サンプル.md` に追記してください。

```
## 画像サンプル

![[<用意した画像ファイルの名前>.<拡張子>]]
```

> [!Note]
> 絶対パスが `IMAGE_SOURCE_DIR/basename.ext`  なら、`![[basename.ext]]` と書いてください。
> 詳しくは[[ファイルパスの扱いについて]]を参照してください。


## 3. 投稿

**Vault Blog Core** のルートディレクトリで、次のコマンドを実行してください。

```sh
sh scripts/run-update-posts.sh
pnpm dev
```

> [!Note]
> `scripts/run-update-posts.sh` はUnix系シェルを想定して書かれています。
> Windows の方は Git Bash などを用いて実行すると良いと思います。あるいは、`scripts/run-update-posts.sh` を直接書き換えても構いません。


 [http://localhost:3000](http://localhost:3000) で動きの確認ができたら完了です！
 ([[Vercelにデプロイするまでの手順]]を済ませた方は `git push` するとデプロイされるはずなので、試してみましょう！)


次は、[[投稿記事用フロントマターについて]]を見てみてください！