import Link from "next/link";
import styles from "./page.module.css";
import { getRecentPosts } from "@/lib/blog-utils";
import PostList from "@/components/post-list";
import PageThumbnail from "@/components/page-thumbnail";
import { getAboutUrl, getPostsUrl } from "@/lib/routes";

export default async function Home() {
  const features = [
    "Markdownで記事管理",
    "タグ管理",
    "見た目をカスタマイズしやすい構造",
    "ページネーション対応",
    "SSG 対応で高速表示",
    "RSS自動生成",
  ];
  const samplePosts = await getRecentPosts(3);

  return (
    <div className={styles.container}>
      <PageThumbnail alt="Vault Blog Thumbnail" src="/images/ogp-main.jpg" />
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
        <Link href={getPostsUrl()} className={styles.right}>
          もっと見る
        </Link>
      </section>

      <section className={styles.about}>
        <h2>このサイトについて</h2>
        このサイトは <strong>Vault Blog Core</strong> の説明 &
        サンプルサイトです。
        <Link href={getAboutUrl()} className={styles.right}>
          詳細はこちら
        </Link>
      </section>
    </div>
  );
}
