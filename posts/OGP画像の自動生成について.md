---
slug: intro-ogp-image
title:
published: true
tags:
  - introduce
  - usage
description:
thumbnail:
createdAt: 2025-12-03T20:30:59+09:00
updatedAt: 2025-12-03T20:30:59+09:00
---
OGP画像の自動生成については、[Functions: ImageResponse \| Next.js](https://nextjs.org/docs/app/api-reference/functions/image-response) を用いて実装しています。

> [!Note]
> [[今後の開発予定]]からの実装です。

## 概要

`.src/app/api/og/[title]/route.tsx` を書き換えて、カスタマイズしてください。

```ts
import "dotenv/config";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const SITE_URL = process.env.SITE_URL;

// Node.js ランタイムにする
export const runtime = "nodejs";

const titleColor = (): string => {
  return "#0077ff";
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ title: string }> }
) {
  const { title } = await params;
  // Font loading, process.cwd() is Next.js project directory
  const zenKakuGothicNewBold = await readFile(
    join(process.cwd(), "assets/Fredoka-Medium.ttf")
  );
  try {
    return new ImageResponse(
      (
        <div //...

```

> [!Note]
> `./src/config/api-route.ts` にAPIパスを生成する関数を置いています。
> 
> ```ts
> export const ogApiUrl = (title: string) => `/api/og/${title}`;
> ```

