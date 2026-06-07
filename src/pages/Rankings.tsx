import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Target,
  Heart,
  Swords,
  Award,
  TrendingUp,
  Loader2,
  CheckCircle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechCard, StatCard } from '@/components/ui';
import { RankingRow } from '@/components/ranking/RankingRow';
import { HeroDetailModal } from '@/components/ranking/HeroDetailModal';
import { api } from '@/lib/api';
import type { RankingEntry, Hero as ApiHero } from '@/types';
import type { Hero as DataHero } from '@/data/heroes';
import { sampleHeroes, superPowers, suits, weapons } from '@/data/heroes';

type TabKey = 'power' | 'mission' | 'contribution';

const tabs: { key: TabKey; label: string; icon: typeof Trophy; valueLabel: string }[] = [
  { key: 'power', label: '战力榜', icon: Swords, valueLabel: '战力' },
  { key: 'mission', label: '任务完成率', icon: Target, valueLabel: '完成率' },
  { key: 'contribution', label: '城市贡献度', icon: Heart, valueLabel: '贡献值' },
];

interface RankingDisplayItem {
  rank: number;
  heroId: string;
  heroName: string;
  heroTitle: string;
  avatar: string;
  value: number;
  change: 'up' | 'down' | 'same';
  changeValue: number;
  guildTag?: string;
}

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function adaptHero(api: ApiHero): DataHero {
  return {
    id: api.id,
    name: api.name,
    alias: api.title,
    level: api.level,
    exp: api.exp,
    maxExp: 1000 + api.level * 500,
    hp: api.health,
    maxHp: api.maxHealth,
    energy: api.energy,
    maxEnergy: api.maxEnergy,
    attack: Math.round(api.combatPower * 0.3),
    defense: Math.round(api.combatPower * 0.25),
    speed: Math.round(api.combatPower * 0.2),
    powers: api.powers.map((p) => p.id),
    suitId: api.suit.id,
    weaponId: api.weapon.id,
    avatar: '🦸',
    gold: api.gold ?? 0,
    reputation: api.reputation ?? 0,
  };
}

export default function Rankings() {
  const [activeTab, setActiveTab] = useState<TabKey>('power');
  const [selectedHero, setSelectedHero] = useState<DataHero | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [heroLoading, setHeroLoading] = useState(false);
  const [rankings, setRankings] = useState<RankingDisplayItem[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const currentTab = tabs.find((t) => t.key === activeTab)!;

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const loadRankings = async () => {
    setLoading(true);
    try {
      const data: RankingEntry[] = await api.getRankings(activeTab);
      const displayData: RankingDisplayItem[] = data.map((r) => ({
        rank: r.rank,
        heroId: r.heroId,
        heroName: r.heroName,
        heroTitle: r.heroTitle,
        avatar: '🦸',
        value: r.value,
        change: r.change,
        changeValue: Math.floor(Math.random() * 500),
        guildTag: undefined,
      }));
      setRankings(displayData);
    } catch (error) {
      showToast(`加载排行榜失败: ${error instanceof Error ? error.message : '未知错误'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRankings();
  }, [activeTab]);

  const handleRowClick = async (heroId: string) => {
    setHeroLoading(true);
    try {
      const hero = await api.getHero(heroId);
      const adaptedHero = adaptHero(hero as ApiHero);
      setSelectedHero(adaptedHero);
      setShowDetail(true);
      showToast('英雄详情加载成功', 'success');
    } catch (error) {
      const fallback = sampleHeroes.find((h) => h.id === heroId) ?? sampleHeroes[0];
      setSelectedHero(fallback);
      setShowDetail(true);
      showToast(
        `加载英雄详情失败，使用缓存数据: ${error instanceof Error ? error.message : ''}`,
        'error',
      );
    } finally {
      setHeroLoading(false);
    }
  };

  const totalHeroes = 1024;
  const avgPower =
    rankings.length > 0
      ? Math.round(rankings.reduce((sum, r) => sum + r.value, 0) / rankings.length)
      : 0;
  const topContribution = rankings.length > 0 ? rankings[0].value : 0;

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

      <TechCard
        className="overflow-hidden"
        borderColor={
          activeTab === 'power' ? 'yellow' : activeTab === 'mission' ? 'purple' : 'cyan'
        }
        glow
      >
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-3" />
              <p className="text-sm font-medium text-scifi-text">加载排行榜中...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="py-4 px-4 text-center w-20">
                    <span className="text-[10px] font-semibold text-scifi-muted uppercase tracking-widest">
                      排名
                    </span>
                  </th>
                  <th className="py-4 px-4 text-left">
                    <span className="text-[10px] font-semibold text-scifi-muted uppercase tracking-widest">
                      英雄
                    </span>
                  </th>
                  <th className="py-4 px-4 text-right w-40">
                    <span className="text-[10px] font-semibold text-scifi-muted uppercase tracking-widest">
                      {currentTab.valueLabel}
                    </span>
                  </th>
                  <th className="py-4 px-4 text-right w-32">
                    <span className="text-[10px] font-semibold text-scifi-muted uppercase tracking-widest">
                      变化
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((row, idx) => (
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
          )}
        </div>
      </TechCard>

      <HeroDetailModal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        hero={selectedHero}
      />

      <div className="fixed top-6 right-6 z-[100] space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              'pointer-events-auto relative px-4 py-3 rounded-lg border backdrop-blur-xl max-w-sm',
              toast.type === 'success'
                ? 'bg-gradient-to-r from-green-500/15 to-emerald-500/10 border-green-400/40 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                : toast.type === 'error'
                  ? 'bg-gradient-to-r from-red-500/15 to-rose-500/10 border-red-400/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                  : 'bg-scifi-panel/95 border-cyan-400/30',
            )}
          >
            <div className="flex items-start gap-3">
              {toast.type === 'success' && (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              )}
              {toast.type === 'error' && (
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

      {heroLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-scifi-panel/95 border border-cyan-400/30">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-sm text-scifi-text">加载英雄详情中...</p>
          </div>
        </div>
      )}
    </div>
  );
}
