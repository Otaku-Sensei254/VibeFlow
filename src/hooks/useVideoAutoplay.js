import { useEffect, useRef, useState } from "react";

export default function useVideoAutoplay(videoEl, { threshold = 0.6 } = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    const el = typeof videoEl === "function" ? null : videoEl?.current || videoEl;
    if (!el) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          el.play().catch((err) => {
            if (err.name !== "AbortError") throw err;
          });
        } else {
          el.pause();
        }
      },
      { threshold }
    );

    observerRef.current.observe(el);
    return () => observerRef.current?.disconnect();
  }, [videoEl, threshold]);

  return isVisible;
}