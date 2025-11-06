import Link from "next/link";
import styles from "./about.module.css";
import { POSTS_DIR } from "../../../config/path";
import { getHomeUrl } from "@/lib/routes";

export default function About() {
  const techStack = [
    "Next.js (App Router, SSG)",
    "TypeScript",
    "Markdown運用",
    "Vercel / GitHub Pagesでのデプロイ",
  ];

  const features = [
    "SSG対応で高速表示",
    "Markdownで記事管理",
    "タグ・ページネーション機能",
    "ロジックと表示部分を分離した設計",
    "見た目をカスタマイズしやすい構造",
  ];

  return (
    <div className={styles.container}>
      <h1>プロジェクト詳細 </h1>

      <section className={styles.section}>
        <h2>概要</h2>
        <p>
          このフレームワークは、Markdownで記事を書くだけで静的ブログを構築できるNext.jsテンプレートです。
          記事はSSGで生成され、高速表示が可能です。タグ・ページネーションも対応しています。
          Markdown エディタは Obsidian を使うことを前提に開発したので、特に
          Obsidiadn との相性が良いはずです。
        </p>
      </section>

      <section className={styles.section}>
        <h2>技術スタック</h2>
        <ul>
          {techStack.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2>特徴</h2>
        <ul>
          {features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2>サンプル使い方</h2>
        <ul>
          <li>
            <code>./{POSTS_DIR}</code> 配下に Markdown
            を置くだけで記事が表示されます。
          </li>
          <li>タグページやカテゴリーページも自動生成されます。</li>
          <li>
            表示部分とロジック部分が分離されているので、デザインや機能のカスタマイズが容易です。
          </li>
        </ul>
      </section>

      <Link href={getHomeUrl()} className={styles.homeLink}>
        ← トップページへ戻る
      </Link>
    </div>
  );
}
