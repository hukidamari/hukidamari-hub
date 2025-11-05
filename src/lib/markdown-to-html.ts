import markdownit from "markdown-it";
import { existsTitle, slugToRoute, titleToSlug } from "./slug-map";
import {
  encodeForURI,
  existsPublicFile,
  publicFileNameToUrl,
} from "../../lib/public-files";

export const markdownToHtml = async (markdown: string): Promise<string> => {
  const result = new ConvertingMarkdown(markdown)
    .convertCardlinkBlocks()
    .convertImageWikiLinks()
    .convertMovieWikiLinks()
    .convertSoundWikiLinks()
    .convertWikiLinks()
    .converCallouts()
    .mdRender()
    .toString();
  return result;
};

const sourceWikiLinksRegex = (exts: string[]): RegExp => {
  return new RegExp(`!\\[\\[(.+?)\\.(${exts.join("|")})\\]\\]`, "gi");
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
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

  convertWikiLinks(): ConvertingMarkdown {
    this.content = this.content.replace(/\[\[(.+?)\]\]/g, (match, p1) => {
      const parts = p1.split("|");
      const linkText = parts[1] || parts[0];
      const title = parts[0];

      if (existsTitle(title)) {
        const slug = titleToSlug(title);
        return `[${linkText}](${slugToRoute(slug)})`;
      } else {
        return linkText;
      }
    });
    return this;
  }

  convertImageWikiLinks(): ConvertingMarkdown {
    return this.convertSourceWikiLinks(
      ["png", "jpg", "jpeg", "gif"],
      embedImageGenerator
    );
  }
  convertSoundWikiLinks(): ConvertingMarkdown {
    return this.convertSourceWikiLinks(["mp3", "wav"], embedSoundGenerator);
  }
  convertMovieWikiLinks(): ConvertingMarkdown {
    return this.convertSourceWikiLinks(
      ["mp4", "mov", "avi"],
      embedMovieGenerator
    );
  }

  convertSourceWikiLinks(
    exts: string[],
    embedElemGenerator: (filename: string, ext: string) => string
  ): ConvertingMarkdown {
    this.content = this.content.replace(
      sourceWikiLinksRegex(exts),
      (match, p1, ext) => {
        const fileName = encodeForURI(p1);
        const filePath = `${fileName}.${ext}`;
        if (existsPublicFile(filePath)) {
          return embedElemGenerator(fileName, ext);
        }
        return filePath;
      }
    );
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
