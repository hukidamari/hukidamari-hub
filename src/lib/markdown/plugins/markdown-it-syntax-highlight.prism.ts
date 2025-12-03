import { LANG_FOR_HIGHLIGHT } from "@/config/code-language";
import MarkdownIt from "markdown-it";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index.js"; // 必要な言語を動的に読み込む

loadLanguages(LANG_FOR_HIGHLIGHT);

const markdownItHighlight = (md: MarkdownIt) => {
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const code = token.content.trim();
    const lang = token.info?.trim() || "";

    let highlighted = code;
    if (lang && Prism.languages[lang]) {
      highlighted = Prism.highlight(code, Prism.languages[lang], lang);
    }

    const langClass = lang ? `language-${lang}` : "";

    return `<pre class="${langClass}"><code class="${langClass}">${highlighted}</code></pre>`;
  };
};

export default markdownItHighlight;
