import { ConvertingMarkdown } from "./convert-markdown-utils";

export const markdownToHtml = async (markdown: string): Promise<string> => {
  const result = new ConvertingMarkdown(markdown)
    .convertTabToSpaces()
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
    .toString();
  return result;
};
