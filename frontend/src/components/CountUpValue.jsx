import { useEffect, useRef, useState } from "react";

export default function CountUpValue({ value, duration = 900, decimals = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = performance.now();

    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const next = value * eased;
      setDisplayValue(next);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, duration]);

  return Number(displayValue).toFixed(decimals);
}
