export interface PostMd extends PostMeta {
  contentMd: string;
}

export interface PostHtml extends PostMeta {
  contentHtml: string;
  description: string;
  headings: HeadingWithId[];
}

export interface PostMeta {
  slug: PostSlug;
  title: PostTitle;
  filename: string;
  tags: PostTag[];
  description?: string;
  thumbnail: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FrontMatter {
  slug: string;
  title?: string;
  filename: string;
  tags?: string[];
  description?: string;
  thumbnail?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type SlugFilenameMap = Record<string, string>;

export type PostSlug = string;
export type PostTitle = string;
export type PostTag = string;

export interface HeadingWithId {
  level: number;
  text: string;
  id: string;
}

export interface ReactionData {
  emoji: string;
  count: number;
}

export interface PostReactionDatas {
  [postSlug: string]: ReactionData[];
}
