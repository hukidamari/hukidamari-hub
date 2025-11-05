import markdownit from "markdown-it";
import { existsTitle, slugToRoute, titleToSlug } from "./slug-map";
import { publicFileNameToUrl } from "../../lib/path-utils";
import {
  allEmbedWikiLinksRegex,
  allWikiLinksRegex,
  escapeHtml,
  parseWikiLinkContent,
} from "../../lib/markdown-utils";
import {
  IMAGE_EXTENSIONS,
  MOVIE_EXTENSIONS,
  SOUND_EXTENSIONS,
} from "../../config/extensions";
import { PostSlug } from "../../types/post";

export const markdownToHtml = async (markdown: string): Promise<string> => {
  const result = new ConvertingMarkdown(markdown)
    .convertCardlinkBlocks()
    .convertEmbedWikiLinks()
    .convertWikiLinks()
    .converCallouts()
    .mdRender()
    .toString();
  return result;
};

const embedPageGenerator = (alt: string, url: PostSlug): string => {
  return pageLinkGenerator(alt, url);
};
const embedImageGenerator = (filename: string, ext: string): string => {
  const filePath = `${filename}.${ext}`;
  const url = publicFileNameToUrl(filePath);
  return `![${filename}](${url})`;
};
const embedSoundGenerator = (filename: string, ext: string): string => {
  const filePath = `${filename}.${ext}`;
  const url = publicFileNameToUrl(filePath);
  return `<audio src="${url}" controls></audio>`;
};
const embedMovieGenerator = (filename: string, ext: string): string => {
  const filePath = `${filename}.${ext}`;
  const url = publicFileNameToUrl(filePath);
  return `<video src="${url}" controls></video>`;
};
const pageLinkGenerator = (alt: string, url: PostSlug): string => {
  return `[${alt}](${url})`;
};
const imageLinkGenerator = (filename: string, ext: string): string => {
  return embedImageGenerator(filename, ext);
};
const soundLinkGenerator = (filename: string, ext: string): string => {
  return embedSoundGenerator(filename, ext);
};
const movieLinkGenerator = (filename: string, ext: string): string => {
  return embedMovieGenerator(filename, ext);
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
        const { filename, ext, alt } = parseWikiLinkContent(p1);

        if (ext === null) {
          // This is .md in Obsidian
          if (existsTitle(filename)) {
            const slug = titleToSlug(filename);
            return embedPageGenerator(alt || filename, slugToRoute(slug));
          }
          return alt || filename;
        }

        if (IMAGE_EXTENSIONS.includes(ext)) {
          return embedImageGenerator(filename, ext);
        } else if (SOUND_EXTENSIONS.includes(ext)) {
          return embedSoundGenerator(filename, ext);
        } else if (MOVIE_EXTENSIONS.includes(ext)) {
          return embedMovieGenerator(filename, ext);
        } else {
          return alt || filename;
        }
      }
    );
    return this;
  }

  convertWikiLinks(): ConvertingMarkdown {
    this.content = this.content.replace(allWikiLinksRegex(), (match, p1) => {
      const { filename, ext, alt } = parseWikiLinkContent(p1);

      if (ext === null) {
        // This is .md in Obsidian
        if (existsTitle(filename)) {
          const slug = titleToSlug(filename);
          return pageLinkGenerator(filename, slugToRoute(slug));
        }
        return alt || filename;
      }

      if (IMAGE_EXTENSIONS.includes(ext)) {
        return imageLinkGenerator(filename, ext);
      } else if (SOUND_EXTENSIONS.includes(ext)) {
        return soundLinkGenerator(filename, ext);
      } else if (MOVIE_EXTENSIONS.includes(ext)) {
        return movieLinkGenerator(filename, ext);
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
}
