import { Metadata } from "next";

export const DEFAULT_METADATA: Metadata = {
  title: "hukidamariHUB",
  description: "Discordサーバー「ふきだまり」の公式サイト",
  openGraph: {
    title: "hukidamariHUB",
    description: "Discordサーバー「ふきだまり」の公式サイト",
    images: [
      {
        url: "/images/ogp-main.jpg", // 🌟 静的画像の指定
        width: 1200,
        height: 630,
      },
    ],
  },
};

export const gnerateMetadataTitle = (title: string): string => {
  return title ? `${title} | hukidamariHUB` : "hukidamariHUB";
};
