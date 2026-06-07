import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ProgressColor =
  | "cyan"
  | "purple"
  | "pink"
  | "green"
  | "yellow"
  | "red"
  | "cyan-purple"
  | "green-yellow";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: ProgressColor;
  showLabel?: boolean;
  label?: string;
  height?: number;
}

const gradientMap: Record<ProgressColor, string> = {
  cyan: "linear-gradient(90deg, #00d4ff, #06b6d4)",
  purple: "linear-gradient(90deg, #a855f7, #7c3aed)",
  pink: "linear-gradient(90deg, #ec4899, #db2777)",
  green: "linear-gradient(90deg, #22c55e, #16a34a)",
  yellow: "linear-gradient(90deg, #eab308, #ca8a04)",
  red: "linear-gradient(90deg, #ef4444, #dc2626)",
  "cyan-purple": "linear-gradient(90deg, #00d4ff, #a855f7)",
  "green-yellow": "linear-gradient(90deg, #22c55e, #eab308)",
};

const glowMap: Record<ProgressColor, string> = {
  cyan: "0 0 10px rgba(0, 212, 255, 0.6)",
  purple: "0 0 10px rgba(168, 85, 247, 0.6)",
  pink: "0 0 10px rgba(236, 72, 153, 0.6)",
  green: "0 0 10px rgba(34, 197, 94, 0.6)",
  yellow: "0 0 10px rgba(234, 179, 8, 0.6)",
  red: "0 0 10px rgba(239, 68, 68, 0.6)",
  "cyan-purple": "0 0 10px rgba(0, 212, 255, 0.6)",
  "green-yellow": "0 0 10px rgba(34, 197, 94, 0.6)",
};

export function ProgressBar({
  value,
  max,
  color = "cyan-purple",
  showLabel = true,
  label,
  height = 8,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayLabel = label ?? `${Math.round(percentage)}%`;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-scifi-muted font-medium">
            {displayLabel}
          </span>
          <span className="text-xs text-scifi-muted">
            {value.toLocaleString()} / {max.toLocaleString()}
          </span>
        </div>
      )}
      <div
        className="relative w-full rounded-full overflow-hidden bg-white/5 border border-white/10"
        style={{ height: `${height}px` }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full relative"
          style={{
            background: gradientMap[color],
            boxShadow: glowMap[color],
          }}
        >
          <div
            className="absolute inset-0 rounded-full opacity-50"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default ProgressBar;
