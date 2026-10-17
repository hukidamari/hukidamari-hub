import Link from "next/link";
import styles from "@/app/layout.module.css";
import { getHomeUrl, getPostsUrl, getTagsUrl, getEmojiUrl } from "@/lib/routes";
import Image from "next/image";
import { Wendy_One } from "next/font/google";
import { Home, BookOpen, Tags, SmilePlus } from "lucide-react";
import SearchBox from "@/components/search-box";
import { SITE_TITLE_EN } from "../../../config/site-settings";
const wendyOne = Wendy_One({weight: ["400"], variable: "--font-wendy-one", subsets: ["latin"]});
export default function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
        <header className={`${styles.header} ${compact ? styles.compactHeader : ""}`}>
          <Link href={getHomeUrl()} className={styles.titleLink}>
            <Image
              src="/images/server-icon.jpg"
              alt="Hukidamari Logo"
              width={32}
              height={32}
              className={styles.logo}
            />
            <h1 className={`${styles.title} ${wendyOne.variable}`}>
              {SITE_TITLE_EN}
            </h1>
          </Link>
          <nav className={styles.nav}>
            <ul className={styles.navUl}>
              <li className={styles.navLi}>
                <Link href={getHomeUrl()}>
                  <Home size={18} />
                  <span>Home</span>
                </Link>
              </li>
              <li className={styles.navLi}>
                <Link href={getPostsUrl()}>
                  <BookOpen size={18} />
                  <span>Articles</span>
                </Link>
              </li>
              <li className={styles.navLi}>
                <Link href={getEmojiUrl()}>
                  <SmilePlus size={18} />
                  <span>Emoji</span>
                </Link>
              </li>
              <li className={styles.navLi}>
                <Link href={getTagsUrl()}>
                  <Tags size={18} />
                  <span>Tags</span>
                </Link>
              </li>
            </ul>
          </nav>
          <div className={styles.searchBoxContainer}>
            <SearchBox />
          </div>
        </header>
  );
}
