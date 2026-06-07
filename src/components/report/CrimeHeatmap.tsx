import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeatmapCell {
  day: string;
  value: number;
}

interface DistrictHeatmap {
  districtId: string;
  districtName: string;
  icon: string;
  data: HeatmapCell[];
}

interface CrimeHeatmapProps {
  data: DistrictHeatmap[];
}

const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

function getHeatColor(value: number): string {
  if (value < 25) return "rgba(34, 197, 94, 0.15)";
  if (value < 40) return "rgba(234, 179, 8, 0.2)";
  if (value < 55) return "rgba(249, 115, 22, 0.25)";
  if (value < 70) return "rgba(239, 68, 68, 0.3)";
  return "rgba(220, 38, 38, 0.45)";
}

function getHeatBorder(value: number): string {
  if (value < 25) return "rgba(34, 197, 94, 0.3)";
  if (value < 40) return "rgba(234, 179, 8, 0.35)";
  if (value < 55) return "rgba(249, 115, 22, 0.4)";
  if (value < 70) return "rgba(239, 68, 68, 0.45)";
  return "rgba(220, 38, 38, 0.6)";
}

function getHeatText(value: number): string {
  if (value < 25) return "text-green-400";
  if (value < 40) return "text-yellow-400";
  if (value < 55) return "text-orange-400";
  if (value < 70) return "text-red-400";
  return "text-red-300";
}

export function CrimeHeatmap({ data }: CrimeHeatmapProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold text-scifi-text uppercase tracking-wider">
            犯罪率热力分布
          </h3>
          <p className="text-xs text-scifi-muted mt-0.5">各区域近7天犯罪指数波动</p>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-scifi-muted">低</span>
          <div className="flex gap-0.5">
            {[
              { bg: "rgba(34, 197, 94, 0.2)", border: "rgba(34, 197, 94, 0.4)" },
              { bg: "rgba(234, 179, 8, 0.25)", border: "rgba(234, 179, 8, 0.4)" },
              { bg: "rgba(249, 115, 22, 0.3)", border: "rgba(249, 115, 22, 0.45)" },
              { bg: "rgba(239, 68, 68, 0.35)", border: "rgba(239, 68, 68, 0.5)" },
              { bg: "rgba(220, 38, 38, 0.5)", border: "rgba(220, 38, 38, 0.65)" },
            ].map((c, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-sm border"
                style={{ background: c.bg, borderColor: c.border }}
              />
            ))}
          </div>
          <span className="text-scifi-muted">高</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-[140px_repeat(7,1fr)] gap-1.5">
          <div />
          {days.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-medium text-scifi-muted uppercase tracking-wider py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {data.map((district, idx) => (
          <motion.div
            key={district.districtId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="grid grid-cols-[140px_repeat(7,1fr)] gap-1.5 items-center"
          >
            <div className="flex items-center gap-2 pr-2">
              <span className="text-lg">{district.icon}</span>
              <span className="text-xs font-medium text-scifi-text truncate">
                {district.districtName}
              </span>
            </div>
            {district.data.map((cell, cellIdx) => (
              <motion.div
                key={`${district.districtId}-${cell.day}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: idx * 0.1 + cellIdx * 0.03 }}
                whileHover={{ scale: 1.1, zIndex: 10 }}
                className={cn(
                  "relative aspect-square rounded-md border flex items-center justify-center cursor-pointer transition-all duration-200 group",
                )}
                style={{
                  background: getHeatColor(cell.value),
                  borderColor: getHeatBorder(cell.value),
                }}
              >
                <span className={cn("text-[10px] font-mono font-semibold", getHeatText(cell.value))}>
                  {cell.value}
                </span>
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-scifi-panel border border-white/10 text-[10px] font-mono text-scifi-text whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                  犯罪率: {cell.value}%
                </div>
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default CrimeHeatmap;
