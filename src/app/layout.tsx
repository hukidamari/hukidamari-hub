import type { Metadata } from "next";
import { Geist, Geist_Mono, Wendy_One } from "next/font/google";
import "./globals.css";
import "./markdown.css";
import "./prism.css";
import Link from "next/link";
import Image from "next/image";
import { DEFAULT_METADATA } from "@/config/metadata";
import {
  getAboutUrl,
  getHomeUrl,
  getPostsUrl,
  getRssUrl,
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
        <header>
          <div className="nav-container">
            <Link href={getHomeUrl()} className="title-link">
              <Image
                src="/images/server-icon.jpg"
                alt="Hukidamari Logo"
                width={32}
                height={32}
                className="logo"
                style={{ borderRadius: "50%" }}
              />
              <h1 className={`title ${wendyOne.variable}`}>hukidamariHUB</h1>
            </Link>
            <nav>
              <ul className="nav-ul">
                <li className="nav-li">
                  <Link href={getHomeUrl()}>Home</Link>
                </li>
                <li className="nav-li">
                  <Link href={getAboutUrl()}>About</Link>
                </li>
                <li className="nav-li">
                  <Link href={getPostsUrl()}>Posts</Link>
                </li>
                <li className="nav-li">
                  <Link href={getTagsUrl()}>Tags</Link>
                </li>
              </ul>
              <div style={{ marginLeft: "1rem" }}>
                <SearchBox />
              </div>
            </nav>
            <Link
              href={getRssUrl()}
              target="_blank"
              title="RSS Feed"
              className="rss-link"
            >
              RSS
            </Link>
          </div>
        </header>
        <div className="main-container">
          {children}
        </div>
      </body>
    </html>
  );
}
