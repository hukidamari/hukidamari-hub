import { getAllTags } from "@/lib/blog-utils";

export default function Tags() {
  const tags = getAllTags();
  return (
    <div>
      <h1>タグ一覧</h1>
      <div>
        <ul>
          {tags.map((tag) => (
            <li key={tag}>
              <a href={`/tags/${tag}`}>{tag}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
