import Tag from "@/components/tag";
import { getAllTags, getPostCountByTag } from "@/lib/blog-utils";
import Link from "next/link";
import styles from "./tags.module.css";
import { getTagUrl } from "@/lib/routes";

export default function Tags() {
  const tags = getAllTags();
  return (
    <div>
      <h1>タグ一覧</h1>
      <div>
        <ul className={styles.tagList}>
          {tags.map((tag) => (
            <li key={tag}>
              <Link href={getTagUrl(tag)} className={styles.tagLink}>
                <Tag>{`#${tag} (${getPostCountByTag(tag)}件)`}</Tag>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
