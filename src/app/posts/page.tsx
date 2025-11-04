import { POSTS_DIR } from "@/config/path";
import { getAllPostsSortedByCreatedAt } from "@/lib/blog-utils";
import { slugToTitle } from "@/lib/slug-map";

export default async function Posts() {
  const allPosts = await getAllPostsSortedByCreatedAt();
  return (
    <div>
      <h1>投稿一覧</h1>
      <div>
        <ul>
          {allPosts.map((post) => {
            return (
              <li key={post.slug}>
                <a href={`${POSTS_DIR}/${post.slug}`}>
                  {slugToTitle(post.slug)}
                </a>
                <p>{post.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
