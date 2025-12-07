import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka } from "next/font/google";
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
  getSearchUrl,
  getTagsUrl,
} from "@/lib/routes";
import CopyButtonHandler from "@/components/copy-button-handler";

const fredoka = Fredoka({
  variable: "--font-fredoka",
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
              <h1 className={`title ${fredoka.variable}`}>ふきだまり</h1>
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
                <li className="nav-li">
                  <Link href={getSearchUrl()}>Search</Link>
                </li>
              </ul>
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
