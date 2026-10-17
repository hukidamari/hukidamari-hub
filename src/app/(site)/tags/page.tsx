import Tag from "@/components/tag";
import { getAllTags, getPostCountByTag } from "@/lib/blog-utils";
import Link from "next/link";
import styles from "./tags.module.css";
import { getTagUrl } from "@/lib/routes";
import PageTitle from "@/components/page-title";
import { TagsIcon } from "lucide-react";

export default function Tags() {
  const tags = getAllTags();
  return (
    <main className={styles.container}>
      <h1 className={styles.title}><PageTitle title="Tags" icon={<TagsIcon size={26} color="var(--color-brand-primary)" />} /></h1>
      <div>
        <ul className={styles.tagList}>
          {tags.map((tag) => (
            <li key={tag} className={styles.item}>
              <Link href={getTagUrl(tag)} className={styles.tagLink}>
                <Tag>{`#${tag} (${getPostCountByTag(tag)}件)`}</Tag>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
