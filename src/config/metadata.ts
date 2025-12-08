import { Metadata } from "next";
import { ogApiUrl } from "./api-route";

export const DEFAULT_METADATA: Metadata = {
  title: "hukidamariHUB",
  description: "Discordサーバー「ふきだまり」の公式サイト",
  openGraph: {
    title: "hukidamariHUB",
    description: "Discordサーバー「ふきだまり」の公式サイト",
    images: [
      {
        url: ogApiUrl("hukidamariHUB"),
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const gnerateMetadataTitle = (title: string): string => {
  return title ? `${title} | hukidamariHUB` : "hukidamariHUB";
};
