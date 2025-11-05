import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka } from "next/font/google";
import "./globals.css";
import "./markdown.css";
import Link from "next/link";
import Image from "next/image";
import { DEFAULT_METADATA } from "@/config/metadata";
import {
  getAboutUrl,
  getHomeUrl,
  getPostsUrl,
  getRssUrl,
  getTagsUrl,
} from "../../lib/path-utils";

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
        <header>
          <Link href={getHomeUrl()} className="title-link">
            <Image
              src="/images/logo-small.png"
              alt="Vault Blog Logo"
              width={40}
              height={40}
              className="logo"
            />
            <h1 className={`title ${fredoka.variable}`}>Vault Blog Core</h1>
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
            <Link
              href={getRssUrl()}
              target="_blank"
              title="RSS Feed"
              className="rss-link"
            >
              RSS
            </Link>
          </nav>
        </header>
        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}
