import { useEffect, useRef } from "react";
import { animate, useMotionValue, useTransform } from "framer-motion";

export function AnimatedNumber({ value, format }: { value: number; format?: (n: number) => string }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => (format ? format(v) : Math.round(v).toLocaleString()));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.8, ease: "easeOut" });
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    return rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = v;
    });
  }, [rounded]);

  return <span ref={ref}>0</span>;
}
