import { generateDescription, getPostMd } from "../../lib/parse-markdown-utils";
import { PostHtml, PostMeta } from "../../types/post";
import { getAllPostSlugs, slugToFilename } from "./slug-map";
import { ConvertingMarkdown } from "./convert-markdown-utils";

export const getPostHtml = async (slug: string): Promise<PostHtml> => {
  const postMd = getPostMd(slugToFilename(slug));
  const convertingMarkdown = new ConvertingMarkdown(postMd.contentMd);
  const contentHtml = convertingMarkdown.executeAll();
  const postHtml: PostHtml = {
    ...postMd,
    ...{
      contentHtml: contentHtml,
      description: generateDescription(postMd.description, contentHtml),
      headings: convertingMarkdown.headings,
    },
  };
  return postHtml;
};
export const getAllPostMetas = (): PostMeta[] => {
  const allSlugs = getAllPostSlugs();
  return allSlugs.map((slug) => getPostMd(slugToFilename(slug)));
};
