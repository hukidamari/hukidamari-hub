import Link from "next/link";
import styles from "./page.module.css";
import { getRecentPosts } from "@/lib/blog-utils";
import PostList from "@/components/post-list";
import { getAboutUrl, getPostsUrl } from "@/lib/routes";

export default async function Home() {
  const samplePosts = await getRecentPosts(3);

  return (
    <main className={styles.container}>
      {/* Hero / Server Info */}
      <div className={styles.titleWrapper}>
        <h1>ふきだまり</h1>
        <p className={styles.catchcopy}>
          Community Knowledge Base & Asset Hub
        </p>
      </div>

      <section className={styles.section}>
        <h2>Hub Features</h2>
        <ul className={styles.featureList}>
          <li className={styles.featureItem}>
            <h3>📚 Server Docs</h3>
            <p>Rules, roles, and channel guides for the community.</p>
          </li>
          <li className={styles.featureItem}>
            <h3>🤖 Bot Specs</h3>
            <p>Documentation for custom bots and command lists.</p>
          </li>
          <li className={styles.featureItem}>
            <h3>🎨 Member Gallery</h3>
            <p>Share, showcase, and archive member creations.</p>
          </li>
          <li className={styles.featureItem}>
            <h3>📢 Announcements</h3>
            <p>Archive of important server updates and events.</p>
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Recent Updates</h2>
        <PostList posts={samplePosts} />
        <div style={{ textAlign: "right", marginTop: "1rem" }}>
          <Link href={getPostsUrl()} className={styles.right}>
            Browse All Posts
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <h2>About This Hub</h2>
        <div className={styles.featureItem}>
          <p>
             This site serves as a centralized hub for all discord server related data, documents, and creative works.
             Managed via Markdown, accessible to everyone.
          </p>
          <div style={{ textAlign: "right" }}>
            <Link href={getAboutUrl()} className={styles.right}>
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
