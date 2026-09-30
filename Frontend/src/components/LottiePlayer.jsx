import React, { useEffect, useRef, useState } from "react";
import lottie from "lottie-web";

export default function LottiePlayer({
  src,
  className = "",
  style = {},
  loop = true,
  autoplay = true,
  lightGridStrokes = false,
}) {
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadLottie() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`Failed to load animation (${response.status})`);
        }
        let animData = await response.json();

        // If lightGridStrokes is true (e.g. for dark backgrounds where black strokes are invisible),
        // adjust dark strokes in the animation data to bright neon / white-violet strokes
        if (lightGridStrokes && animData?.layers) {
          animData = JSON.parse(JSON.stringify(animData));
          animData.layers.forEach((layer) => {
            if (layer.shapes) {
              const fixStrokes = (items) => {
                items.forEach((item) => {
                  if (item.ty === "st" && item.c && Array.isArray(item.c.k)) {
                    // Check if stroke color is pure black or very dark
                    const [r, g, b] = item.c.k;
                    if (r === 0 && g === 0 && b === 0) {
                      // Change to light violet-white: rgba(220, 225, 255, 0.9)
                      item.c.k = [0.85, 0.88, 1, 1];
                    }
                  }
                  if (item.it) {
                    fixStrokes(item.it);
                  }
                });
              };
              fixStrokes(layer.shapes);
            }
          });
        }

        if (isCancelled || !containerRef.current) return;

        // Clean up previous instance if any
        if (animRef.current) {
          animRef.current.destroy();
        }

        animRef.current = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop,
          autoplay,
          animationData: animData,
        });

        setLoading(false);
      } catch (err) {
        if (!isCancelled) {
          console.error("Lottie load error:", err);
          setError(err.message);
          setLoading(false);
        }
      }
    }

    loadLottie();

    return () => {
      isCancelled = true;
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, [src, loop, autoplay, lightGridStrokes]);

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={style}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" />
        </div>
      )}
      {error ? (
        <div className="text-xs text-rose-400 p-2 text-center">
          Failed to load animation
        </div>
      ) : (
        <div ref={containerRef} className="w-full h-full" />
      )}
    </div>
  );
}
