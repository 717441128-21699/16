import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Heart, Swords, Award, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechCard, StatCard } from '@/components/ui';
import { RankingRow } from '@/components/ranking/RankingRow';
import { HeroDetailModal } from '@/components/ranking/HeroDetailModal';
import { powerRankings, taskRankings, contributionRankings } from '@/data/rankings';
import { sampleHeroes } from '@/data/heroes';
import type { Hero } from '@/data/heroes';

type TabKey = 'power' | 'tasks' | 'contribution';

const tabs: { key: TabKey; label: string; icon: typeof Trophy; valueLabel: string }[] = [
  { key: 'power', label: '战力榜', icon: Swords, valueLabel: '战力' },
  { key: 'tasks', label: '任务完成率', icon: Target, valueLabel: '完成率' },
  { key: 'contribution', label: '城市贡献度', icon: Heart, valueLabel: '贡献值' },
];

export default function Rankings() {
  const [activeTab, setActiveTab] = useState<TabKey>('power');
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const currentTab = tabs.find((t) => t.key === activeTab)!;

  const getRankingsData = () => {
    if (activeTab === 'power') {
      return powerRankings.map((r) => ({
        rank: r.rank,
        heroId: r.heroId,
        heroName: r.name,
        heroTitle: r.alias,
        avatar: r.avatar,
        value: r.power,
        change: (['up', 'same', 'down', 'up', 'down', 'same', 'up', 'up', 'down', 'same'] as const)[r.rank - 1],
        changeValue: Math.floor(Math.random() * 500),
        guildTag: r.guildTag,
      }));
    }
    if (activeTab === 'tasks') {
      return taskRankings.map((r, idx) => ({
        rank: r.rank,
        heroId: r.heroId,
        heroName: r.name,
        heroTitle: r.alias,
        avatar: r.avatar,
        value: r.completionRate,
        change: (['up', 'down', 'same', 'up', 'up', 'down', 'same', 'up', 'same', 'down'] as const)[idx],
        changeValue: Math.floor(Math.random() * 5),
        guildTag: undefined,
      }));
    }
    return contributionRankings.map((r, idx) => ({
      rank: r.rank,
      heroId: r.heroId,
      heroName: r.name,
      heroTitle: r.alias,
      avatar: r.avatar,
      value: r.contribution,
      change: (['same', 'up', 'up', 'down', 'same', 'up', 'down', 'same', 'up', 'down'] as const)[idx],
      changeValue: Math.floor(Math.random() * 500),
      guildTag: undefined,
    }));
  };

  const rankingsData = getRankingsData();

  const handleRowClick = (heroId: string) => {
    const hero = sampleHeroes.find((h) => h.id === heroId) ?? sampleHeroes[0];
    setSelectedHero(hero);
    setShowDetail(true);
  };

  const totalHeroes = 1024;
  const avgPower = Math.round(powerRankings.reduce((sum, r) => sum + r.power, 0) / powerRankings.length);
  const topContribution = contributionRankings[0]?.contribution ?? 0;

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gradient-cyber tracking-tight">
            全服排行榜
          </h1>
          <p className="text-sm text-scifi-muted mt-1">
            实时追踪全服顶尖英雄的各项数据表现
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-sm text-yellow-300 font-semibold">每周一 00:00 刷新</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Swords className="w-5 h-5" />}
          label="全服英雄总数"
          value={totalHeroes.toLocaleString()}
          change={5}
          color="cyan"
        />
        <StatCard
          icon={<Award className="w-5 h-5" />}
          label="Top10 平均战力"
          value={avgPower.toLocaleString()}
          change={8}
          color="purple"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="最高贡献值"
          value={topContribution.toLocaleString()}
          change={12}
          color="yellow"
        />
      </div>

      <TechCard className="p-4" glow={false} borderColor="cyan">
        <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-medium uppercase tracking-wider transition-all duration-300',
                  activeTab === tab.key
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(0,212,255,0.25)]'
                    : 'text-scifi-muted hover:text-scifi-text hover:bg-white/5',
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </TechCard>

      <TechCard className="overflow-hidden" borderColor={activeTab === 'power' ? 'yellow' : activeTab === 'tasks' ? 'purple' : 'cyan'} glow>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="py-4 px-4 text-center w-20">
                  <span className="text-[10px] font-semibold text-scifi-muted uppercase tracking-widest">排名</span>
                </th>
                <th className="py-4 px-4 text-left">
                  <span className="text-[10px] font-semibold text-scifi-muted uppercase tracking-widest">英雄</span>
                </th>
                <th className="py-4 px-4 text-right w-40">
                  <span className="text-[10px] font-semibold text-scifi-muted uppercase tracking-widest">{currentTab.valueLabel}</span>
                </th>
                <th className="py-4 px-4 text-right w-32">
                  <span className="text-[10px] font-semibold text-scifi-muted uppercase tracking-widest">变化</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rankingsData.map((row, idx) => (
                <RankingRow
                  key={row.heroId}
                  rank={row.rank}
                  heroId={row.heroId}
                  heroName={row.heroName}
                  heroTitle={row.heroTitle}
                  avatar={row.avatar}
                  value={row.value}
                  valueLabel={currentTab.valueLabel}
                  change={row.change}
                  changeValue={row.changeValue}
                  guildTag={row.guildTag}
                  onClick={() => handleRowClick(row.heroId)}
                  index={idx}
                />
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <HeroDetailModal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        hero={selectedHero}
      />
    </div>
  );
}
