---
slug: converted-markdown-sample
title:
published: true
tags:
  - sample
description:
thumbnail:
createdAt: 2025-11-06T00:35:50+09:00
updatedAt: 2025-11-06T00:35:50+09:00
---
# 見出しサンプル

## 強調
```
*斜体* / _斜体_  
**太字** / __太字__  
***太字かつ斜体*** / ___太字かつ斜体___
```

*斜体* / _斜体_  
**太字** / __太字__  
***太字かつ斜体*** / ___太字かつ斜体___

## リスト

### 無順序リスト
```
- 項目1
- 項目2
	- サブ項目2-1
	- サブ項目2-2
* 項目3
```

- 項目1
- 項目2
	- サブ項目2-1
	- サブ項目2-2
* 項目3

### 順序付きリスト
```
1. 項目1
2. 項目2
	1. サブ項目2-1
	2. サブ項目2-2
3. 項目
```

1. 項目1
2. 項目2
	1. サブ項目2-1
	2. サブ項目2-2
3. 項目

## リンク
```
[リンクテキスト](https://example.com)  
<https://example.com>
```

[リンクテキスト](https://example.com)  
<https://example.com>


## 画像
```
![[logo-small.png]]
```

![[logo-small.png]]


## 引用
```
> これは引用です。
>> 入れ子の引用も可能
```

> これは引用です。
>> 入れ子の引用も可能


## コード

### インラインコード
```
これは \`インラインコード\` の例です。
```

これは `インラインコード` の例です。

### 複数行コードブロック
```
\`\`\`javascript
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`
```

```javascript
function hello() {
  console.log("Hello, Markdown!");
}
```

## 表
```
|見出し1|見出し2|
|---|---|
|データ1|データ2|
|データ3|データ4|
```

|見出し1|見出し2|
|---|---|
|データ1|データ2|
|データ3|データ4|

## 水平線
```
---

---

---
```

---

---

---

## Wikiリンク (Obsidianなど)
```
[[Vault Blog Coreとは？]]
[[Youtube動画の埋め込み]]
```

[[Vault Blog Coreとは？]]
[[Youtube動画の埋め込み]]

## HTML埋め込み
```
<div style="color:red;">赤文字の例</div> 
<div style="text-align:right">右寄せもできる</div>
```

<div style="color:red;">赤文字の例</div> 
<div style="text-align:right">右寄せもできる</div>
