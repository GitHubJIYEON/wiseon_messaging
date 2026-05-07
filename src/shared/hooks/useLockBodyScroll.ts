import { useEffect } from "react";

export function useLockBodyScroll() {
  useEffect(() => {
    const { documentElement, body } = document;

    documentElement.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      documentElement.style.overflow = "";
      body.style.overflow = "";
    };
  }, []);
}
