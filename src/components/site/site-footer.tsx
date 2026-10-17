import Link from "next/link";
import styles from "@/app/layout.module.css";
import { getHomeUrl, getPostsUrl, getTagsUrl, getRssUrl } from "@/lib/routes";
import { Home, BookOpen, Tags, Rss } from "lucide-react";
export default function SiteFooter() {
  return (
        <footer className={styles.footer}>
          <nav>
            <ul className={styles.footerNav}>
              <li>
                <Link href={getHomeUrl()} className={styles.footerNavLink}>
                  <Home size={16} />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link href={getPostsUrl()} className={styles.footerNavLink}>
                  <BookOpen size={16} />
                  <span>Articles</span>
                </Link>
              </li>
              <li>
                <Link href={getTagsUrl()} className={styles.footerNavLink}>
                  <Tags size={16} />
                  <span>Tags</span>
                </Link>
              </li>
              <li>
                <Link href={getRssUrl()} className={styles.footerNavLink}>
                  <Rss size={16} />
                  <span>RSS</span>
                </Link>
              </li>
            </ul>
          </nav>
          <div className={styles.copyright}>
            &copy; hukidamari {new Date().getFullYear()}
          </div>
        </footer>
  );
}
