import { PostHtml } from "@/types/post";
import { getPost } from "./post-loader";

// ===== posts =====
export const getAllPostsSortedByCreatedAt = async (): Promise<PostHtml[]> => {
  const allSlugs = getAllSlugs();
  const posts: PostHtml[] = [];
  for (const slug of allSlugs) {
    const post = await getPost(slug);
    posts.push(post);
  }
  // sorted by createdAt
  return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};
export const getPostBySlug = async (slug: string): Promise<PostHtml> => {
  return await getPost(slug);
};
export const getPaginatedPosts = async (
  page: number, // 1-indexed
  limit: number
): Promise<PostHtml[]> => {
  const allPosts = await getAllPostsSortedByCreatedAt();
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return allPosts.slice(startIndex, endIndex);
};
export const getAdjacentPosts = async (
  slug: string
): Promise<{ prev: PostHtml | null; next: PostHtml | null }> => {
  const allPosts = await getAllPostsSortedByCreatedAt();
  const currentIndex = allPosts.findIndex((post) => post.slug === slug);

  const prev = allPosts[currentIndex - 1] ?? null;
  const next = allPosts[currentIndex + 1] ?? null;

  return { prev, next };
};
export const getRelatedPosts = async (tags: string[]): Promise<PostHtml[]> => {
  /* ... */
};
export const getAllSlugs = (): string[] => {
  /* ... */
};
export const getRecentPosts = async (limit: number): Promise<PostHtml[]> => {
  /* ... */
};

// ===== tags =====
export const getAllTags = async () => {
  /* ... */
};
export const getPostsByTag = async (tag: string) => {
  /* ... */
};
export const getPostCountByTag = async () => {
  /* ... */
};

// ===== about =====
export const getSiteConfig = async () => {
  /* ... */
};
export const getSiteMetadata = async () => {
  /* ... */
};

// ===== common =====
export const getPublicAssetUrl = (fileName: string) => {
  /* ... */
};
