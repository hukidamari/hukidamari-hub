import type { Metadata } from "next";
import { Geist, Geist_Mono, Wendy_One } from "next/font/google";
import styles from "./layout.module.css";
import "./globals.css";
import "./markdown.css";
import "./prism.css";
import Link from "next/link";
import Image from "next/image";
import { DEFAULT_METADATA } from "@/config/metadata";
import {
  getHomeUrl,
  getPostsUrl,
  getTagsUrl,
} from "@/lib/routes";
import CopyButtonHandler from "@/components/copy-button-handler";
import SearchBox from "@/components/search-box";

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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
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
              <h1 className={`${styles.title} ${wendyOne.variable}`}>hukidamariHUB</h1>
            </Link>
            <nav className={styles.nav}>
              <ul className={styles.navUl}>
                <li className={styles.navLi}>
                  <Link href={getHomeUrl()}>Home</Link>
                </li>
                <li className={styles.navLi}>
                  <Link href={getPostsUrl()}>Posts</Link>
                </li>
                <li className={styles.navLi}>
                  <Link href={getTagsUrl()}>Tags</Link>
                </li>
              </ul>
            </nav>
            <div className={styles.searchBoxContainer}>
              <SearchBox />
            </div>
        </header>
        <div className={styles.mainContainer}>
          {children}
        </div>
      </body>
    </html>
  );
}
