export interface PostMd extends PostMeta {
  contentMd: string;
}

export interface PostHtml extends PostMeta {
  contentHtml: string;
  description: string;
}

export interface PostMeta {
  slug: PostSlug;
  title: PostTitle;
  tags: PostTag[];
  description?: string;
  thumbnail: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FrontMatter {
  slug: string;
  title?: string;
  tags?: string[];
  description?: string;
  thumbnail?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type SlugTitleMap = Record<string, string>;

export type PostSlug = string;
export type PostTitle = string;
export type PostTag = string;
