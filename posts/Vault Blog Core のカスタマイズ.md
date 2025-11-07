---
slug: how-to-customize
title:
published: true
tags:
  - setup
  - usage
description:
thumbnail:
createdAt: 2025-11-07T07:55:15+09:00
updatedAt: 2025-11-07T07:55:15+09:00
---
**Vault Blog Core** を用いて自分だけのブログを作る方法を説明します。

現時点では、主に以下の4つのカスタマイズを想定しています。

1. 環境変数の設定
2. 投稿条件の変更
3. ルーティングの変更
4. 見た目の変更

## 1. 環境変数の設定

これについては[[Vault Blog Core の導入手順]]で説明しています。

## 2. 投稿条件の変更

ここでは、どのMarkdownファイルを「記事として公開するか」の条件をカスタマイズする方法を説明します。

[[Vault Blog Core の導入手順]]や[[Vault Blog Core による記事投稿までの手順]]などで少し言及しましたが、**Vault Blog Core** は `POST_SOURCE_DIR` 下にある Markdown ファイルを収集して、記事として投稿します。

初期設定では、`POST_SOURCE_DIR` 以下の Markdown ファイルのうち、フロントマターに `published: true` が指定されたものだけを収集して投稿しますが、この条件は自由にカスタマイズできます。

カスタマイズするには、`./config/can-publish.ts` にある `canPublish()` 関数を編集してください。

現時点でのファイルの内容は下記の通りです。
関数の説明はコメントを参照してください。

```ts
/**
 * 投稿を公開してよいかを判定する関数
 *
 * @param frontMatter - フロントマターの内容
 * @returns 投稿を公開する場合は true、それ以外は false
 *
 * @example
 * const frontMatter = {
 *   slug: "sample",
 *   createdAt: "2000-01-01",
 *   tags: ["tag1", "tag2"],
 *   thumbnail: "[[sample.jpg]]",
 *   description: "This is sample data",
 *   published: true,
 *   customField: "foobar",
 * };
 *
 * const result = canPublish(frontMatter); // true
 */
export const canPublish = (frontMatter: Record<string, unknown>): boolean => {
  const val = frontMatter.published;
  return typeof val === "boolean" && val === true;
};

```

例えば「特定のタグが付いた記事だけ公開したい」場合などは、下記のように `canPublish()` を書き換えることもできます。

```ts
export const canPublish = (
  frontMatter: Record<string, unknown>
): boolean => {
  return Array.isArray(frontMatter.tags) && frontMatter.tags.includes("public");
};
```


## 3. ルーティングの変更

**Vault Blog Core** では、ルーティングに App Router を用いています。

```cardlink
url: https://nextjs.org/docs/app
title: "Next.js Docs: App Router | Next.js"
description: "The App Router is a file-system based router that uses React's latest features such as Server Components, Suspense, Server Functions, and more."
host: nextjs.org
favicon: https://nextjs.org/favicon.ico?favicon.d29c4393.ico
image: https://nextjs.org/api/docs-og?title=Next.js%20Docs:%20App%20Router
```


したがって、`./src/app` を編集することでルーティングの変更が可能です。
**Vault Blog Core** は `./src/app` への外部からの参照をしていないので、お好きに編集してください。

ただし一箇所だけ `./src/lib/routes.ts` に、各ページのURLを返す関数をまとめています。
この関数を書き換えておくと便利だと思います。

```ts
// ...

/**
 * 各ページのURL生成
 */
export const getHomeUrl = () => `/`;

export const getPostsUrl = () => `/posts`;

export const getPostsPageUrl = (page: number) => `/posts/page/${page}`;

export const getPostUrl = (slug: string) => `/posts/${slug}`;

export const getTagsUrl = () => `/tags`;

export const getTagUrl = (tag: string) => `/tags/${encodeForURI(tag)}`;

export const getAboutUrl = () => `/about`;

/**
 * RSS / フィードなど
 */
export const getRssUrl = () => `/feed.xml`;
export const getRssFilePath = () => path.join(PUBLIC_DIR, "feed.xml");

```

> [!Note]
> サンプルとして置いてある `./src/components` を使わず、これらの関数も使わない場合は、書き換え無くても問題ありません。



## 4. 見た目の変更

先述の通り、App Router を使用していて、かつ `./src/app` への外部からの参照はないので、`./src/app/layout.tsx` や各ページの `page.tsx` などを書き換え、スタイリングを行うことで、見た目を自由に変更可能です。

同様に `./src/components` も好きに編集して構いません。
こちらに関しては、開発者が手を加えて `git push` する可能性がありますが、コンフリクトしたとしても大きな問題にはならないと思います。各自良いように管理してください。