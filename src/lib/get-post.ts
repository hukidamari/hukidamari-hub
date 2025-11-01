import { PostMd } from "../types/post";
import { markdownToHtml } from "./markdown-to-html";
import * as fs from "fs";
import matter from "gray-matter";
import { slugToTitle } from "./slug";

const DIR_PATH = "posts";

export const getPost = (slug: string): Promise<string> => {
  const post = getPostMd(slug, slugToTitle(slug));
  return markdownToHtml(post.content);
};

const getPostMd = (slug: string, title: string): PostMd => {
  const entireContent = fs.readFileSync(`${DIR_PATH}/${title}.md`, "utf-8");
  const { content, data } = matter(entireContent);
  return {
    slug: slug,
    content: content,
    frontMatter: {
      title: data.title,
      date: data.date,
      tags: data.tags,
      published: data.published,
    },
  };
};
