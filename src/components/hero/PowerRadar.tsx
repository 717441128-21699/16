import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Activity } from 'lucide-react';
import { TechCard } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface HeroStatsData {
  attack: number;
  defense: number;
  speed: number;
  energy: number;
  health: number;
  cooldownReduction: number;
}

interface PowerRadarProps {
  stats: HeroStatsData;
  title?: string;
  className?: string;
  size?: number;
}

const statLabels: Record<keyof HeroStatsData, string> = {
  attack: '攻击',
  defense: '防御',
  speed: '速度',
  energy: '能量',
  health: '生命值',
  cooldownReduction: '冷却缩减',
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { subject: string; value: number } }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass border border-cyan-400/30 rounded-lg px-3 py-2 shadow-glow-cyan">
        <p className="text-xs text-cyan-300 font-semibold">{data.subject}</p>
        <p className="text-sm text-scifi-text font-bold">{data.value}</p>
      </div>
    );
  }
  return null;
};

export function PowerRadar({ stats, title = '战力分析', className, size = 350 }: PowerRadarProps) {
  const [animatedStats, setAnimatedStats] = useState<HeroStatsData>(stats);

  useEffect(() => {
    const duration = 800;
    const startTime = Date.now();
    const startStats = animatedStats;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const newStats: HeroStatsData = {
        attack: Math.round(startStats.attack + (stats.attack - startStats.attack) * easeProgress),
        defense: Math.round(startStats.defense + (stats.defense - startStats.defense) * easeProgress),
        speed: Math.round(startStats.speed + (stats.speed - startStats.speed) * easeProgress),
        energy: Math.round(startStats.energy + (stats.energy - startStats.energy) * easeProgress),
        health: Math.round(startStats.health + (stats.health - startStats.health) * easeProgress),
        cooldownReduction: Math.round(
          startStats.cooldownReduction + (stats.cooldownReduction - startStats.cooldownReduction) * easeProgress,
        ),
      };

      setAnimatedStats(newStats);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  const data = [
    { subject: statLabels.attack, value: animatedStats.attack, fullMark: 200 },
    { subject: statLabels.defense, value: animatedStats.defense, fullMark: 200 },
    { subject: statLabels.speed, value: animatedStats.speed, fullMark: 200 },
    { subject: statLabels.energy, value: animatedStats.energy, fullMark: 200 },
    { subject: statLabels.health, value: animatedStats.health, fullMark: 200 },
    { subject: statLabels.cooldownReduction, value: animatedStats.cooldownReduction, fullMark: 100 },
  ];

  const totalPower = Object.values(stats).reduce((sum, val) => sum + val, 0);

  return (
    <TechCard className={cn('overflow-hidden', className)} borderColor="cyan" glow>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="font-display text-base font-semibold text-scifi-text">{title}</h3>
        </div>
        <motion.div
          key={totalPower}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-3 py-1 rounded-md bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30"
        >
          <span className="text-xs text-scifi-muted mr-1">综合战力</span>
          <span className="font-display text-lg font-bold text-gradient-cyber">{totalPower}</span>
        </motion.div>
      </div>

      <div className="relative" style={{ width: '100%', height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="80%" innerRadius="15%">
            <defs>
              <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.2} />
              </linearGradient>
              <filter id="radarGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <PolarGrid
              stroke="rgba(0, 212, 255, 0.15)"
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="subject"
              tick={{
                fill: '#64748b',
                fontSize: 11,
                fontFamily: 'Rajdhani, sans-serif',
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 200]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="属性值"
              dataKey="value"
              stroke="#00d4ff"
              strokeWidth={2}
              fill="url(#radarFill)"
              fillOpacity={1}
              filter="url(#radarGlow)"
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-glow-cyan animate-pulse-glow" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5">
        {(Object.keys(statLabels) as Array<keyof HeroStatsData>).map((key) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-[11px] text-scifi-muted">{statLabels[key]}</span>
            <motion.span
              key={animatedStats[key]}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold text-cyan-300"
            >
              {animatedStats[key]}
            </motion.span>
          </div>
        ))}
      </div>
    </TechCard>
  );
}

export default PowerRadar;
