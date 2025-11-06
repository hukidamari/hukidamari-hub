import matter from "gray-matter";
import { FrontMatter, PostMd, PostMeta } from "../types/post";
import * as fs from "fs";
import { getPostMdFilePath } from "./path-utils";

export const extractFrontMatter = (filePath: string) => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return matter(fileContent);
};

export const parseFrontMatter = (
  filename: string,
  fm: FrontMatter
): PostMeta => {
  return {
    slug: fm.slug,
    title: fm.title ?? filename.replace(".md", ""),
    filename: filename,
    tags: fm.tags ?? [],
    description: fm.description,
    thumbnail: fm.thumbnail ? getThumbnailFilename(fm.thumbnail) : null,
    createdAt: new Date(fm.createdAt),
    updatedAt: new Date(fm.updatedAt),
  };
};

export const getPostMd = (filename: string): PostMd => {
  const { content, data } = extractFrontMatter(getPostMdFilePath(filename));
  return {
    contentMd: content,
    ...parseFrontMatter(filename, data as FrontMatter),
  };
};

const getThumbnailFilename = (thumbnailFm: string): string | null => {
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
  const filename = `${parts[0]}.${ext}`;

  return filename;
};

export const allCodeBlocksSimpleRegex = (): RegExp => {
  return new RegExp("```[\\s\\S]*?```", "g");
};

export const allEmbedWikiLinksRegex = (): RegExp => {
  return new RegExp("!\\[\\[(.+?)\\]\\]", "g");
};

export const allWikiLinksRegex = (): RegExp => {
  return new RegExp("\\[\\[(.+?)\\]\\]", "g");
};

export const parseWikiLinkContent = (
  content: string
): { basename: string; ext: string | null; alt: string | null } => {
  const parts = content.split("|");
  const pathData = parts[0].split(".");
  const basename = pathData[0];
  let alt = null;
  let ext = null;
  if (parts.length >= 2) {
    alt = parts.slice(1).join("");
  }
  if (pathData.length > 1) {
    ext = pathData[parts.length];
  }
  return { basename, ext, alt };
};

export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
