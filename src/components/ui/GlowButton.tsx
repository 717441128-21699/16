import { ComponentPropsWithoutRef, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type GlowButtonVariant = "primary" | "danger" | "success" | "ghost";
type GlowButtonSize = "sm" | "md" | "lg";

type MotionButtonProps = ComponentPropsWithoutRef<typeof motion.button>;

interface GlowButtonProps extends MotionButtonProps {
  variant?: GlowButtonVariant;
  size?: GlowButtonSize;
}

const variantStyles: Record<GlowButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400/60 text-cyan-300 hover:from-cyan-500/30 hover:to-purple-500/30 hover:text-cyan-200 hover:shadow-glow-cyan",
  danger:
    "bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/60 text-red-300 hover:from-red-500/30 hover:to-pink-500/30 hover:text-red-200 hover:shadow-glow-red",
  success:
    "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/60 text-green-300 hover:from-green-500/30 hover:to-emerald-500/30 hover:text-green-200 hover:shadow-glow-green",
  ghost:
    "bg-transparent border-transparent text-scifi-muted hover:bg-white/5 hover:text-scifi-text",
};

const sizeStyles: Record<GlowButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-7 py-3.5 text-base gap-2.5",
};

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      className,
      disabled,
      onClick,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref as never}
        onClick={onClick}
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.02 } : undefined}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.15 }}
        className={cn(
          "relative inline-flex items-center justify-center font-display font-semibold uppercase tracking-wider border rounded-md transition-all duration-300 cursor-pointer select-none",
          "clip-path-polygon-[10px_0,100%_0,100%_calc(100%_-10px),calc(100%_-10px)_100%,0_100%,0_10px]",
          "before:absolute before:inset-0 before:rounded-md before:pointer-events-none",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        style={{
          clipPath:
            "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
        }}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

GlowButton.displayName = "GlowButton";

export default GlowButton;
