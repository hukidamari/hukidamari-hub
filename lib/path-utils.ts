import * as fs from "fs";
import path from "path";
import { POST_ASSET_DEST_DIR, POSTS_DIR, PUBLIC_DIR } from "../config/path";
import { PostTitle } from "../types/post";

export const existsPostAsset = (fileName: string): boolean => {
  return fs.existsSync(path.join(POST_ASSET_DEST_DIR, fileName));
};

export const getPostAssetUrlByFilename = (fileName: string): string => {
  return `/post-assets/${encodeForURI(fileName)}`;
};

export const encodeForURI = (text: string) => {
  return encodeURIComponent(text.replace(/\s/g, "-"));
};

/**
 * Markdownファイル関連
 */
export const getPostMdFilePath = (title: PostTitle) =>
  path.join(POSTS_DIR, `${title}.md`);

/**
 * 各ページのURL生成
 */
export const getHomeUrl = () => `/`;

export const getPostsUrl = () => `/posts`;

export const getPostsPageUrl = (page: number) => `/posts/page/${page}`;

export const getPostUrl = (slug: string) => `/posts/${slug}`;

export const getTagsUrl = () => `/tags`;

export const getTagUrl = (tag: string) => `/tags/${encodeForURI(tag)}`;

export const getAboutUrl = () => `/about`;

/**
 * 画像・サムネイル関連
 */
export const getThumbnailFilePath = (filename: string) =>
  path.join(POST_ASSET_DEST_DIR, filename);

export const getThumbnailUrl = (filename: string) => `/${filename}`;

/**
 * RSS / フィードなど
 */
export const getRssUrl = () => `/feed.xml`;
export const getRssFilePath = () => path.join(PUBLIC_DIR, "feed.xml");
