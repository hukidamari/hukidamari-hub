import MarkdownIt from "markdown-it";
import { HeadingWithId, PostSlug } from "../../types/post";
import { getPostAssetUrlByFilename, getPostUrl } from "./routes";
import {
  allCodeBlocksSimpleRegex,
  allEmbedWikiLinksRegex,
  allWikiLinksRegex,
  parseWikiLinkContent,
} from "../../lib/parse-markdown-utils";
import { existsFilename, filenameToSlug } from "./slug-map";
import {
  IMAGE_EXTENSIONS,
  MOVIE_EXTENSIONS,
  SOUND_EXTENSIONS,
} from "../../config/extensions";
import { escapeHtml } from "markdown-it/lib/common/utils.mjs";
import taskLists from "markdown-it-task-lists";
import anchor from "markdown-it-anchor";
import prism from "markdown-it-prism";

const embedPageGenerator = (alt: string, url: PostSlug): string => {
  return pageLinkGenerator(alt, url);
};
const embedImageGenerator = (basename: string, ext: string): string => {
  const filename = `${basename}.${ext}`;
  const url = getPostAssetUrlByFilename(filename);
  return `<img src="${url}" alt="${basename}"></img>`;
};
const embedSoundGenerator = (basename: string, ext: string): string => {
  const filename = `${basename}.${ext}`;
  const url = getPostAssetUrlByFilename(filename);
  return `<audio src="${url}" controls></audio>`;
};
const embedMovieGenerator = (basename: string, ext: string): string => {
  const filename = `${basename}.${ext}`;
  const url = getPostAssetUrlByFilename(filename);
  return `<video src="${url}" controls></video>`;
};
const pageLinkGenerator = (alt: string, url: string): string => {
  return `<a href="${url}">${alt}</a>`;
};
const imageLinkGenerator = (basename: string, ext: string): string => {
  return embedImageGenerator(basename, ext);
};
const soundLinkGenerator = (basename: string, ext: string): string => {
  return embedSoundGenerator(basename, ext);
};
const movieLinkGenerator = (basename: string, ext: string): string => {
  return embedMovieGenerator(basename, ext);
};

// 共通Embed判定
type EmbedPlatform = "youtube";

interface Embed {
  platform: EmbedPlatform;
  embedUrl: string;
  alt?: string;
}

const getEmbed = (url: string, alt?: string): Embed | null => {
  const youtubeUrl = parseYouTubeUrl(url);
  if (youtubeUrl) return { platform: "youtube", embedUrl: youtubeUrl, alt };

  return null;
};

// YouTube埋め込みURL
const parseYouTubeUrl = (url: string): string | null => {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (!["www.youtube.com", "youtube.com", "youtu.be"].includes(host)) {
      return null;
    }

    const videoId = host.includes("youtu.be")
      ? u.pathname.slice(1)
      : u.searchParams.get("v");

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
};

export class ConvertingMarkdown {
  private codeBlocks: string[] = [];
  private inlineCodeBlocks: string[] = [];
  private codeBlockHtmls: string[] = [];
  headings: HeadingWithId[] = [];

  constructor(private content: string) {
    this.content = content;
  }

  executeAll(): string {
    return this.convertTabToSpaces()
      .convertCardlinkBlocks()
      .converCallouts()
      .escapeCodeBlocks()
      .escapeInlineCodeBlocks()
      .convertEmbedLinks()
      .restoreInlineCodeBlocks()
      .restoreCodeBlocks()
      .mdRender()
      .escapeHtmlCodeBlocks()
      .convertEmbedWikiLinks()
      .convertWikiLinks()
      .restoreHtmlCodeBlocks()
      .addHtmlTableWrapper()
      .toString();
  }

  toString(): string {
    return this.content;
  }

