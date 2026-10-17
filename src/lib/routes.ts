export const getPostAssetUrlByFilename = (fileName: string): string => {
  return `/post-assets/${encodeURIComponent(fileName)}`;
};

export const POSTS_META_JSON_URL = `/posts-meta.json`;

/**
 * 各ページのURL生成
 */
export const getHomeUrl = () => `/`;

export const getPostsUrl = () => `/posts`;

export const getPostsPageUrl = (page: number) => `/posts/page/${page}`;

export const getPostUrl = (slug: string) => `/posts/${slug}`;

export const getTagsUrl = () => `/tags`;

export const getTagUrl = (tag: string) => `/tags/${encodeURIComponent(tag)}`;

export const getAboutUrl = () => `/about`;

export const getSearchUrl = (query: string = "") =>
  query ? `/posts/search?query=${encodeURIComponent(query)}}` : `/posts/search`;

/**
 * RSS / フィードなど
 */
export const getRssUrl = () => `/feed.xml`;

export const getEmojiUrl = () => `/emoji`;
