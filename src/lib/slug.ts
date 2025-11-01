import { SlugTitleMap } from "@/types/post";
import _slugToTitleJson from "../data/slug-to-title.json";
import _titleToSlugJson from "../data/title-to-slug.json";

const SLUG_TO_TITLE: SlugTitleMap = _slugToTitleJson;
const TITLE_TO_SLUG: SlugTitleMap = _titleToSlugJson;

export const slugToTitle = (slug: string): string => {
  if (!(slug in SLUG_TO_TITLE)) {
    throw new Error(`Not Found: slug ${slug}`);
  }
  return SLUG_TO_TITLE[slug];
};

export const titleToSlug = (title: string): string => {
  if (!(title in TITLE_TO_SLUG)) {
    throw new Error(`Not Found: title ${title}`);
  }
  return TITLE_TO_SLUG[title];
};

export const existsSlug = (slug: string): boolean => {
  return slug in SLUG_TO_TITLE;
};

export const existsTitle = (title: string): boolean => {
  return title in TITLE_TO_SLUG;
};
