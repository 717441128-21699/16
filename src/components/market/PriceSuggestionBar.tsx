import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceSuggestionBarProps {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  currentPrice: number;
  showWarning?: boolean;
}

export function PriceSuggestionBar({
  minPrice,
  maxPrice,
  avgPrice,
  currentPrice,
  showWarning = true,
}: PriceSuggestionBarProps) {
  const range = maxPrice - minPrice || 1;
  const position = Math.max(0, Math.min(100, ((currentPrice - minPrice) / range) * 100));
  const avgPosition = Math.max(0, Math.min(100, ((avgPrice - minPrice) / range) * 100));

  const isBelowMin = currentPrice < minPrice;
  const isAboveMax = currentPrice > maxPrice;
  const isWarning = isBelowMin || isAboveMax;

  return (
    <div className="space-y-2">
      <div className="relative h-8">
        <div className="absolute inset-y-0 left-0 right-0 rounded-md overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(34,197,94,0.15) 0%, rgba(0,212,255,0.25) 50%, rgba(239,68,68,0.15) 100%)",
            }}
          />
          <div
            className="absolute inset-y-0 left-0"
            style={{
              width: `${avgPosition}%`,
              background:
                "linear-gradient(90deg, rgba(34,197,94,0.3) 0%, rgba(0,212,255,0.4) 100%)",
            }}
          />
        </div>

        <div
          className="absolute top-0 bottom-0 w-px bg-cyan-400/60 z-10"
          style={{ left: `${avgPosition}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
        </div>

        <motion.div
          className="absolute top-1/2 -translate-y-1/2 z-20"
          style={{ left: `${position}%` }}
          animate={{ left: `${position}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div
            className={cn(
              "w-4 h-6 -translate-x-1/2 rounded-sm border flex items-center justify-center",
              isWarning
                ? "bg-red-500/40 border-red-400/80 shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                : "bg-white/30 border-white/60 shadow-[0_0_10px_rgba(255,255,255,0.4)]",
            )}
          >
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                isWarning ? "bg-red-300" : "bg-white",
              )}
            />
          </div>
        </motion.div>

        <div className="absolute inset-y-0 left-0 w-0.5 bg-green-400/40" />
        <div className="absolute inset-y-0 right-0 w-0.5 bg-red-400/40" />
      </div>

      {showWarning && isWarning && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-medium border",
            isAboveMax
              ? "bg-red-500/10 border-red-400/30 text-red-300"
              : "bg-yellow-500/10 border-yellow-400/30 text-yellow-300",
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>
            {isAboveMax
              ? "定价过高，可能难以售出，建议参考均价"
              : "定价过低，建议检查是否输入错误"}
          </span>
        </motion.div>
      )}
    </div>
  );
}

export default PriceSuggestionBar;
