---
slug: introduce-detail
title:
published: true
tags:
  - introduce
description:
thumbnail:
createdAt: 2025-11-05T23:00:35+09:00
updatedAt: 2025-11-05T23:00:35+09:00
---
**Vault Blog Core** が実際に行うことは、主に

1. `.md` ファイルの収集と解析
2. 各記事のHTMLを生成

です。

## 1. `.md` ファイルの収集と解析

プロジェクトルートでコマンド `sh scripts/run-update-posts.sh` を実行することで、以下の処理を行います。

- 指定したディレクトリにある `.md` ファイルをプロジェクト内にコピーする
- フロントマターや本文を解析し、
	- 各ページのメタデータを構築する
	- 依存している画像・音声・動画ファイルをプロジェクト内にコピーする


収集元ディレクトリの場所は任意であり、これにより、Obsidian などの外部ツールで管理している `.md` ファイルを扱うことが出来ます。

フロントマターについては[[Vault Blog Core の投稿記事用フロントマターについて]]を参考にしてください。

## 2. Markdown から HTMLを生成

`pnpm run build` 時に、1で用意した `.md` ファイルの Markdown を解析して HTML に変換します。
現在行っている変換は、

- [markdown-it](https://github.com/markdown-it/markdown-it) による全体の変換
- [Obsidian Auto Card Link](https://github.com/nekoshita/obsidian-auto-card-link) によるカードリンク構文の変換
- Callout の変換
- `![title](url)` 形式の Youtube 動画 URL を `<iframe>` で埋め込み
- Wikiリンク `[[title]]` を、リンク先が存在すればそのリンクに、無ければ `title` に変換

です。

下記ページではそれらの具体例が確認できます。

- [[Markdown の変換例]]
- [[カードリンクの埋め込み]]
- [[Youtube動画の埋め込み]]
- [[Callout の変換例]]

また、[GitHubリポジトリ](https://github.com/no-la/vault-blog-core/tree/main/posts) にて、このサイトにある全記事の変換前の Markdown ファイルを見ることができます。

## まとめ

**Vault Blog Core** は、Markdown ファイルをもとに静的ブログを生成するためのツールであり、主に以下の2つの処理を行います。

1. `.md` ファイルの収集と解析

   * 外部ツール等で管理している Markdown を取り込み、フロントマターや本文を解析
   * 依存する画像・音声・動画もプロジェクト内にコピー

2. 各記事の HTML を生成

   * Markdown を HTML に変換
   * カードリンクや Callout、動画埋め込み、Wikiリンクの変換を行う

これにより、Obsidian などで管理している Markdown を効率的にブログ記事として公開できる環境を提供します。

興味を持ってくれた方は、是非[[Vault Blog Core の導入手順]]を見ながら実際に動かしてみてください！