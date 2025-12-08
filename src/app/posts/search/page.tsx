"use client";

import { POST_PER_PAGE } from "@/config/pagination";
import { useEffect, useState, Suspense } from "react";
import { PostMeta, PostSlug } from "../../../../types/post";
import { useSearchParams } from "next/navigation";
import Paginate from "@/components/paginate";
import styles from "./search.module.css";
import { POSTS_META_JSON_URL } from "@/lib/routes";
import searchPosts from "@/lib/search";
import SearchBox from "@/components/search-box";

// 検索ロジックと結果表示を行う内部コンポーネント
function SearchContent() {
  const query = useSearchParams().get("query")?.trim();
  const [page, setPage] = useState<number>(1);
  const [allPosts, setAllPosts] = useState<PostMeta[]>([]);
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [paginatedPosts, setPagingatedPosts] = useState<PostMeta[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      return;
    }
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 0. 全記事のmetadataを取得
        const allPostMetasRes = await fetch(POSTS_META_JSON_URL, { signal });
        if (!allPostMetasRes.ok) {
          throw new Error(
            `Failed to fetch post metadatas: ${allPostMetasRes.statusText}`
          );
        }
        const allPostMetas: Record<PostSlug, PostMeta> =
          await allPostMetasRes.json();

        setAllPosts(Object.values(allPostMetas));
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.error("Error fetching posts:", e);
          setError("記事の読み込みに失敗しました。");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();

    return () => {
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    if (!query) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = searchPosts(Object.values(allPosts), query);

    setPosts(
      result.map((p) => ({
        ...p,
        ...{
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        },
      }))
    );

    setIsLoading(false);
  }, [query, allPosts]);

  useEffect(() => {
    setPagingatedPosts(
      posts.slice((page - 1) * POST_PER_PAGE, page * POST_PER_PAGE)
    );
  }, [posts, page]);

  useEffect(
    () => setTotalPages(Math.ceil(posts.length / POST_PER_PAGE)),
    [posts]
  );

  // queryがない場合
  if (!query) return <h1>検索ワードを入力してください</h1>;

  // データフェッチ中のローディング
  if (isLoading)
    return (
      <>
        <h1>{`"${query}" を検索中...`}</h1>
        <div>Loading...</div>
      </>
    );

  // エラー時
  if (error) return <div>{error}</div>;

  // 結果なし
  if (paginatedPosts.length === 0)
    return <h1>{`"${query}" は見つかりませんでした...`}</h1>;

  // 結果表示
  return (
    <Paginate
      title={`"${query}" の検索結果`}
      posts={paginatedPosts}
      page={page}
      totalPages={totalPages}
      totalPostsCount={posts.length}
      adjacentPageLinks={[...Array(totalPages)].map((_, i) => (
        <button
          key={`adjacnet-page-button-${i}`}
          className={styles.adjacentPageButton}
          onClick={() => setPage(i + 1)}
        >
          {i + 1}
        </button>
      ))}
    />
  );
}

// エクスポートする親コンポーネント
export default function SearchedPosts() {
  return (
    <>
      <main>
        {/* useSearchParamsを使用するコンポーネントをSuspenseでラップ */}
        <Suspense fallback={<div>Loading...</div>}>
          <SearchContent />
        </Suspense>
      </main>
    </>
  );
}
