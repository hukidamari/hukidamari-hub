import Link from "next/link";
import styles from "./about.module.css";
import { getHomeUrl } from "@/lib/routes";
import Image from "next/image";

export default function About() {
  const techStack = [
    "Next.js (App Router, SSG対応)",
    "TypeScript",
    "Markdown 運用",
  ];

  const features = [
    "Obsidianなどのローカル環境と連携しやすい構造",
    "SSGによる高速なページ表示",
    "Markdownファイルから自動で記事・タグ・ページ生成",
    "ロジックとUIを分離した柔軟な設計",
    "デザインやルーティングの自由なカスタマイズが可能",
  ];

  return (
    <main className={styles.container}>
      <h1>Vault Blog Core について</h1>

      <section className={styles.section}>
        <h2>概要</h2>
        <p>
          <strong>Vault Blog Core</strong> は、 Obsidian などの
          <strong>ローカルノート環境で書いた Markdown</strong> をそのまま Web
          ブログとして公開できるようにするための、
          <strong>Next.js 製ブログテンプレート</strong>です。
        </p>
        <p>
          投稿データの構造や変換ロジックを分離しており、 開発者が
          <strong>「自分の好みのデザイン構成」</strong>
          でブログを作れるように設計されています。
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
        <p>
          このサイト管理用の Obsidian Vault も
          <Link
            href="https://github.com/no-la/vault-blog-sample-vault/tree/main"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.repoLink}
          >
            別の GitHub リポジトリ
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
        <ol>
          <li>
            Markdown で記事を書く
            <div>
              <Image
                src="/images/sample05.png"
                alt="sample05"
                width={520}
                height={500}
                className={styles.shadow}
              ></Image>
            </div>
          </li>
          <li>
            コマンド <code>sh scripts/run-update-posts.sh</code> で
            記事データを自動で収集・解析
            <div>
              <Image
                src="/images/sample02.png"
                alt="sample02"
                width={620}
                height={100}
                className={styles.shadow}
              ></Image>
            </div>
          </li>
          <li>
            <code>pnpm build</code>{" "}
            コマンドで、収集・解析したデータを元に各ページを生成
            <div>
              <Image
                src="/images/sample03.png"
                alt="sample03"
                width={500}
                height={220}
                className={styles.shadow}
              ></Image>
            </div>
          </li>
          <li>
            投稿完了!🎉
            <div>
              <Image
                src="/images/sample06.png"
                alt="sample06"
                width={500}
                height={550}
                className={styles.shadow}
              ></Image>
            </div>
          </li>
        </ol>
        <div>
          <p>
            <strong>
              より詳細な説明や導入方法・使い方は、{" "}
              <Link href="/posts" className={styles.inlineLink}>
                投稿一覧ページ
              </Link>
              {"  "}
              から確認できます。
            </strong>
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <h2>想定する利用シーン</h2>
        <ul>
          <li>外部 Markdown ファイル群の一部をブログ化したい人</li>
          <li>Obsidian ノートをブログ化したい個人開発者</li>
          <li>Markdown ベースで執筆したいエンジニア・研究者</li>
          <li>フロントエンドを自由に設計してブログを作りたい人</li>
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
              className={styles.snsLink}
            >
              Twitter
            </Link>
          </li>
          <li>
            <Link
              href="https://github.com/no-la"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.snsLink}
            >
              GitHub
            </Link>
          </li>
        </ul>
      </section>

      <Link href={getHomeUrl()} className={styles.homeLink}>
        ← トップページへ戻る
      </Link>
    </main>
  );
}