  mdRender(): ConvertingMarkdown {
    const md = MarkdownIt({ html: true, breaks: true })
      .use(taskLists)
      .use(anchor, {
        level: [1, 2, 3],
        permalink: anchor.permalink.headerLink(),
        callback: (token, info) => {
          this.headings.push({
            level: token.markup.trim().length,
            text: info.title,
            id: info.slug,
          });
        },
      })
      .use(prism);
    this.content = md.render(this.toString());
    return this;
  }

  convertTabToSpaces(): ConvertingMarkdown {
    this.content = this.content.replace(/\t/g, " ".repeat(4));
    return this;
  }

  convertEmbedWikiLinks(): ConvertingMarkdown {
    this.content = this.content.replace(
      allEmbedWikiLinksRegex(),
      (match, p1) => {
        const { basename, ext, alt } = parseWikiLinkContent(p1);

        if (ext === null) {
          const filename = `${basename}.md`;
          if (existsFilename(filename)) {
            const slug = filenameToSlug(filename);
            return embedPageGenerator(alt || basename, getPostUrl(slug));
          }
          return alt || basename;
        }

        const filename = `${basename}.${ext}`;
        if (IMAGE_EXTENSIONS.includes(ext)) {
          return embedImageGenerator(basename, ext);
        } else if (SOUND_EXTENSIONS.includes(ext)) {
          return embedSoundGenerator(basename, ext);
        } else if (MOVIE_EXTENSIONS.includes(ext)) {
          return embedMovieGenerator(basename, ext);
        } else {
          return alt || filename;
        }
      }
    );
    return this;
  }

  convertWikiLinks(): ConvertingMarkdown {
    this.content = this.content.replace(allWikiLinksRegex(), (match, p1) => {
      const { basename, ext, alt } = parseWikiLinkContent(p1);

      if (ext === null) {
        const filename = `${basename}.md`;
        if (existsFilename(filename)) {
          const slug = filenameToSlug(filename);
          return pageLinkGenerator(basename, getPostUrl(slug));
        }
        return alt || basename;
      }

      const filename = `${basename}.${ext}`;
      if (IMAGE_EXTENSIONS.includes(ext)) {
        return imageLinkGenerator(basename, ext);
      } else if (SOUND_EXTENSIONS.includes(ext)) {
        return soundLinkGenerator(basename, ext);
      } else if (MOVIE_EXTENSIONS.includes(ext)) {
        return movieLinkGenerator(basename, ext);
      } else {
        return alt || filename;
      }
    });
    return this;
  }

  convertCardlinkBlocks(): ConvertingMarkdown {
    this.content = this.content.replace(
      /```cardlink\s+([\s\S]*?)```/g,
      (_, content) => {
        const data: Record<string, string> = {};
        content.split("\n").forEach((line: string) => {
          const match = line.match(/^(\w+):\s*(.+)$/);
          if (match) {
            const [, key, value] = match;
            data[key] = value.replace(/^"|"$/g, "");
          }
        });

        return `
<a href="${data.url}" class="cardlink">
  <div class="cardlink-content">
    ${
      data.image
        ? `<img src="${data.image}" alt="サムネイル" class="cardlink-image" />`
        : ""
    }
    <div class="cardlink-text">
      <h3 class="cardlink-title">${escapeHtml(data.title) || ""}</h3>
      <p class="cardlink-description">${escapeHtml(data.description) || ""}</p>
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
      }
    );
    return this;
  }

  converCallouts(): ConvertingMarkdown {
    // NOTE: should escape code blocks
    const lines = this.content.split("\n");
    let inCodeBlock = false;
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // コードブロック開始・終了判定
      if (/^\s*```/.test(line.trim())) {
        inCodeBlock = !inCodeBlock;
        result.push(line);
        continue;
      }

      // コードブロック内はそのまま
      if (inCodeBlock) {
        result.push(line);
        continue;
      }

      // callout検出
      const calloutStartMatch = /^\s*> \[!(.+)\](.*)/.exec(line);
      if (calloutStartMatch) {
        const kind = calloutStartMatch[1].trim();
        const lowerKind = kind.toLowerCase();

        result.push(
          `<div class="callout callout-${lowerKind}">
  <div class="callout-title">${escapeHtml(kind)}</div>
  <div class="callout-content">`
        );

        const calloutContentLines: string[] = [];

        // callout内部の本文行を収集
        let j = i + 1;
        while (j < lines.length) {
          const nextMatch = /^\s*>\s*?(.*)/.exec(lines[j]);
          if (!nextMatch) break; // '>' で始まらなければ終了
          // 新しい callout の開始行なら、現在の callout を閉じる
          if (/^\s*>\s*\[!(.+)\]/.test(lines[j])) break;
          calloutContentLines.push(nextMatch[1]);
          j++;
        }

        // 本文HTML化

        result.push(
          new ConvertingMarkdown(calloutContentLines.join("\n")).executeAll()
        );

        result.push(`</div></div>`); // callout閉じタグ

        i = j - 1;
        continue;
      }

      // 通常行
      result.push(line);
    }

    this.content = result.join("\n");
    return this;
  }

