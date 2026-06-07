import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface ActivityPoint {
  date: string;
  [key: string]: number | string;
}

interface ActivityChartProps {
  data: ActivityPoint[];
  regions: { key: string; label: string; color: string }[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2.5 rounded-lg border border-white/10 bg-scifi-panel/95 backdrop-blur-sm">
        <p className="text-xs font-medium text-scifi-text mb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: entry.color }}
              />
              <span className="text-[11px] text-scifi-muted">{entry.name}:</span>
              <span className="text-[11px] font-mono font-medium" style={{ color: entry.color }}>
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function ActivityChart({ data, regions }: ActivityChartProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-display text-sm font-semibold text-scifi-text uppercase tracking-wider">
          英雄活跃度趋势
        </h3>
        <p className="text-xs text-scifi-muted mt-0.5">近7天各区域出勤英雄数对比</p>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <defs>
              {regions.map((r) => (
                <linearGradient key={r.key} id={`gradient-${r.key}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={r.color} stopOpacity={0.1} />
                  <stop offset="100%" stopColor={r.color} stopOpacity={0.4} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#64748b", fontSize: 11, fontFamily: "Rajdhani" }}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" }}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span className="text-[11px] text-scifi-muted">{value}</span>
              )}
            />
            {regions.map((region) => (
              <Line
                key={region.key}
                type="monotone"
                dataKey={region.key}
                name={region.label}
                stroke={region.color}
                strokeWidth={2.5}
                dot={{
                  r: 3.5,
                  fill: region.color,
                  stroke: "#0A1628",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 5.5,
                  fill: region.color,
                  stroke: "#0A1628",
                  strokeWidth: 2,
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ActivityChart;
