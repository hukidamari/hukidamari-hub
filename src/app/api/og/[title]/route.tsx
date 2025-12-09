import "dotenv/config";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_TITLE_EN } from "../../../../../config/site-settings";

const SITE_URL = process.env.SITE_URL;

// Node.js ランタイムにする
export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ title: string }> }
) {
  const { title } = await params;
  // Font loading, process.cwd() is Next.js project directory
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

          {/* Server Icon */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${SITE_URL}/images/server-icon.jpg`}
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              marginBottom: "30px",
              border: "4px solid #313338", // Optional: small border to separate from background if needed, or remove
              boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
              objectFit: "cover",
            }}
            alt="Server Icon"
          />

          <div
            style={{
              display: "flex",
              fontSize: 60, // Slightly reduced to fit icon
              maxWidth: "90%",
              fontWeight: "bold",
              color: "#f2f3f5", // --color-text-header
              textAlign: "center",
              lineHeight: 1.2,
              marginBottom: "80px", // More space for bottom border
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
              right: 16,
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
              src={`${SITE_URL}/images/server-icon.jpg`}
              style={{
                width: 40,
                height: 40,
                borderRadius: "25%",
                objectFit: "cover",
              }}
              alt="logo"
            />
            {SITE_TITLE_EN}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
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
