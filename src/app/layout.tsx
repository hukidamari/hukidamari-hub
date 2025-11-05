import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka } from "next/font/google";
import "./globals.css";
import "./markdown.css";
import Link from "next/link";
import Image from "next/image";

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

export const metadata: Metadata = {
  openGraph: {
    title: "Vault Blog Core",
    description: "Markdownファイル群をブログとして公開するためのフレームワーク",
    images: [
      {
        url: "/images/ogp-main.jpg", // 🌟 静的画像の指定
        width: 1200,
        height: 630,
      },
    ],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header>
          <Link href="/" className="title-link">
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
                <Link href="/">Home</Link>
              </li>
              <li className="nav-li">
                <Link href="/about">About</Link>
              </li>
              <li className="nav-li">
                <Link href="/posts">Posts</Link>
              </li>
              <li className="nav-li">
                <Link href="/tags">Tags</Link>
              </li>
            </ul>
          </nav>
        </header>
        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}
