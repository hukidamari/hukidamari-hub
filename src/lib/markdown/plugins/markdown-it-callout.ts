import type MarkdownIt from "markdown-it";

const calloutRegex = /^\[!(.+)\](?:\s+(.*))?$/;

export function markdownItCallout(md: MarkdownIt) {
  md.core.ruler.push("obsidian-callout", (state) => {
    const tokens = state.tokens;
    const srcLines = state.src.split("\n"); // ← 元の Markdown 全行

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok.type !== "blockquote_open") continue;

      // 対応する blockquote_close
      let j = i + 1;
      while (j < tokens.length && tokens[j].type !== "blockquote_close") j++;
      if (j >= tokens.length) continue;

      // blockquote のソース行範囲（map）を取得
      const startLine = tok.map?.[0];
      let endLine = null;
      for (let k = j - 1; k > i; k--) {
        if (tokens[k].map) {
          endLine = tokens[k].map![1];
          break;
        }
      }
      if (startLine == null || endLine == null) continue;

      // 元 Markdown の blockquote 部分を行ごと抽出
      const blockquoteLines = srcLines.slice(startLine, endLine);

      // '>' を除去して中身だけ取り出す
      const innerLines = blockquoteLines.map((l) => l.replace(/^\s*>\s?/, ""));

      // callout ヘッダ行
      const firstLine = innerLines[0];
      const match = firstLine.match(calloutRegex);
      if (!match) continue;

      const type = match[1].toLowerCase();
      const title = match[2] || match[1];

      // タイトル行を除去した本文
      const body = innerLines.slice(1).join("\n");

      // 本文を再パース
      const bodyTokens = md.parse(body, state.env || {});

      // opening の変換
      tok.tag = "div";
      tok.type = "callout_open";
      tok.attrSet("class", `callout callout-${type}`);

      // closing の変換
      const closeTok = tokens[j];
      closeTok.tag = "div";
      closeTok.type = "callout_close";

      // 元 blockquote 内の token を全削除
      tokens.splice(i + 1, j - i - 1);

      // タイトル挿入
      const titleTok = new state.Token("html_block", "", 0);
      titleTok.content = `<div class="callout-title">${md.utils.escapeHtml(
        title
      )}</div>`;
      titleTok.level = tok.level + 1;
      tokens.splice(i + 1, 0, titleTok);

      // Body token 挿入（level 調整）
      for (const bt of bodyTokens) {
        bt.level = tok.level + 1;
      }
      tokens.splice(i + 2, 0, ...bodyTokens);

      i = i + 2 + bodyTokens.length;
    }
  });

  md.renderer.rules.callout_open = (tokens, idx) => {
    const cls = tokens[idx].attrGet("class") ?? "callout";
    return `<div class="${cls}">\n`;
  };
  md.renderer.rules.callout_close = () => `</div>\n`;
}
