import markdownit from "markdown-it";
import { existsTitle, slugToRoute, titleToSlug } from "./slug-map";

export const markdownToHtml = async (markdown: string): Promise<string> => {
  const result = new ConvertingMarkdown(markdown)
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
    const md = markdownit();
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
}
