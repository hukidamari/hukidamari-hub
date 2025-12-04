import MarkdownIt from "markdown-it";
import { escapeHtml } from "markdown-it/lib/common/utils.mjs";

/**
 * cardlinkブロックの解析結果の型
 */
interface CardlinkData {
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  host?: string;
}

/**
 * cardlinkブロックのコンテンツを解析し、データを抽出する
 * @param content cardlinkブロック内のテキストコンテンツ
 * @returns 抽出されたCardlinkDataオブジェクト
 */
const parseCardlinkContent = (content: string): CardlinkData => {
  const data: CardlinkData = {};
  content.split("\n").forEach((line: string) => {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      // 値の先頭と末尾の引用符を削除
      const parsedValue = value.replace(/^"|"$/g, "").trim();
      // keyがCardlinkDataのプロパティと一致する場合にデータを格納
      if (
        ["url", "title", "description", "image", "favicon", "host"].includes(
          key
        )
      ) {
        data[key as keyof CardlinkData] = parsedValue;
      }
    }
  });
  return data;
};

/**
 * CardlinkDataからHTML文字列を生成する
 * @param data CardlinkDataオブジェクト
 * @returns 生成されたHTML文字列
 */
const generateCardlinkHtml = (data: CardlinkData): string => {
  if (!data.url) {
    // urlがない場合は何もレンダリングしないか、エラーメッセージを返す
    return "";
  }

  const title = escapeHtml(data.title || "");
  const description = escapeHtml(data.description || "");

  return `
<a href="${data.url}" class="cardlink">
  <div class="cardlink-content">
    ${
      data.image
        ? `<img src="${data.image}" alt="サムネイル" class="cardlink-image" />`
        : ""
    }
    <div class="cardlink-text">
      <h3 class="cardlink-title">${title}</h3>
      <p class="cardlink-description">${description}</p>
      <div class="cardlink-meta">
        ${
          data.favicon
            ? `<img src="${data.favicon}" alt="" class="cardlink-favicon" />`
            : ""
        }
        <span class="cardlink-host">${data.host || ""}</span>
      </div>
    </div>
  </div>
</a>`;
};

/**
 * markdown-itのプラグイン本体
 * @param md MarkdownItインスタンス
 */
const markdownItCardlink = (md: MarkdownIt): void => {
  const defualtFence =
    md.renderer.rules.fence ||
    ((tokens, idx) =>
      `<pre><code>${escapeHtml(tokens[idx].content)}</code></pre>`);

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const info = token.info.trim();

    // infoが 'cardlink' で始まる場合
    if (info === "cardlink") {
      const content = token.content.trim();
      const data = parseCardlinkContent(content);
      return generateCardlinkHtml(data);
    }

    // 'cardlink' でない場合はデフォルトのレンダラーを使用
    return defualtFence(tokens, idx, options, env, self);
  };
};

export default markdownItCardlink;
