import { useEffect, useMemo, useRef, useState } from "react";

/**
 * HoverImageCarousel
 * - Cycles through given images while hovering.
 * - Resets to first image on mouse leave.
 * - Includes a simple fade animation (see SCSS below).
 */
export default function HoverImageCarousel({
  images = [],
  alt = "",
  intervalMs = 1200,
  className = "",
}) {
  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [images]
  );

  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!hovering || safeImages.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % safeImages.length);
    }, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [hovering, intervalMs, safeImages.length]);

  const src = safeImages[index] ?? "";
  const hasImages = safeImages.length > 0;

  return (
    <div
      className={`hover-carousel ${className}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false);
        setIndex(0);
      }}
    >
      {hasImages ? (
        <img
          key={index} // forces fade animation per image swap
          src={src}
          alt={alt}
          loading="lazy"
          className="hover-carousel-img"
        />
      ) : (
        <img
          src="https://via.placeholder.com/400x500?text=No+Image"
          alt="No Image"
          loading="lazy"
          className="hover-carousel-img"
        />
      )}
    </div>
  );
}
