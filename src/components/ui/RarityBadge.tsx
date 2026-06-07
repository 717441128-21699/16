import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Rarity = "common" | "rare" | "epic" | "legendary";

interface RarityBadgeProps {
  rarity: Rarity;
  children: ReactNode;
}

const rarityConfig: Record<
  Rarity,
  { bg: string; border: string; text: string; glow: string; label: string }
> = {
  common: {
    bg: "from-gray-500/20 to-gray-500/5",
    border: "border-gray-400/50",
    text: "text-gray-300",
    glow: "",
    label: "普通",
  },
  rare: {
    bg: "from-blue-500/30 to-blue-500/10",
    border: "border-blue-400/60",
    text: "text-blue-300",
    glow: "shadow-[0_0_12px_rgba(59,130,246,0.4)]",
    label: "稀有",
  },
  epic: {
    bg: "from-purple-500/30 to-purple-500/10",
    border: "border-purple-400/60",
    text: "text-purple-300",
    glow: "shadow-[0_0_15px_rgba(168,85,247,0.5)]",
    label: "史诗",
  },
  legendary: {
    bg: "from-yellow-500/30 to-orange-500/10",
    border: "border-yellow-400/70",
    text: "text-yellow-300",
    glow: "shadow-[0_0_18px_rgba(234,179,8,0.6)]",
    label: "传说",
  },
};

export function RarityBadge({ rarity, children }: RarityBadgeProps) {
  const config = rarityConfig[rarity];

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-display font-semibold uppercase tracking-wider border bg-gradient-to-r",
        config.bg,
        config.border,
        config.text,
        config.glow,
        rarity === "legendary" && "animate-pulse-glow",
      )}
    >
      {children || config.label}
    </motion.span>
  );
}

export default RarityBadge;
