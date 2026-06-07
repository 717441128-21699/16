import { ReactNode } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type StatColor = "cyan" | "purple" | "pink" | "green" | "yellow" | "red";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  change?: number;
  color?: StatColor;
}

const iconBgMap: Record<StatColor, string> = {
  cyan: "from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-400/30",
  purple: "from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-400/30",
  pink: "from-pink-500/20 to-pink-500/5 text-pink-400 border-pink-400/30",
  green: "from-green-500/20 to-green-500/5 text-green-400 border-green-400/30",
  yellow: "from-yellow-500/20 to-yellow-500/5 text-yellow-400 border-yellow-400/30",
  red: "from-red-500/20 to-red-500/5 text-red-400 border-red-400/30",
};

export function StatCard({
  icon,
  label,
  value,
  change,
  color = "cyan",
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative glass rounded-lg border border-scifi-border p-5 overflow-hidden group hover:border-cyan-400/30 transition-all duration-300"
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-scifi-muted uppercase tracking-wider mb-2">
            {label}
          </p>
          <motion.p
            key={String(value)}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-display text-2xl font-bold text-scifi-text tracking-tight"
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </motion.p>

          {change !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 mt-2 text-xs font-medium",
                isPositive ? "text-green-400" : "text-red-400",
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>
                {isPositive ? "+" : ""}
                {change}%
              </span>
            </div>
          )}
        </div>

        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
          className={cn(
            "w-12 h-12 rounded-lg border flex items-center justify-center bg-gradient-to-br",
            iconBgMap[color],
          )}
        >
          {icon}
        </motion.div>
      </div>

      <div
        className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500"
        style={{
          background:
            color === "cyan"
              ? "#00d4ff"
              : color === "purple"
                ? "#a855f7"
                : color === "pink"
                  ? "#ec4899"
                  : color === "green"
                    ? "#22c55e"
                    : color === "yellow"
                      ? "#eab308"
                      : "#ef4444",
        }}
      />
    </motion.div>
  );
}

export default StatCard;
