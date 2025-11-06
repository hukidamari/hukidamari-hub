import { encodeForURI } from "../../lib/path-utils";

export const getPostAssetUrlByFilename = (fileName: string): string => {
  return `/post-assets/${encodeForURI(fileName)}`;
};

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
