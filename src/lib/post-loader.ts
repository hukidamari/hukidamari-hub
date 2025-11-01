import { PostHtml, PostMd } from "../types/post";
import { markdownToHtml } from "./markdown-to-html";
import * as fs from "fs";
import matter from "gray-matter";
import { slugToTitle } from "./slug-map";

const DIR_PATH = "posts";

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
  const entireContent = fs.readFileSync(`${DIR_PATH}/${title}.md`, "utf-8");
  const { content, data } = matter(entireContent);
  return {
    slug: slug,
    title: data.title,
    contentMd: content,
    tags: data.tags,
    description: data.description,
    thumbnail: data.thumbnail,
    createdAt: data.createdAt, // TODO: conver to Date
    updatedAt: data.updatedAt, // TODO: conver to Date
    published: data.published,
  };
};
