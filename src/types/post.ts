export interface PostMd extends PostMeta {
  contentMd: string;
}

export interface PostHtml extends PostMeta {
  contentHtml: string;
}

export interface PostMeta {
  slug: PostSlug;
  title: PostTitle;
  published: boolean;
  tags: PostTag[];
  description?: string;
  thumbnail: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SlugTitleMap = Record<string, string>;

export type PostSlug = string;
export type PostTitle = string;
export type PostTag = string;