  convertEmbedLinks(): ConvertingMarkdown {
    this.content = this.content.replace(
      /!\[(.*?)\]\((.+?)\)/g,
      (match, alt, url) => {
        const embed = getEmbed(url, alt);
        if (!embed) return match;

        switch (embed.platform) {
          case "youtube":
            return `
<div class="embed-youtube-container">
  <iframe
    src="${embed.embedUrl}"
    frameborder="0"
    allowfullscreen
    title="YouTube Video${embed.alt ? `: ${embed.alt}` : ""}"
    class="embed-youtube-video"
  ></iframe>
</div>`;
        }
      }
    );
    return this;
  }

  escapeCodeBlocks(): ConvertingMarkdown {
    this.content = this.content.replace(allCodeBlocksSimpleRegex(), (block) => {
      const index = this.codeBlocks.length;
      this.codeBlocks.push(block);
      return `@@CODE_BLOCK_${index}@@`; // placeholder
    });
    return this;
  }

  restoreCodeBlocks(): ConvertingMarkdown {
    this.content = this.content.replace(
      /@@CODE_BLOCK_(\d+)@@/g,
      (_, index) => this.codeBlocks[Number(index)]
    );
    this.codeBlocks = [];
    return this;
  }

  escapeInlineCodeBlocks(): ConvertingMarkdown {
    this.content = this.content.replace(/`([^`]+)`/g, (block) => {
      const index = this.inlineCodeBlocks.length;
      this.inlineCodeBlocks.push(block);
      return `@@INLINE_CODE_BLOCK_${index}@@`; // placeholder
    });
    return this;
  }

  restoreInlineCodeBlocks(): ConvertingMarkdown {
    this.content = this.content.replace(
      /@@INLINE_CODE_BLOCK_(\d+)@@/g,
      (_, index) => this.inlineCodeBlocks[Number(index)]
    );
    this.inlineCodeBlocks = [];
    return this;
  }

  escapeHtmlCodeBlocks(): ConvertingMarkdown {
    this.content = this.content.replace(
      /<code[\s\S]*?>[\s\S]*?<\/code>/g,
      (block) => {
        const index = this.codeBlockHtmls.length;
        this.codeBlockHtmls.push(block);
        return `@@CODE_BLOCK_HTML_${index}@@`; // placeholder
      }
    );
    return this;
  }

  restoreHtmlCodeBlocks(): ConvertingMarkdown {
    this.content = this.content.replace(
      /@@CODE_BLOCK_HTML_(\d+)@@/g,
      (_, index) => this.codeBlockHtmls[Number(index)]
    );
    this.codeBlockHtmls = [];
    return this;
  }

  addHtmlTableWrapper(): ConvertingMarkdown {
    // <table>〜</table> をすべて検索してラップする
    this.content = this.content.replace(
      /<table[\s\S]*?<\/table>/g,
      (match) => `<div class="table-wrapper">${match}</div>`
    );
    return this;
  }
}
