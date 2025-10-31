import markdownit from "markdown-it";

export const markdownToHtml = async (markdown: string): Promise<string> => {
  const md = markdownit();
  const result = md.render(markdown);
  return result;
};
