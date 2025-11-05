import { Metadata } from "next";

export const DEFAULT_METADATA: Metadata = {
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
