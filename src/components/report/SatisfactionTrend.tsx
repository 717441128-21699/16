import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Smile, Meh, Frown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SatisfactionPoint {
  date: string;
  satisfaction: number;
}

interface SatisfactionTrendProps {
  data: SatisfactionPoint[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const Icon = value >= 75 ? Smile : value >= 55 ? Meh : Frown;
    const color = value >= 75 ? "#22c55e" : value >= 55 ? "#eab308" : "#ef4444";

    return (
      <div className="px-3 py-2.5 rounded-lg border border-white/10 bg-scifi-panel/95 backdrop-blur-sm">
        <p className="text-xs font-medium text-scifi-text mb-1.5">{label}</p>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="text-[11px] text-scifi-muted">满意度:</span>
          <span className="text-[11px] font-mono font-semibold" style={{ color }}>
            {value}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

function getStatusLabel(value: number) {
  if (value >= 75) return { label: "非常满意", color: "text-green-400", Icon: Smile };
  if (value >= 55) return { label: "基本满意", color: "text-yellow-400", Icon: Meh };
  return { label: "需要改善", color: "text-red-400", Icon: Frown };
}

export function SatisfactionTrend({ data }: SatisfactionTrendProps) {
  const latestValue = data[data.length - 1]?.satisfaction ?? 0;
  const avgValue =
    data.length > 0
      ? Math.round(data.reduce((sum, d) => sum + d.satisfaction, 0) / data.length)
      : 0;
  const status = getStatusLabel(latestValue);
  const StatusIcon = status.Icon;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-sm font-semibold text-scifi-text uppercase tracking-wider">
            市民满意度趋势
          </h3>
          <p className="text-xs text-scifi-muted mt-0.5">近7天市民对城市安全的评价</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5">
          <StatusIcon className={cn("w-4 h-4", status.color)} />
          <div className="text-right">
            <p className={cn("text-sm font-mono font-bold leading-none", status.color)}>
              {latestValue}%
            </p>
            <p className="text-[9px] text-scifi-muted uppercase tracking-wider mt-0.5">
              {status.label}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-scifi-muted uppercase tracking-wider">周均:</span>
          <span className="text-xs font-mono font-semibold text-scifi-text">{avgValue}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-scifi-muted uppercase tracking-wider">最高:</span>
          <span className="text-xs font-mono font-semibold text-green-400">
            {Math.max(...data.map((d) => d.satisfaction))}%
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-scifi-muted uppercase tracking-wider">最低:</span>
          <span className="text-xs font-mono font-semibold text-red-400">
            {Math.min(...data.map((d) => d.satisfaction))}%
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="satisfactionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
                <stop offset="50%" stopColor="#00d4ff" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="satisfactionLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#00d4ff" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
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
              domain={[0, 100]}
              tick={{ fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" }}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="satisfaction"
              stroke="url(#satisfactionLine)"
              strokeWidth={2.5}
              fill="url(#satisfactionGradient)"
              dot={{
                r: 3.5,
                fill: "#0A1628",
                stroke: "#00d4ff",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: "#22c55e",
                stroke: "#0A1628",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SatisfactionTrend;
