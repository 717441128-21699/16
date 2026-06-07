import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type BorderColor = "cyan" | "purple" | "pink" | "green" | "yellow" | "red";

interface TechCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  glow?: boolean;
  borderColor?: BorderColor;
}

const borderColorMap: Record<BorderColor, string> = {
  cyan: "border-cyan-400/40",
  purple: "border-purple-400/40",
  pink: "border-pink-400/40",
  green: "border-green-400/40",
  yellow: "border-yellow-400/40",
  red: "border-red-400/40",
};

const glowColorMap: Record<BorderColor, string> = {
  cyan: "hover:shadow-glow-cyan",
  purple: "hover:shadow-glow-purple",
  pink: "hover:shadow-glow-pink",
  green: "hover:shadow-glow-green",
  yellow: "hover:shadow-glow-yellow",
  red: "hover:shadow-glow-red",
};

export function TechCard({
  title,
  children,
  className,
  glow = true,
  borderColor = "cyan",
}: TechCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative glass rounded-lg border backdrop-blur-xl transition-all duration-500",
        borderColorMap[borderColor],
        glow && glowColorMap[borderColor],
        className,
      )}
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
      }}
    >
      <div
        className="absolute top-0 right-0 w-4 h-4 border-r border-t pointer-events-none"
        style={{
          borderColor: borderColor === "cyan"
            ? "rgba(0, 212, 255, 0.5)"
            : borderColor === "purple"
              ? "rgba(168, 85, 247, 0.5)"
              : borderColor === "pink"
                ? "rgba(236, 72, 153, 0.5)"
                : borderColor === "green"
                  ? "rgba(34, 197, 94, 0.5)"
                  : borderColor === "yellow"
                    ? "rgba(234, 179, 8, 0.5)"
                    : "rgba(239, 68, 68, 0.5)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-4 h-4 border-l border-b pointer-events-none"
        style={{
          borderColor: borderColor === "cyan"
            ? "rgba(0, 212, 255, 0.5)"
            : borderColor === "purple"
              ? "rgba(168, 85, 247, 0.5)"
              : borderColor === "pink"
                ? "rgba(236, 72, 153, 0.5)"
                : borderColor === "green"
                  ? "rgba(34, 197, 94, 0.5)"
                  : borderColor === "yellow"
                    ? "rgba(234, 179, 8, 0.5)"
                    : "rgba(239, 68, 68, 0.5)",
        }}
      />

      {title && (
        <div className="px-6 pt-5 pb-3 border-b border-white/5">
          <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-scifi-text">
            {title}
          </h3>
        </div>
      )}

      <div className={cn("p-6", !title && "pt-6")}>{children}</div>
    </motion.div>
  );
}

export default TechCard;
