import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileDown,
  Calendar,
  Shield,
  Target,
  Package,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TechCard } from "@/components/ui/TechCard";
import { StatCard } from "@/components/ui/StatCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { CrimeHeatmap } from "@/components/report/CrimeHeatmap";
import { ActivityChart } from "@/components/report/ActivityChart";
import { SatisfactionTrend } from "@/components/report/SatisfactionTrend";
import { api } from "@/lib/api";
import type { WeeklyReport } from "@/types";
import { districts } from "@/data/city";

const weekOptions = [
  { value: "current", label: "本周 (06-01 ~ 06-07)" },
  { value: "last", label: "上周 (05-25 ~ 05-31)" },
  { value: "last2", label: "两周前 (05-18 ~ 05-24)" },
];

const activityRegions = [
  { key: "financial", label: "金融区", color: "#00d4ff" },
  { key: "industrial", label: "工业区", color: "#f97316" },
  { key: "residential", label: "住宅区", color: "#22c55e" },
];

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export default function Report() {
  const [selectedWeek, setSelectedWeek] = useState("current");
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await api.getWeeklyReport();
      setReport(data);
      showToast("周报数据加载成功", "success");
    } catch (error) {
      showToast(`加载周报失败: ${error instanceof Error ? error.message : "未知错误"}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [selectedWeek]);

  const activityData = report
    ? report.heroActivity.map((stat) => ({
        date: stat.date,
        financial: Math.round(stat.activeHeroes * (0.4 + Math.random() * 0.2)),
        industrial: Math.round(stat.activeHeroes * (0.3 + Math.random() * 0.15)),
        residential: Math.round(stat.activeHeroes * (0.3 + Math.random() * 0.15)),
      }))
    : [];

  const heatmapData = report
    ? report.districtStats.map((ds) => {
        const district = districts.find((d) => d.id === ds.districtId);
        return {
          districtId: ds.districtId,
          districtName: district?.name ?? ds.districtId,
          icon: district?.icon ?? "📍",
          data: ds.crimeRateData.map((val, idx) => ({
            day: report?.heroActivity[idx]?.date ?? `Day-${idx + 1}`,
            value: val,
          })),
        };
      })
    : [];

  const satisfactionData = report
    ? (() => {
        const mergedData: { date: string; satisfaction: number }[] = [];
        report.districtStats.forEach((ds) => {
          ds.satisfactionData.forEach((val, idx) => {
            if (!mergedData[idx]) {
              mergedData[idx] = {
                date: report.heroActivity[idx]?.date ?? `Day-${idx + 1}`,
                satisfaction: 0,
              };
            }
            mergedData[idx].satisfaction += val;
          });
        });
        return mergedData.map((d) => ({
          date: d.date,
          satisfaction: Math.round(d.satisfaction / report.districtStats.length),
        }));
      })()
    : [];

  const totalEvents = report?.totalEvents ?? 0;
  const totalMissions = report?.totalMissions ?? 0;
  const totalResources = report?.totalResources ?? 0;

  const districtTableData = report
    ? districts.map((d) => {
        const stat = report.districtStats.find((s) => s.districtId === d.id);
        const avgCrime =
          stat && stat.crimeRateData.length > 0
            ? Math.round(
                stat.crimeRateData.reduce((sum, v) => sum + v, 0) / stat.crimeRateData.length,
              )
            : d.crimeRate;
        const avgSatisfaction =
          stat && stat.satisfactionData.length > 0
            ? Math.round(
                stat.satisfactionData.reduce((sum, v) => sum + v, 0) /
                  stat.satisfactionData.length,
              )
            : d.satisfaction;
        const satisfactionChange = Math.round((Math.random() - 0.3) * 10);
        return {
          ...d,
          avgCrime,
          satisfaction: avgSatisfaction,
          satisfactionChange,
          eventsResolved: 30 + Math.round(Math.random() * 40),
          heroesDeployed: 10 + Math.round(Math.random() * 25),
        };
      })
    : [];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await api.getWeeklyReportPdf();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `城市安全周报_${report?.weekStart ?? new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast("PDF导出成功", "success");
    } catch (err) {
      showToast(`PDF导出失败: ${err instanceof Error ? err.message : "未知错误"}`, "error");
    } finally {
      setIsExporting(false);
    }
  };

  const currentWeekLabel =
    (report ? `${report.weekStart} ~ ${report.weekEnd}` : "") ||
    weekOptions.find((w) => w.value === selectedWeek)?.label ||
    "";

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gradient-cyber tracking-tight">
            城市安全周报
          </h1>
          <p className="text-sm text-scifi-muted mt-1">
            综合分析城市各区域治安状况与英雄出勤数据
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowWeekDropdown(!showWeekDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm text-scifi-text hover:border-cyan-400/30 transition-colors"
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              {currentWeekLabel}
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-scifi-muted transition-transform",
                  showWeekDropdown && "rotate-180",
                )}
              />
            </button>
            {showWeekDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full right-0 mt-1.5 w-60 rounded-lg border border-white/10 bg-scifi-panel/95 backdrop-blur-xl overflow-hidden z-20"
              >
                {weekOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSelectedWeek(opt.value);
                      setShowWeekDropdown(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm transition-colors",
                      selectedWeek === opt.value
                        ? "bg-cyan-500/10 text-cyan-300"
                        : "text-scifi-text hover:bg-white/5",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          <GlowButton
            variant="primary"
            size="md"
            onClick={handleExport}
            disabled={isExporting || loading}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            {isExporting ? "导出中..." : "导出PDF"}
          </GlowButton>
        </div>
      </div>

      {loading ? (
        <TechCard className="p-16" glow={false}>
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mb-4" />
            <p className="text-sm font-medium text-scifi-text">加载周报数据中...</p>
          </div>
        </TechCard>
      ) : (
        <div ref={reportRef} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={<Shield className="w-5 h-5" />}
              label="本周事件数"
              value={totalEvents}
              change={-8}
              color="cyan"
            />
            <StatCard
              icon={<Target className="w-5 h-5" />}
              label="任务完成数"
              value={totalMissions}
              change={15}
              color="green"
            />
            <StatCard
              icon={<Package className="w-5 h-5" />}
              label="资源总量"
              value={totalResources.toLocaleString()}
              change={12}
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TechCard title="犯罪率热力分布" className="lg:col-span-2 p-6" borderColor="red">
              <CrimeHeatmap data={heatmapData} />
            </TechCard>

            <TechCard className="p-6 h-[380px]" borderColor="cyan">
              <ActivityChart data={activityData} regions={activityRegions} />
            </TechCard>

            <TechCard className="p-6 h-[380px]" borderColor="green">
              <SatisfactionTrend data={satisfactionData} />
            </TechCard>
          </div>

          <TechCard title="各区域详细数据" className="p-6" borderColor="purple">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-[10px] font-semibold text-scifi-muted uppercase tracking-wider">
                      区域
                    </th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold text-scifi-muted uppercase tracking-wider">
                      平均犯罪率
                    </th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold text-scifi-muted uppercase tracking-wider">
                      市民满意度
                    </th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold text-scifi-muted uppercase tracking-wider">
                      事件处理
                    </th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold text-scifi-muted uppercase tracking-wider">
                      出勤英雄
                    </th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold text-scifi-muted uppercase tracking-wider">
                      人口
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {districtTableData.map((district, idx) => (
                    <motion.tr
                      key={district.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.08 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{district.icon}</span>
                          <div>
                            <p className="text-sm font-medium text-scifi-text">
                              {district.name}
                            </p>
                            <p className="text-[11px] text-scifi-muted">
                              {district.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={cn(
                            "font-mono text-sm font-semibold",
                            district.avgCrime >= 55
                              ? "text-red-400"
                              : district.avgCrime >= 35
                                ? "text-yellow-400"
                                : "text-green-400",
                          )}
                        >
                          {district.avgCrime}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <span className="font-mono text-sm font-semibold text-scifi-text">
                            {district.satisfaction}%
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center text-[10px] font-medium",
                              district.satisfactionChange >= 0
                                ? "text-green-400"
                                : "text-red-400",
                            )}
                          >
                            {district.satisfactionChange >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {district.satisfactionChange >= 0 ? "+" : ""}
                            {district.satisfactionChange}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono text-sm text-cyan-400">
                          {district.eventsResolved}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono text-sm text-purple-400">
                          {district.heroesDeployed}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono text-sm text-scifi-text">
                          {district.population.toLocaleString()}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>
        </div>
      )}

      <div className="fixed top-6 right-6 z-[100] space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "pointer-events-auto relative px-4 py-3 rounded-lg border backdrop-blur-xl max-w-sm",
              toast.type === "success"
                ? "bg-gradient-to-r from-green-500/15 to-emerald-500/10 border-green-400/40 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
                : toast.type === "error"
                  ? "bg-gradient-to-r from-red-500/15 to-rose-500/10 border-red-400/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                  : "bg-scifi-panel/95 border-cyan-400/30",
            )}
          >
            <div className="flex items-start gap-3">
              {toast.type === "success" && (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              )}
              {toast.type === "error" && (
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-xs text-scifi-text leading-relaxed">{toast.message}</p>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-scifi-muted hover:text-scifi-text transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
