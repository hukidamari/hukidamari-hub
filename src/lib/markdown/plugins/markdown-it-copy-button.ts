import MarkdownIt from "markdown-it";

const markdownItCopyButton = (md: MarkdownIt) => {
  const defaultFence = md.renderer.rules.fence;

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const code = token.content;
    const langClass = token.info ? `language-${token.info.trim()}` : "";

    // デフォルトレンダーを呼び出す場合（Prismを適用したHTML）
    const originalHtml = defaultFence
      ? defaultFence(tokens, idx, options, env, self)
      : `<pre><code class="${langClass}">${md.utils.escapeHtml(
          code
        )}</code></pre>`;

    // コピーボタン付きでラップ
    return `
      <div class="code-block-wrapper">
        <button class="copy-btn" data-code="${encodeURIComponent(
          code
        )}">Copy</button>
        ${originalHtml}
      </div>
    `;
  };
};

export default markdownItCopyButton;
