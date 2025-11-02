import markdownit from "markdown-it";
import { existsTitle, slugToRoute, titleToSlug } from "./slug-map";
import { existsPublicImage, imageFileNameToUrl } from "./public-files";

export const markdownToHtml = async (markdown: string): Promise<string> => {
  const result = new ConvertingMarkdown(markdown)
    .convertCardlinkBlocks()
    .convertImageWikiLinks()
    .convertWikiLinks()
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
    this.content = this.content.replace(
      /\!\[\[(.+?)\.(png|jpe?g)\]\]/gi,
      (match, p1, ext) => {
        const fileName = `${p1}.${ext}`;
        if (existsPublicImage(fileName)) {
          const url = imageFileNameToUrl(fileName);
          return `![${p1}](${url})`;
        } else {
          return fileName;
        }
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
      <h3 class="cardlink-title">${data.title || ""}</h3>
      <p class="cardlink-description">${data.description || ""}</p>
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
}
