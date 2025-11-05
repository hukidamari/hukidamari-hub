import { PostSlug, PostTitle, SlugTitleMap } from "../../types/post";
import _slugToTitleJson from "../data/slug-to-title.json";
import _titleToSlugJson from "../data/title-to-slug.json";
import { ROUTES } from "@/config/route";

const SLUG_TO_TITLE: SlugTitleMap = _slugToTitleJson;
const TITLE_TO_SLUG: SlugTitleMap = _titleToSlugJson;

export const slugToTitle = (slug: PostSlug): PostTitle => {
  if (!(slug in SLUG_TO_TITLE)) {
    throw new Error(`Not Found: slug ${slug}`);
  }
  return SLUG_TO_TITLE[slug];
};

export const titleToSlug = (title: PostTitle): PostSlug => {
  if (!(title in TITLE_TO_SLUG)) {
    throw new Error(`Not Found: title ${title}`);
  }
  return TITLE_TO_SLUG[title];
};

export const slugToRoute = (slug: PostSlug): string => {
  return `${ROUTES.POSTS}/${slug}`;
};

export const existsSlug = (slug: PostSlug): boolean => {
  return slug in SLUG_TO_TITLE;
};

export const existsTitle = (title: PostTitle): boolean => {
  return title in TITLE_TO_SLUG;
};

export const getAllPostSlugs = (): PostSlug[] => {
  return Object.keys(SLUG_TO_TITLE);
};
