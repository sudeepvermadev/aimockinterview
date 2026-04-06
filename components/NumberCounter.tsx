"use client";

import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";

interface NumberCounterProps {
  value: number;
  className?: string;
  delay?: number;
}

const NumberCounter = ({ value, className, delay = 0 }: NumberCounterProps) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    // Ensuring it always shows at least a number and doesn't flicker
    return Math.floor(latest).toLocaleString();
  });
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (isInView && value > 0) {
      const controls = animate(count, value, {
        duration: 2.5,
        delay: delay,
        ease: [0.16, 1, 0.3, 1], // Premium easing
      });
      return controls.stop;
    }
  }, [isInView, value, count, delay]);

  return (
    <motion.span 
      ref={ref} 
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, delay: delay }}
    >
      <motion.span
        animate={isInView ? { scale: [1, 1.1, 1] } : {}}
        transition={{ delay: delay + 2.5, duration: 0.4 }}
        style={{ display: "inline-block" }}
      >
        {rounded}
      </motion.span>
    </motion.span>
  );
};

export default NumberCounter;
