import { useState, useEffect, useRef } from "react";
import { HeadingWithId } from "../../types/post";

export const useActiveHeading = (headings: HeadingWithId[]) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);

  // isAutoScrolling の最新値を Observer コールバックで参照するための Ref
  const isAutoScrollingRef = useRef(false);

  // Refの値を最新に保つための useEffect
  useEffect(() => {
    isAutoScrollingRef.current = isAutoScrolling;
  }, [isAutoScrolling]);

  // Observerからの更新を処理する関数
  const updateActiveByObserver = (id: string) => {
    // Refを使って自動スクロール中かどうかをチェック
    if (isAutoScrollingRef.current) return;

    // 値が変わる場合のみ更新（不要な再レンダリングを抑制）
    setActiveId((prevId) => (prevId !== id ? id : prevId));
  };

  // 目次クリック時の処理
  const handleTocClick = (id: string) => {
    setIsAutoScrolling(true);
    setActiveId(id);

    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
    const scrollDuration = 500; // NOTE: 適宜調整

    setTimeout(() => {
      setIsAutoScrolling(false);
    }, scrollDuration);
  };

  // IntersectionObserverのセットアップと監視
  useEffect(() => {
    const headingElements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    // PC/モバイル判定は1回のみ実行
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const rootMargin = isMobile ? "0px 0px -60% 0px" : "0px 0px -70% 0px";

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((entry) => entry.isIntersecting);
        if (intersecting.length === 0) return;

        // NOTE: ページ上部に近いものを優先 (topが小さいもの)
        const topEntry = intersecting.reduce((prev, curr) =>
          curr.boundingClientRect.top < prev.boundingClientRect.top
            ? curr
            : prev
        );
        updateActiveByObserver(topEntry.target.id);
      },
      {
        rootMargin,
        threshold: 0,
      }
    );

    headingElements.forEach((el) => observer.observe(el));

    // NOTE: クリーンアップ
    return () => {
      observer.disconnect();
    };
  }, [headings]);

  return { activeId, handleTocClick };
};
