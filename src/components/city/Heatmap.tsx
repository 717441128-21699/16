import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { District } from '@/data/city';

interface HeatmapProps {
  districts: District[];
  onDistrictClick?: (district: District) => void;
  className?: string;
}

interface SubRegion {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  crimeRate: number;
}

const districtLayouts: Record<District['type'], { x: number; y: number; width: number; height: number; color: string }> = {
  financial: { x: 40, y: 10, width: 55, height: 40, color: '#00d4ff' },
  industrial: { x: 5, y: 50, width: 45, height: 45, color: '#fb923c' },
  residential: { x: 55, y: 55, width: 40, height: 40, color: '#22c55e' },
};

const getColorForCrimeRate = (rate: number, baseColor: string): string => {
  const intensity = Math.min(rate / 100, 1);
  if (intensity < 0.3) return baseColor + '30';
  if (intensity < 0.5) return baseColor + '60';
  if (intensity < 0.7) return '#eab308' + '80';
  return '#ef4444' + Math.floor(80 + intensity * 75).toString(16);
};

function generateSubRegions(district: District): SubRegion[] {
  const layout = districtLayouts[district.type];
  const subCount = 4;
  const regions: SubRegion[] = [];
  const cols = 2;
  const rows = 2;
  const subWidth = layout.width / cols - 2;
  const subHeight = layout.height / rows - 2;

  for (let i = 0; i < subCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const variance = (Math.sin(i * 17 + district.id.length) + 1) / 2;
    const subCrimeRate = Math.max(0, Math.min(100, district.crimeRate + (variance - 0.5) * 30));
    regions.push({
      id: `${district.id}-sub-${i}`,
      name: `${district.name} ${i + 1}号街区`,
      x: layout.x + col * (subWidth + 2) + 1,
      y: layout.y + row * (subHeight + 2) + 1,
      width: subWidth,
      height: subHeight,
      crimeRate: Math.round(subCrimeRate),
    });
  }
  return regions;
}

export function Heatmap({ districts, onDistrictClick, className }: HeatmapProps) {
  const allSubRegions = useMemo(() => {
    return districts.flatMap((d) => generateSubRegions(d));
  }, [districts]);

  return (
    <div className={cn('relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-scifi-border bg-scifi-panel', className)}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="heatmap-grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(0, 212, 255, 0.08)" strokeWidth="0.15" />
          </pattern>
          <radialGradient id="glow-financial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow-industrial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow-residential" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100" height="100" fill="url(#heatmap-grid)" />

        {districts.map((district) => {
          const layout = districtLayouts[district.type];
          const glowId = `glow-${district.type}`;
          return (
            <g key={district.id}>
              <rect
                x={layout.x - 8}
                y={layout.y - 8}
                width={layout.width + 16}
                height={layout.height + 16}
                fill={`url(#${glowId})`}
                opacity="0.6"
              />
              <motion.rect
                x={layout.x}
                y={layout.y}
                width={layout.width}
                height={layout.height}
                fill="rgba(255,255,255,0.03)"
                stroke={layout.color}
                strokeWidth="0.4"
                strokeDasharray="2 1"
                rx="2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="cursor-pointer"
                onClick={() => onDistrictClick?.(district)}
                whileHover={{ fill: 'rgba(255,255,255,0.06)' }}
              />
              <text
                x={layout.x + layout.width / 2}
                y={layout.y + 5}
                textAnchor="middle"
                fill={layout.color}
                fontSize="3"
                fontFamily="Orbitron, sans-serif"
                fontWeight="600"
                className="pointer-events-none select-none"
              >
                {district.name}
              </text>
            </g>
          );
        })}

        {allSubRegions.map((region, idx) => {
          const district = districts.find((d) => region.id.startsWith(d.id));
          const baseColor = district ? districtLayouts[district.type].color : '#00d4ff';
          return (
            <motion.g
              key={region.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.03 }}
            >
              <motion.rect
                x={region.x}
                y={region.y}
                width={region.width}
                height={region.height}
                fill={getColorForCrimeRate(region.crimeRate, baseColor)}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.15"
                rx="1"
                className="cursor-pointer transition-all"
                whileHover={{
                  fill: getColorForCrimeRate(region.crimeRate + 10, baseColor),
                  filter: 'brightness(1.2)',
                }}
                onClick={() => {
                  const d = districts.find((dis) => region.id.startsWith(dis.id));
                  if (d) onDistrictClick?.(d);
                }}
              />
              <title>{`${region.name}: 犯罪率 ${region.crimeRate}%`}</title>
            </motion.g>
          );
        })}
      </svg>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <span className="text-xs text-scifi-muted mr-1">低</span>
          {['#22c55e50', '#eab30860', '#ef444480', '#ef4444cc'].map((color, i) => (
            <div
              key={i}
              className="w-6 h-3 rounded-sm border border-white/10"
              style={{ backgroundColor: color }}
            />
          ))}
          <span className="text-xs text-scifi-muted ml-1">高</span>
        </div>
        <span className="text-xs text-scifi-muted font-mono">实时监控 · 犯罪热力图</span>
      </div>

      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs font-mono text-scifi-text">LIVE</span>
      </div>
    </div>
  );
}

export default Heatmap;
