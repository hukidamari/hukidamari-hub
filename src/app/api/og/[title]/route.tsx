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
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#313338", // --color-bg-primary
            padding: "40px",
            position: "relative",
          }}
        >
          {/* Decorative Border Left (Brand Primary) */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "20px",
              backgroundColor: "#5CCAD3", // --color-brand-primary
            }}
          />
          {/* Decorative Border Bottom (Brand Secondary) */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "20px",
              backgroundColor: "#E6C229", // --color-brand-secondary
            }}
          />

          <div
            style={{
              display: "flex",
              fontSize: 70,
              maxWidth: "90%",
              fontWeight: "bold",
              color: "#f2f3f5", // --color-text-header
              textAlign: "center",
              lineHeight: 1.2,
              marginBottom: "40px",
            }}
          >
            {title}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "absolute",
              bottom: 40,
              right: 40,
              color: "#5CCAD3", // --color-brand-primary
              fontSize: 32,
              fontWeight: "bold",
              gap: 15,
              backgroundColor: "rgba(49, 51, 56, 0.9)",
              padding: "10px 20px",
              borderRadius: "8px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${SITE_URL}/images/logo-small.png`}
              style={{
                width: 40,
                height: 40,
                objectFit: "cover",
              }}
              alt="logo"
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
