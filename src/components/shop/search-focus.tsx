"use client";

import { useEffect } from "react";

export function SearchFocus() {
  useEffect(() => {
    const focusSearchInput = () => {
      if (window.location.hash === "#search") {
        const input = document.getElementById("search");
        if (input) {
          input.focus();
        }
      }
    };

    focusSearchInput();
    window.addEventListener("hashchange", focusSearchInput);
    return () => {
      window.removeEventListener("hashchange", focusSearchInput);
    };
  }, []);

  return null;
}
