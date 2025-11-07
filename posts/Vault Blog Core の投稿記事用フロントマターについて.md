---
slug: post-frontmatter
title:
published: true
tags:
  - usage
  - introduce
description:
thumbnail:
createdAt: 2025-11-06T11:49:24+09:00
updatedAt: 2025-11-06T11:49:24+09:00
---
**Vault Blog Core** で投稿するための Markdown ファイルのフロントマターを説明します。


## フロントマターのテンプレート

テンプレートはこちらで、YAML フロントマターを想定しています。

```
---
slug:
title:
published: false
tags:
description:
thumbnail:
createdAt: 
updatedAt: 
---

```

> [!Note]
> [gray-matter](https://www.npmjs.com/package/gray-matter) を用いて解析しているため、gray-matter が対応している形式のフロントマターなら、各プロパティの値が適切であれば、問題ないと思います。

## 各プロパティの説明

| フィールド名        | 型 / フォーマット                                                          | 必須  | 説明                                     |
| ------------- | ------------------------------------------------------------------- | --- | -------------------------------------- |
| `slug`        | 文字列（例: `"post-frontmatter"`）                                        | ✅   | 記事のURLに使われる識別子。**半角英数字とハイフンのみ**。一意。    |
| `title`       | 文字列（例: `"投稿記事用フロントマターについて"`）                                        | 任意  | 記事タイトル。サイト上で表示される。空ならファイル名が挿入される。      |
| `published`   | 真偽値（`true` / `false`）                                               | ✅   | 公開フラグ。初期設定では `true` の場合のみ記事がビルド・公開される。 |
| `tags`        | 文字列の配列（例: `["usage", "introduce"]` または `\n  - usage\n  -introduce`） | 任意  | 記事の分類や検索用タグ。                           |
| `description` | 文字列                                                                 | 任意  | 記事の概要やメタディスクリプションに使われる。空なら本文が挿入される。    |
| `thumbnail`   | 文字列（画像のパス or URL）(例: `[[basename.jpg]]`)                            | 任意  | 記事一覧やSNS共有時に表示されるサムネイル画像。              |
| `createdAt`   | ISO 8601形式 日付文字列（例: `2025-11-06T18:30:00+09:00`）                    | ✅   | 記事の作成日時。                               |
| `updatedAt`   | ISO 8601形式 日付文字列（例: `2025-11-06T18:30:00+09:00`）                    | ✅   | 最終更新日時。                                |

> [!Hint]
> Markdown エディタに Obsidian を使用している場合、`createdAt`、`updatedAt` については下記のどちらかで扱うと楽です。
> 
> - コアプラグインの Templates で `{{date:YYYY-MM-DDTHH:mm:ss+09:00}}` を挿入する (タイムゾーンは適切に変更)
> - コミュニティプラグインの Templater で `<% tp.date.now("YYYY-MM-DDTHH:mm:ssZ") %>` を挿入する



ここまで確認出来たら、次は[[Vault Blog Core のカスタマイズ]]をしてみましょう！