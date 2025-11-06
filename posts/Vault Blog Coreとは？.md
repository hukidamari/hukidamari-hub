---
slug: introduce
title: Vault Blog Coreとは？
published: true
tags:
  - Introduce
description: Vault Blog Core の概要と特徴を紹介する記事です。
thumbnail:
createdAt: 2025-11-05T22:41:48+09:00
updatedAt: 2025-11-05T22:41:48+09:00
---
Vault Blog Core は、**Markdownベースの軽量ブログフレームワーク**です。  
Obsidian などのノートエディタで管理している Markdown ファイルをそのままブログとして公開することを目的に設計されています。

## 特徴

### 1. Markdown ベース
- 記事は全て Markdown で管理
- Obsidian のノートをそのまま活用可能
- 見出し、リスト、コードブロック、表など標準的な Markdown がそのまま反映

### 2. Wikiリンク対応
- Obsidian のWikiリンク `[[別記事タイトル]]` の形式で記事間リンクを作成可能
- 同様に `![[ファイル名.jpg]]` で画像・動画・音声ファイルの埋め込みも可能

### 3. タグ管理
- FrontMatter に `tags` を設定するだけで自動分類
- タグ一覧ページやタグ別記事一覧ページも自動生成
- 記事の整理・検索が簡単

### 4. RSS 対応
- ビルド時に <a src="/feed.xml">RSS</a> を自動生成

### 5. リンクの埋め込み
- `![タイトル](YouTube動画URL)` で[[Youtube動画の埋め込み]]が可能
- [GitHub - nekoshita/obsidian-auto-card-link](https://github.com/nekoshita/obsidian-auto-card-link) によるカードリンクに対応

## まとめ

Vault Blog Core は、**ノート感覚で書いた Markdown をそのままブログとして公開**したい人向けのフレームワークです。  
設定もシンプルで、Obsidian からの移行もスムーズ。  

次の記事では、**実際のセットアップ手順**について解説します。