import { PostSlug, PostTag } from "../../types/post";
import _TAG_TO_SLUGS from "../../data/tag-to-slugs.json";

const TAG_TO_SLUGS: Record<string, string[]> = _TAG_TO_SLUGS;

export const getAllPostTags = (): PostTag[] => {
  return Object.keys(TAG_TO_SLUGS);
};

export const getPostSlugsByPostTag = (tag: string): PostSlug[] => {
  return TAG_TO_SLUGS[tag];
};

export const getPostCountByPostTag = (tag: string): number => {
  return TAG_TO_SLUGS[tag].length;
};

export const existsPostTag = (tag: string): boolean => {
  return tag in TAG_TO_SLUGS;
};
