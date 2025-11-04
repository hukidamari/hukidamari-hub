import { PostHtml, PostMd, PostMeta } from "../types/post";
import { markdownToHtml } from "./markdown-to-html";
import * as fs from "fs";
import matter from "gray-matter";
import { getAllPostSlugs, slugToTitle } from "./slug-map";
import { POSTS_DIR } from "@/config/path";

export const getPost = async (slug: string): Promise<PostHtml> => {
  const postMd = getPostMd(slug, slugToTitle(slug));
  const contentHtml = await markdownToHtml(postMd.contentMd);
  return {
    ...postMd,
    ...{
      contentHtml: contentHtml,
    },
  };
};

const getPostMd = (slug: string, title: string): PostMd => {
  const entireContent = fs.readFileSync(`${POSTS_DIR}/${title}.md`, "utf-8");
  const { content, data } = matter(entireContent);
  return {
    slug: slug,
    title: title,
    contentMd: content,
    tags: data.tags ?? [],
    description: data.description,
    thumbnail: data.thumbnail,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    published: data.published,
  };
};

export const getAllPostMetas = (): PostMeta[] => {
  const allSlugs = getAllPostSlugs();
  return allSlugs.map((slug) => getPostMd(slug, slugToTitle(slug)));
};
