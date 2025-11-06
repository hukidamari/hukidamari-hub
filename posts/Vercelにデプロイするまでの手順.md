---
slug: deploy-to-vercel
title:
published: true
tags:
  - Introduce
  - setup
description:
thumbnail:
createdAt: 2025-11-06T17:17:27+09:00
updatedAt: 2025-11-06T17:17:27+09:00
---

[[Next.js]]のプロジェクトはVercelにデプロイするのが良いらしく、このサイトもVercelにデプロイしています。

そこで、Vault Blog Coreの導入手順で用意したプロジェクトをVercelにデプロイするまでの流れを、簡易的にですが、紹介しておきます。

## Vercel にデプロイするまでの手順

Vercel にログインし、画面の指示に従って Create New Project します。
各種設定については、下記を参考に進めてください。

- **GitHub リポジトリ**: 先ほど作成したリポジトリを登録
- **Framework Preset**: `Next.js` を選択
- **Environment Variablesに**: `SITE_URL` に「公開されるルート URL」を設定

> [!Hint]
> `SITE_URL` について、独自ドメインを使わない場合は、Vercel が発行する  
> `https://<プロジェクト名>.vercel.app` を指定しておけば問題ありません。  
> （正確なドメイン名は Vercel ダッシュボードの「Domains」から確認できます。）

> [!Note]
>  環境変数について、`POST_SOURCE_DIR`, `IMAGE_SOURCE_DIR`, `SOUND_SOURCE_DIR`, `MOVIE_SOURCE_DIR`, `THUMBNAIL_SOURCE_DIR` はデプロイから先では使用しないため、登録しなくて大丈夫です。


デプロイが完了すると、指定した URL でサイトを確認できるようになります。 
これで公開までの準備は完了です！🎉
