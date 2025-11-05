import markdownit from "markdown-it";
import { existsFilename, filenameToSlug } from "./slug-map";
import {
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
    .convertCardlinkBlocks()
    .convertEmbedWikiLinks()
    .convertWikiLinks()
    .convertEmbedLinks()
    .converCallouts()
    .mdRender()
    .toString();
  return result;
};

class ConvertingMarkdown {
  constructor(private content: string) {}

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
          // This is .md in Obsidian
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
        // This is .md in Obsidian
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
            data[key] = value.replace(/^"|"$/g, ""); // 両端の " を除去
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
      /!\[(.+?)\]\((.+?)\)/g,
      (match, alt, url) => {
        const embedYoutubeUrl = embeddableYouTubeUrl(url);
        if (!embedYoutubeUrl) {
          return match;
        }

        return `
<div class="embed-youtube-container">
<iframe
  src="${embedYoutubeUrl}"
  frameborder="0"
  allowfullscreen
  title="YouTube Video${alt ? `: ${alt}` : ""}"
  class="embed-youtube-video"
></iframe>
</div>
`;
      }
    );
    return this;
  }
}

const embeddableYouTubeUrl = (url: string): string | null => {
  try {
    const u = new URL(url);
    const hostname = u.hostname.toLowerCase();

    // YouTubeのドメインかチェック
    if (
      hostname !== "www.youtube.com" &&
      hostname !== "youtube.com" &&
      hostname !== "youtu.be"
    ) {
      return null;
    }

    let videoId = null;

    // youtube.com/watch?v=xxxx
    if (hostname.includes("youtube.com")) {
      videoId = u.searchParams.get("v");
    }

    // youtu.be/xxxx
    if (hostname === "youtu.be") {
      videoId = u.pathname.slice(1); // 先頭の / を削除
    }

    // 動画IDが取得できれば埋め込み可能
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
};
