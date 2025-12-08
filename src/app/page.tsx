import Link from "next/link";
import styles from "./page.module.css";
import { getPostsByTag, getRecentPosts } from "@/lib/blog-utils";
import PostList from "@/components/post-list";
import { getPostsUrl, getTagUrl } from "@/lib/routes";
import Image from "next/image";

const DOCS_TAG = "docs";
const ABOUT_TAG = "about";

export default async function Home() {
  const samplePosts = await getRecentPosts(3);
  const aboutPosts = (await getPostsByTag(ABOUT_TAG, {oldToNew: true})).slice(0, 3);
  const docPosts = (await getPostsByTag(DOCS_TAG, {oldToNew: true})).filter((post) => !aboutPosts.map((p) => p.slug).includes(post.slug)).slice(0, 3);

  return (
    <main className={styles.container}>
      {/* Hero / Server Info */}
      <div className={styles.titleWrapper}>
        <Image
          src="/images/server-icon.jpg"
          alt="ふきだまり HUB"
          width={100}
          height={100}
        />
        <h1>ふきだまり HUB</h1>
        <p className={styles.catchcopy}>
          Community Knowledge Base & Asset Hub
        </p>
      </div>

      <section className={styles.section}>
        <h2>このサイトの役割</h2>
        <ul className={styles.featureList}>
          <li className={styles.featureItem}>
            <h3>📚 Server Docs</h3>
            <p>サーバーの概要、ルール、チャンネルガイド、企画説明などを掲載します。</p>
          </li>
          <li className={styles.featureItem}>
            <h3>🤖 Bot Specs</h3>
            <p>自作ボットの仕様とコマンド一覧を掲載します。</p>
          </li>
          <li className={styles.featureItem}>
            <h3>🎨 Member Gallery</h3>
            <p>メンバーの制作物を展示するかもしれません。</p>
          </li>
          <li className={styles.featureItem}>
            <h3>📢 Announcements</h3>
            <p>重要なサーバーの更新やイベントを掲載するかもしれません。</p>
          </li>
        </ul>
      </section>
      <section className={styles.section}>
        <h2>サーバー紹介</h2>
        <PostList posts={aboutPosts} />
        <div style={{ textAlign: "right", marginTop: "1rem" }}>
          <Link href={getTagUrl(ABOUT_TAG)} className={styles.right}>
            View All About
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <h2>ドキュメント</h2>
        <PostList posts={docPosts} />
        <div style={{ textAlign: "right", marginTop: "1rem" }}>
          <Link href={getTagUrl(DOCS_TAG)} className={styles.right}>
            View All Docs
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <h2>最新の更新</h2>
        <PostList posts={samplePosts} />
        <div style={{ textAlign: "right", marginTop: "1rem" }}>
          <Link href={getPostsUrl()} className={styles.right}>
            View All Articles
          </Link>
        </div>
      </section>
    </main>
  );
}
