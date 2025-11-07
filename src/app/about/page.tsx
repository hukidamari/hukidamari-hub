import Link from "next/link";
import styles from "./about.module.css";
import { getHomeUrl } from "@/lib/routes";

export default function About() {
  const techStack = [
    "Next.js (App Router, SSG対応)",
    "TypeScript",
    "Markdown 運用",
    "Vercel / GitHub Pages デプロイ対応",
  ];

  const features = [
    "Obsidianなどのローカル環境と連携しやすい構造",
    "SSGによる高速なページ表示",
    "Markdownファイルから自動で記事・タグ・ページ生成",
    "ロジックとUIを分離した柔軟な設計",
    "デザインやルーティングの自由なカスタマイズが可能",
  ];

  return (
    <div className={styles.container}>
      <h1>Vault Blog Core について</h1>

      <section className={styles.section}>
        <h2>概要</h2>
        <p>
          <strong>Vault Blog Core</strong> は、
          <strong>
            Obsidian などのローカルノート環境で書いた Markdown
          </strong>{" "}
          をそのまま Web ブログとして公開できるようにするための、
          <strong>Next.js 製ブログテンプレート</strong>です。
        </p>
        <p>
          投稿データの構造や変換ロジックを分離しており、
          開発者が「自分の好みのデザイン構成」でブログを作れるように設計されています。
        </p>
        <p>
          プロジェクトのソースコードは
          <Link
            href="https://github.com/no-la/vault-blog-core"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.repoLink}
          >
            GitHub リポジトリ
          </Link>
          で公開しています。
        </p>
      </section>

      <section className={styles.section}>
        <h2>目的</h2>
        <p>
          開発主の「Obsidian で書いたノートをそのままブログ化したい」
          「記事データとデザインを完全に分けたい」
          という発想から生まれたプロジェクトです。
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
        <h2>基本的な使い方</h2>
        <ul>
          <li>
            Markdown ファイルがあるディレクトリのパスなどを <code>.env</code>{" "}
            ファイルに設定します
          </li>
          <li>
            コマンド <code>sh scripts/run-update-posts.sh</code> を実行すると、
            記事データが自動で収集・解析されます
          </li>
          <li>
            <code>pnpm build</code>{" "}
            コマンドで、収集・解析したデータを元に各ページを生成します
          </li>
          <li>
            デザイン部分は <code>src/app</code> 配下の React
            コンポーネントとして分離されており、 CSS Modules や Emotion
            など自由なスタイル手法でカスタマイズ可能です
          </li>
          <li>
            <p>
              <strong>
                より詳細な説明や使い方は、{" "}
                <Link href="/posts" className={styles.inlineLink}>
                  投稿一覧ページ
                </Link>
                から確認できます。
              </strong>
            </p>
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>想定する利用シーン</h2>
        <ul>
          <li>Obsidian ノートをブログ化したい個人開発者</li>
          <li>SSG（静的サイト生成）型のブログを自作したい人</li>
          <li>自分のブログを完全に TypeScript で管理したい人</li>
          <li>Markdown ベースで執筆したいエンジニア・研究者</li>
        </ul>
      </section>
      <section className={styles.section}>
        <h2>開発者情報</h2>
        <p>
          本プロジェクトは{" "}
          <Link
            href="https://twitter.com/nola_0216"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.inlineLink}
          >
            @nola_0216
          </Link>{" "}
          によって開発されています。
        </p>
        <p>ご連絡は以下のリンクからどうぞ。</p>
        <ul>
          <li>
            <Link
              href="https://twitter.com/nola_0216"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.inlineLink}
            >
              Twitter (現 X)
            </Link>
          </li>
          <li>
            <Link
              href="https://github.com/no-la"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.inlineLink}
            >
              GitHub
            </Link>
          </li>
        </ul>
      </section>

      <Link href={getHomeUrl()} className={styles.homeLink}>
        ← トップページへ戻る
      </Link>
    </div>
  );
}
