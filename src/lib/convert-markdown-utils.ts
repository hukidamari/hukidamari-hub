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
import taskLists from "markdown-it-task-lists";
import anchor from "markdown-it-anchor";
import markdownItCopyButton from "./markdown/plugins/markdown-it-copy-button";
import markdownItHighlight from "./markdown/plugins/markdown-it-syntax-highlight.prism";
import markdownItCallout from "./markdown/plugins/markdown-it-callout";
import markdownItCardlink from "./markdown/plugins/markdown-it-cardlink";

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
  private codeBlockWrappers: string[] = [];
  headings: HeadingWithId[] = [];

  constructor(private content: string) {
    this.content = content;
  }

  executeAll(): string {
    return this.convertTabToSpaces()
      .escapeCodeBlocks()
      .escapeInlineCodeBlocks()
      .convertEmbedLinks()
      .restoreInlineCodeBlocks()
      .restoreCodeBlocks()
      .mdRender()
      .escapeCodeBlockWrappers()
      .escapeHtmlCodeBlocks()
      .convertEmbedWikiLinks()
      .convertWikiLinks()
      .restoreHtmlCodeBlocks()
      .restoreCodeBlockWrappers()
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
      .use(markdownItCallout)
      .use(markdownItHighlight)
      .use(markdownItCopyButton)
      .use(markdownItCardlink); // NOTE: 優先度高
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
          return pageLinkGenerator(alt || basename, getPostUrl(slug));
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

  escapeCodeBlockWrappers(): ConvertingMarkdown {
    this.content = this.content.replace(
      /<div class="code-block-wrapper">[\s\S]*?<\/div>/g,
      (block) => {
        const index = this.codeBlockWrappers.length;
        this.codeBlockWrappers.push(block);
        return `@@CODE_BLOCK_WRAPPER_${index}@@`; // placeholder
      }
    );
    return this;
  }

  restoreCodeBlockWrappers(): ConvertingMarkdown {
    this.content = this.content.replace(
      /@@CODE_BLOCK_WRAPPER_(\d+)@@/g,
      (_, index) => this.codeBlockWrappers[Number(index)]
    );
    this.codeBlockWrappers = [];
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
