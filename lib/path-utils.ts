import * as fs from "fs";
import path from "path";
import { POST_ASSET_DEST_DIR, POSTS_DIR, PUBLIC_DIR } from "../config/path";

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
export const getPostMdFilePath = (filename: string) =>
  path.join(POSTS_DIR, `${filename}`);

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
 * RSS / フィードなど
 */
export const getRssUrl = () => `/feed.xml`;
export const getRssFilePath = () => path.join(PUBLIC_DIR, "feed.xml");
