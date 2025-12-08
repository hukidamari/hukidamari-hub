import { Metadata } from "next";
import { ogApiUrl } from "./api-route";

const SITE_TITLE = "ふきだまり HUB";
const SITE_DESCRIPTION = "Discordサーバー「ふきだまり」の公式サイト";

export const DEFAULT_METADATA: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: ogApiUrl(SITE_TITLE),
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
  return title ? `${title} | ${SITE_TITLE}` : SITE_TITLE;
};
