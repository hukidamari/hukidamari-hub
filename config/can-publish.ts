/**
 * 投稿を公開してよいかを判定する関数
 *
 * @param frontMatter - フロントマターの内容
 * @returns 投稿を公開する場合は true、それ以外は false
 *
 * @example
 * const frontMatter = {
 *   slug: "sample",
 *   createdAt: "2000-01-01",
 *   tags: ["tag1", "tag2"],
 *   thumbnail: "[[sample.jpg]]",
 *   description: "This is sample data",
 *   published: true,
 *   customField: "foobar",
 * };
 *
 * const result = canPublish(frontMatter); // true
 */
export const canPublish = (frontMatter: Record<string, unknown>): boolean => {
  const val = frontMatter.published;
  return typeof val === "boolean" && val === true;
};
