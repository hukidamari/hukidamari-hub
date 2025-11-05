import matter from "gray-matter";
import { FrontMatter, PostMd, PostMeta } from "../types/post";
import { POSTS_DIR } from "../config/path";
import * as fs from "fs";
import { publicFileNameToUrl } from "./public-files";

export const parseFrontMatter = (
  filePath: string,
  fm: FrontMatter
): PostMeta => {
  return {
    slug: fm.slug,
    title: fm.title ?? filePath.replace(".md", ""),
    tags: fm.tags ?? [],
    description: fm.description,
    thumbnail: fm.thumbnail ?? null,
    createdAt: new Date(fm.createdAt),
    updatedAt: new Date(fm.updatedAt),
  };
};

export const getPostMd = (slug: string, title: string): PostMd => {
  const entireContent = fs.readFileSync(`${POSTS_DIR}/${title}.md`, "utf-8");
  const { content, data } = matter(entireContent);
  return {
    slug: slug,
    title: title,
    contentMd: content,
    tags: data.tags ?? [],
    description: data.description,
    thumbnail: convertThumbnailPath(data.thumbnail),
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
};

const convertThumbnailPath = (thumbnailFm: string): string | null => {
  if (!thumbnailFm) {
    return null;
  }

  const regex = new RegExp(`\\[\\[(.+?)\\.(png|jpg|gif)\\]\\]`);
  const match = thumbnailFm.match(regex);

  if (!match) {
    return null;
  }

  const p1 = match[1];
  const ext = match[2];
  const parts = p1.split("|");
  const fileName = `${parts[0]}.${ext}`;

  return publicFileNameToUrl(fileName);
};
