import Link from "next/link";
import styles from "./page.module.css";
import { getRecentPosts } from "@/lib/blog-utils";
import PostList from "@/component/post-list";
import Image from "next/image";

export default async function Home() {
  const features = [
    "SSG 対応で高速表示",
    "Markdownで記事管理",
    "タグ管理",
    "ページネーション対応",
    "表示部分とロジック部分を分離",
  ];
  const samplePosts = await getRecentPosts(3);

  return (
    <div className={styles.container}>
      <Image
        src="/images/ogp-main.jpg"
        alt="Vault Blog Thumbnail"
        width={1200}
        height={630}
        className={styles.thumbnail}
      />
      <h1>Vault Blog Core</h1>
      <p className={styles.catchcopy}>
        Markdownで運用できる静的ブログテンプレート
      </p>

      <section className={styles.features}>
        <h2>主な特徴</h2>
        <ul>
          {features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      <section className={styles.posts}>
        <h2>サンプル記事</h2>
        <PostList posts={samplePosts} />
        <Link href="/posts" className={styles.right}>
          もっと見る
        </Link>
      </section>

      <section className={styles.about}>
        <h2>使い方</h2>
        <Link href="/about" className={styles.right}>
          プロジェクト詳細・使い方はこちら
        </Link>
      </section>
    </div>
  );
}
