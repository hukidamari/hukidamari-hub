import { getAllSlugs, getPostBySlug, getRelatedPosts } from "@/lib/blog-utils";
import { PostSlug } from "@/types/post";

export const generateStaticParams = (): { slug: PostSlug }[] => {
  return getAllSlugs().map((slug) => ({ slug }));
};

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: PostSlug }>;
}) {
  console.log("Generating static params for blog posts", await params);
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const relatedPosts = await getRelatedPosts(post);
  return (
    <div className="post-container">
      <div className="metadata-container">
        <div className="date-container">
          <p className="date created-at">
            投稿日:{post.createdAt.toDateString()}
          </p>
          <p className="date updated-at">
            更新日:{post.updatedAt.toDateString()}
          </p>
        </div>
        <ul className="tag-container">
          {post.tags.map((tag) => (
            <li key={tag} className="tag">
              {tag}
            </li>
          ))}
        </ul>
        <h1>{post.title}</h1>
      </div>
      <div
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
      <div>
        <h2>関連記事</h2>
        <ul>
          {relatedPosts.map((post) => (
            <li key={post.slug}>
              <a href={`/posts/${post.slug}`}>{post.title}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
