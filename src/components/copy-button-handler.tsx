"use client";

import { useEffect } from "react";

const CopyButtonHandler = () => {
  useEffect(() => {
    document.querySelectorAll<HTMLButtonElement>(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const code = decodeURIComponent(btn.dataset.code || "");
        try {
          await navigator.clipboard.writeText(code);
          btn.innerText = "Copied!";
          setTimeout(() => (btn.innerText = "Copy"), 1500);
        } catch (err) {
          console.error(err);
        }
      });
    });
  }, []);

  return null; // UI はなし
};

export default CopyButtonHandler;
