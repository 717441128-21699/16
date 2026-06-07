import { useState, useRef } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TechCard } from "@/components/ui/TechCard";
import { StatCard } from "@/components/ui/StatCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { CrimeHeatmap } from "@/components/report/CrimeHeatmap";
import { ActivityChart } from "@/components/report/ActivityChart";
import { SatisfactionTrend } from "@/components/report/SatisfactionTrend";
import { districts, historicalStats } from "@/data/city";
import { exportReportToPdf } from "@/utils/pdf";

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

function generateActivityData() {
  return historicalStats.map((stat, idx) => ({
    date: stat.date,
    financial: 60 + Math.round(Math.random() * 35) + idx * 2,
    industrial: 45 + Math.round(Math.random() * 30) + idx,
    residential: 50 + Math.round(Math.random() * 25) + idx * 1.5,
  }));
}

function generateHeatmapData() {
  return districts.map((d) => ({
    districtId: d.id,
    districtName: d.name,
    icon: d.icon,
    data: historicalStats.map((s) => ({
      day: s.date,
      value: Math.max(10, Math.min(90, d.crimeRate + Math.round((Math.random() - 0.5) * 20))),
    })),
  }));
}

export default function Report() {
  const [selectedWeek, setSelectedWeek] = useState("current");
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const activityData = generateActivityData();
  const heatmapData = generateHeatmapData();
  const satisfactionData = historicalStats.map((s) => ({
    date: s.date,
    satisfaction: s.satisfaction,
  }));

  const totalEvents = 142;
  const totalMissions = 89;
  const totalResources = 28450;

  const districtTableData = districts.map((d) => {
    const heatData = heatmapData.find((h) => h.districtId === d.id);
    const avgCrime =
      heatData && heatData.data.length > 0
        ? Math.round(heatData.data.reduce((sum, v) => sum + v.value, 0) / heatData.data.length)
        : d.crimeRate;
    const satisfactionChange = Math.round((Math.random() - 0.3) * 10);
    return {
      ...d,
      avgCrime,
      satisfactionChange,
      eventsResolved: 30 + Math.round(Math.random() * 40),
      heroesDeployed: 10 + Math.round(Math.random() * 25),
    };
  });

  const handleExport = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      await exportReportToPdf(reportRef.current, "城市安全周报.pdf");
    } catch (err) {
      console.error("PDF导出失败:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const currentWeekLabel = weekOptions.find((w) => w.value === selectedWeek)?.label ?? "";

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
            disabled={isExporting}
          >
            <FileDown className="w-4 h-4" />
            {isExporting ? "导出中..." : "导出PDF"}
          </GlowButton>
        </div>
      </div>

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
                          <p className="text-sm font-medium text-scifi-text">{district.name}</p>
                          <p className="text-[11px] text-scifi-muted">{district.description}</p>
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
                            district.satisfactionChange >= 0 ? "text-green-400" : "text-red-400",
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
    </div>
  );
}
