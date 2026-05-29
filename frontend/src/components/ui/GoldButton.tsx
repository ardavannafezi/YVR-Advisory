"use client";

import { motion } from "framer-motion";
import { useMagneticHover } from "@/hooks/useMagneticHover";
import clsx from "clsx";

interface GoldButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

export function GoldButton({
  children,
  onClick,
  type = "button",
  variant = "solid",
  size = "md",
  disabled,
  className,
}: GoldButtonProps) {
  const { ref, springX, springY, onMouseMove, onMouseLeave } = useMagneticHover(0.35);

  const sizes = {
    sm: "px-5 py-2 text-sm",
    md: "px-8 py-3 text-sm tracking-widest",
    lg: "px-10 py-4 text-base tracking-widest",
  };

  const variants = {
    solid: "bg-gold text-background font-semibold hover:bg-gold-light",
    outline: "border border-gold text-gold hover:bg-gold/10",
    ghost: "text-gold hover:text-gold-light underline-offset-4 hover:underline",
  };

  return (
    <motion.button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ x: springX, y: springY }}
      onMouseMove={onMouseMove as any}
      onMouseLeave={onMouseLeave}
      className={clsx(
        "relative inline-flex items-center justify-center uppercase transition-colors duration-200 rounded-none cursor-pointer",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
        sizes[size],
        variants[variant],
        className
      )}
    >
      {children}
    </motion.button>
  );
}
