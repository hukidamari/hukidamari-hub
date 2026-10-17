import type { Metadata } from "next";
import EmojiEditor from "@/components/emoji/emoji-editor";

export const metadata: Metadata = {
  title: "絵文字工房 | ふきだまり",
  description: "素材とひとことから、ふきだまりの絵文字をつくる工房。",
};

export default function EmojiPage() {
  return <EmojiEditor />;
}
