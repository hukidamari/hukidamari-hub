import type { Metadata } from "next";
import { Geist, Geist_Mono, Wendy_One } from "next/font/google";
import { Home, BookOpen, Tags, Rss } from "lucide-react";
import styles from "./layout.module.css";
import "./globals.css";
import "./markdown.css";
import "./prism.css";
import Link from "next/link";
import Image from "next/image";
import { DEFAULT_METADATA } from "@/config/metadata";
import { getHomeUrl, getPostsUrl, getTagsUrl, getRssUrl } from "@/lib/routes";
import CopyButtonHandler from "@/components/copy-button-handler";
import SearchBox from "@/components/search-box";
import { SITE_TITLE_EN } from "../../config/site-settings";

const wendyOne = Wendy_One({
  weight: ["400"],
  variable: "--font-wendy-one",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = DEFAULT_METADATA;
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${styles.body}`}
      >
        <CopyButtonHandler />
        <header className={styles.header}>
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
        <div className={styles.mainContainer}>{children}</div>
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
      </body>
    </html>
  );
}
