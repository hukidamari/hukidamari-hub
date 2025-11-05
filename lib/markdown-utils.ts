import matter from "gray-matter";
import { FrontMatter, PostMd, PostMeta, PostSlug } from "../types/post";
import { POSTS_DIR } from "../config/path";
import * as fs from "fs";
import { getPostAssetUrlByFilename } from "./path-utils";

export const extractFrontMatter = (filePath: string) => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return matter(fileContent);
};

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
  const { content, data } = extractFrontMatter(`${POSTS_DIR}/${title}.md`);
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

  return getPostAssetUrlByFilename(fileName);
};

export const allEmbedWikiLinksRegex = (): RegExp => {
  return new RegExp("!\\[\\[(.+?)\\]\\]", "g");
};

export const allWikiLinksRegex = (): RegExp => {
  return new RegExp("\\[\\[(.+?)\\]\\]", "g");
};

export const parseWikiLinkContent = (
  content: string
): { filename: string; ext: string | null; alt: string | null } => {
  const parts = content.split("|");
  const pathData = parts[0].split(".");
  const filename = pathData[0];
  let alt = null;
  let ext = null;
  if (parts.length >= 2) {
    alt = parts.slice(1).join("");
  }
  if (pathData.length > 1) {
    ext = pathData[parts.length];
  }
  console.log({ filename, ext, alt });
  return { filename, ext, alt };
};

export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const embedPageGenerator = (alt: string, url: PostSlug): string => {
  return pageLinkGenerator(alt, url);
};
export const embedImageGenerator = (filename: string, ext: string): string => {
  const filePath = `${filename}.${ext}`;
  const url = getPostAssetUrlByFilename(filePath);
  return `![${filename}](${url})`;
};
export const embedSoundGenerator = (filename: string, ext: string): string => {
  const filePath = `${filename}.${ext}`;
  const url = getPostAssetUrlByFilename(filePath);
  return `<audio src="${url}" controls></audio>`;
};
export const embedMovieGenerator = (filename: string, ext: string): string => {
  const filePath = `${filename}.${ext}`;
  const url = getPostAssetUrlByFilename(filePath);
  return `<video src="${url}" controls></video>`;
};
export const pageLinkGenerator = (alt: string, url: PostSlug): string => {
  return `[${alt}](${url})`;
};
export const imageLinkGenerator = (filename: string, ext: string): string => {
  return embedImageGenerator(filename, ext);
};
export const soundLinkGenerator = (filename: string, ext: string): string => {
  return embedSoundGenerator(filename, ext);
};
export const movieLinkGenerator = (filename: string, ext: string): string => {
  return embedMovieGenerator(filename, ext);
};
