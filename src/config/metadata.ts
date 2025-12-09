import { Metadata } from "next";
import { ogApiUrl } from "./api-route";
import { SITE_TITLE } from "../../config/site-settings";

const SITE_DESCRIPTION = "Discordサーバー「ふきだまり」の公式サイト";

export const DEFAULT_METADATA: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/main-ogp.png",
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
