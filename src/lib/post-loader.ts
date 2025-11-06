import { getPostMd } from "../../lib/parse-markdown-utils";
import { PostHtml, PostMeta } from "../../types/post";
import { markdownToHtml } from "./markdown-to-html";
import { getAllPostSlugs, slugToFilename } from "./slug-map";

export const getPostHtml = async (slug: string): Promise<PostHtml> => {
  const postMd = getPostMd(slugToFilename(slug));
  const contentHtml = await markdownToHtml(postMd.contentMd);
  const postHtml: PostHtml = {
    ...postMd,
    ...{
      contentHtml: contentHtml,
      description: generateDescription(postMd, contentHtml),
    },
  };
  return postHtml;
};

const generateDescription = (
  postMd: PostMeta,
  contentHtml: string,
  maxLength = 200
): string => {
  if (postMd.description) {
    return postMd.description;
  }

  const textContent = contentHtml.replace(/<[^>]+>/g, "");
  const cleanText = textContent.replace(/\s+/g, " ").trim();

  if (cleanText.length > maxLength) {
    return cleanText.slice(0, maxLength) + "...";
  }
  return cleanText;
};

export const getAllPostMetas = (): PostMeta[] => {
  const allSlugs = getAllPostSlugs();
  return allSlugs.map((slug) => getPostMd(slugToFilename(slug)));
};
