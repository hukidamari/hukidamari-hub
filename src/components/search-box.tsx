"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import styles from "./search-box.module.css";

const SearchBox = () => {
  const [q, setQ] = useState("");
  const router = useRouter();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/posts/search?query=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={onSubmit} className={styles.searchContainer}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="検索"
        className={styles.queryInput}
      />
      <input type="submit" value="検索" className={styles.submitInput} />
    </form>
  );
};

export default SearchBox;
