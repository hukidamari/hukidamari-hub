import markdownit from "markdown-it";
import { existsFilename, filenameToSlug } from "./slug-map";
import {
  allCodeBlocksSimpleRegex,
  allEmbedWikiLinksRegex,
  allWikiLinksRegex,
  embedImageGenerator,
  embedMovieGenerator,
  embedPageGenerator,
  embedSoundGenerator,
  escapeHtml,
  imageLinkGenerator,
  movieLinkGenerator,
  pageLinkGenerator,
  parseWikiLinkContent,
  soundLinkGenerator,
} from "../../lib/markdown-utils";
import {
  IMAGE_EXTENSIONS,
  MOVIE_EXTENSIONS,
  SOUND_EXTENSIONS,
} from "../../config/extensions";
import { getPostUrl } from "../../lib/path-utils";

export const markdownToHtml = async (markdown: string): Promise<string> => {
  const result = new ConvertingMarkdown(markdown)
    .converCallouts()
    .convertEmbedLinks()
    .convertCardlinkBlocks()
    .mdRender()
    .escapeHtmlCodeBlocks()
    .convertEmbedWikiLinks()
    .convertWikiLinks()
    .restoreHtmlCodeBlocks()
    .toString();
  return result;
};

class ConvertingMarkdown {
  private codeBlocks: string[] = [];
  private codeBlockHtmls: string[] = [];

  constructor(private content: string) {
    this.content = content;
  }

  toString(): string {
    return this.content;
  }

  mdRender(): ConvertingMarkdown {
    const md = markdownit({ html: true });
    this.content = md.render(this.toString());
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

        if (IMAGE_EXTENSIONS.includes(ext)) {
          return embedImageGenerator(basename, ext);
        } else if (SOUND_EXTENSIONS.includes(ext)) {
          return embedSoundGenerator(basename, ext);
        } else if (MOVIE_EXTENSIONS.includes(ext)) {
          return embedMovieGenerator(basename, ext);
        } else {
          return alt || basename;
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
        return alt || filename;
      }

      if (IMAGE_EXTENSIONS.includes(ext)) {
        return imageLinkGenerator(basename, ext);
      } else if (SOUND_EXTENSIONS.includes(ext)) {
        return soundLinkGenerator(basename, ext);
      } else if (MOVIE_EXTENSIONS.includes(ext)) {
        return movieLinkGenerator(basename, ext);
      } else {
        return alt || basename;
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
    this.content = this.content.replace(
      /^>\s+\[!(.*?)\]\n((?:>\s+.*\n?)*)/gm,
      (_, kind: string, content: string) => {
        const lowerKind = kind.trim().toLowerCase();
        const cleanedContent = content
          .split(/\n/)
          .map((line) => line.replace(/^>\s+/, "").trim())
          .map((line) => `<p>${line}</p>`)
          .join("");
        return `
<div class="callout callout-${lowerKind}">
  <div class="callout-title">${escapeHtml(lowerKind)}</div>
  <div class="callout-content">
    ${cleanedContent}
  </div>
</div>`;
      }
    );

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
    return this;
  }
}

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
