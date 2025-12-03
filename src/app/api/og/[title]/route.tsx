import "dotenv/config";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const SITE_URL = process.env.SITE_URL;

// Node.js ランタイムにする
export const runtime = "nodejs";

const titleColor = (): string => {
  return "#0077ff";
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ title: string }> }
) {
  const { title } = await params;
  // Font loading, process.cwd() is Next.js project directory
  const zenKakuGothicNewBold = await readFile(
    join(process.cwd(), "assets/Fredoka-Medium.ttf")
  );
  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: "630px",
            width: "1200px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            padding: "0",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${SITE_URL}/images/ogp-background.jpg`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: -99,
            }}
            alt="ogp-image"
          />
          <div
            style={{
              position: "relative",
              top: 10,
              fontSize: 80,
              maxWidth: "90%",
              fontWeight: "bold",
              color: titleColor(),
              textAlign: "center",
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              position: "absolute",
              alignItems: "center",
              bottom: 0,
              right: 0,
              margin: "20px 40px",
              color: "#0070f3",
              fontSize: 40,
              fontWeight: "bold",
              gap: 10,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${SITE_URL}/images/logo-small.png`}
              style={{
                width: 40,
                height: 40,
                objectFit: "cover",
                zIndex: -90,
              }}
              alt="logo-image"
            />
            Vault Blog Core
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Zen-Kaku",
            data: zenKakuGothicNewBold,
            style: "normal",
            weight: 700,
          },
        ],
      }
    );
  } catch (e) {
    if (e instanceof Error) {
      console.log(`${e.message}`);
    }
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
