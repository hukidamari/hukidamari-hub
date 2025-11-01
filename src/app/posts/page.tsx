import { getAllPostSlugs, slugToTitle } from "@/lib/slug";

export default function Posts() {
  const slugs = getAllPostSlugs();
  console.log(slugs);
  return (
    <div>
      <h1>投稿一覧</h1>
      <div>
        <ul>
          {slugs.map((slug) => {
            return (
              <li key={slug}>
                <a href={`posts/${slug}`}>{slugToTitle(slug)}</a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
