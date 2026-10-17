import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "./layout.module.css";
import "./globals.css";
import "./markdown.css";
import "./prism.css";
import { DEFAULT_METADATA } from "@/config/metadata";
import CopyButtonHandler from "@/components/copy-button-handler";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export const metadata: Metadata = DEFAULT_METADATA;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja">
    <body className={`${geistSans.variable} ${geistMono.variable} ${styles.body}`}>
      <CopyButtonHandler />
      {children}
    </body>
  </html>;
}
