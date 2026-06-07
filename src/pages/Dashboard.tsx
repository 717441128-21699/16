import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Zap,
  Heart,
  Battery,
  Users,
  Building2,
  ShoppingBag,
  Trophy,
  Swords,
  Clock,
  Megaphone,
  Activity,
  MapPin,
  ChevronRight,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechCard } from '@/components/ui/TechCard';
import { StatCard } from '@/components/ui/StatCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RarityBadge } from '@/components/ui/RarityBadge';
import { useCityStore } from '@/store/useCityStore';
import { useHeroStore } from '@/store/useHeroStore';
import { districts, cityEvents } from '@/data/city';
import { superPowers, suits, weapons } from '@/data/heroes';

interface DynamicEvent {
  id: string;
  type: 'event' | 'announcement' | 'trade';
  icon: string;
  message: string;
  timestamp: number;
}

const quickEntries = [
  { key: 'hero-create', label: '英雄创建', icon: Sparkles, color: 'cyan', path: '/hero-create' },
  { key: 'mission', label: '执行任务', icon: Swords, color: 'red', path: '/city-map' },
  { key: 'market', label: '交易市场', icon: ShoppingBag, color: 'purple', path: '/market' },
  { key: 'guild', label: '公会大厅', icon: Building2, color: 'green', path: '/guild' },
];

const districtColors: Record<string, string> = {
  financial: 'cyan',
  industrial: 'yellow',
  residential: 'green',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const currentHero = useHeroStore((s) => s.currentHero);
  const heroList = useHeroStore((s) => s.heroList);
  const districts = useCityStore((s) => s.districts);
  const announcements = useCityStore((s) => s.announcements);
  const triggerRandomEvent = useCityStore((s) => s.triggerRandomEvent);

  const [dynamicEvents, setDynamicEvents] = useState<DynamicEvent[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const initialEvents: DynamicEvent[] = [
      {
        id: 'evt-1',
        type: 'announcement',
        icon: '📢',
        message: '[系统公告] 新版本 v2.3.0 已上线，新增街区争夺战玩法！',
        timestamp: Date.now() - 120000,
      },
      {
        id: 'evt-2',
        type: 'trade',
        icon: '💰',
        message: '玩家「幽影」成功出售 量子战衣蓝图，成交价 ¥58,000',
        timestamp: Date.now() - 60000,
      },
      {
        id: 'evt-3',
        type: 'event',
        icon: '🚨',
        message: '工业区发生帮派火拼事件，急需英雄支援！',
        timestamp: Date.now() - 30000,
      },
    ];
    setDynamicEvents(initialEvents);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const eventTypes: DynamicEvent['type'][] = ['event', 'announcement', 'trade'];
      const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      let newEvent: DynamicEvent;
      if (randomType === 'event') {
        const randomCityEvent = cityEvents[Math.floor(Math.random() * cityEvents.length)];
        newEvent = {
          id: `evt-${Date.now()}`,
          type: 'event',
          icon: randomCityEvent.icon,
          message: `${randomCityEvent.name}！${randomCityEvent.description}`,
          timestamp: Date.now(),
        };
      } else if (randomType === 'trade') {
        const heroNames = heroList.map((h) => h.alias);
        const randomName = heroNames[Math.floor(Math.random() * heroNames.length)] || '神秘英雄';
        const items = ['等离子之刃', '泰坦战衣', '奥术法杖', '虚空之弓'];
        const randomItem = items[Math.floor(Math.random() * items.length)];
        const price = Math.floor(Math.random() * 90000) + 10000;
        newEvent = {
          id: `evt-${Date.now()}`,
          type: 'trade',
          icon: '💎',
          message: `玩家「${randomName}」成功出售 ${randomItem}，成交价 ¥${price.toLocaleString()}`,
          timestamp: Date.now(),
        };
      } else {
        const annMessages = [
          '本周双倍经验活动开启，快来参与！',
          '新英雄「雷霆」已加入英雄池，快去召唤吧！',
          '公会战报名即将截止，请会长尽快确认！',
          '周末限定礼包已上架，限时抢购！',
        ];
        newEvent = {
          id: `evt-${Date.now()}`,
          type: 'announcement',
          icon: '📢',
          message: `[系统公告] ${annMessages[Math.floor(Math.random() * annMessages.length)]}`,
          timestamp: Date.now(),
        };
      }
      
      setDynamicEvents((prev) => [newEvent, ...prev].slice(0, 20));
    }, 8000);

    return () => clearInterval(interval);
  }, [heroList]);

  const avgCrimeRate = Math.round(districts.reduce((sum, d) => sum + d.crimeRate, 0) / districts.length);
  const avgSatisfaction = Math.round(districts.reduce((sum, d) => sum + d.satisfaction, 0) / districts.length);
  const safetyScore = Math.max(0, 100 - avgCrimeRate);

  const heroSuit = currentHero ? suits.find((s) => s.id === currentHero.suitId) : null;
  const heroWeapon = currentHero ? weapons.find((w) => w.id === currentHero.weaponId) : null;
  const heroPowers = currentHero
    ? currentHero.powers.map((pid) => superPowers.find((p) => p.id === pid)).filter(Boolean)
    : [];

  const getSafetyRating = (score: number) => {
    if (score >= 85) return { label: '优秀', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-400/40' };
    if (score >= 70) return { label: '良好', color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-400/40' };
    if (score >= 50) return { label: '一般', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-400/40' };
    return { label: '危险', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-400/40' };
  };

  const safetyRating = getSafetyRating(safetyScore);
  const formatTime = (d: Date) => d.toLocaleTimeString('zh-CN', { hour12: false });
  const formatDate = (d: Date) => d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div className="min-h-screen p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-3xl font-bold text-gradient-cyber">
              欢迎回来，{currentHero?.alias ?? '英雄'}
            </h1>
            {currentHero && (
              <span className="text-2xl">{currentHero.avatar}</span>
            )}
          </div>
          <p className="text-sm text-scifi-muted">
            {formatDate(currentTime)} · {formatTime(currentTime)} · 星城守护系统 v2.3.0
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-lg border backdrop-blur-xl',
              safetyRating.bg,
              safetyRating.border,
            )}
          >
            <ShieldCheck className={cn('w-5 h-5', safetyRating.color)} />
            <div>
              <p className="text-[10px] text-scifi-muted uppercase tracking-wider">今日城市安全评分</p>
              <div className="flex items-center gap-2">
                <span className={cn('text-xl font-bold font-display', safetyRating.color)}>{safetyScore}</span>
                <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', safetyRating.bg, safetyRating.color)}>
                  {safetyRating.label}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-display text-sm font-semibold text-scifi-text uppercase tracking-wider mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          城市概览
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {districts.map((district, idx) => {
            const color = districtColors[district.type] ?? 'cyan';
            return (
              <motion.div
                key={district.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <TechCard glow={true} borderColor={color as any} className="p-5 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-2xl border border-white/10">
                        {district.icon}
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-scifi-text">{district.name}</h3>
                        <p className="text-xs text-scifi-muted">人口 {district.population.toLocaleString()}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-scifi-muted" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> 犯罪率
                        </span>
                        <span className="text-scifi-text font-medium">{district.crimeRate}%</span>
                      </div>
                      <ProgressBar value={district.crimeRate} max={100} color="red" showLabel={false} height={6} />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-green-400 flex items-center gap-1">
                          <Star className="w-3 h-3" /> 满意度
                        </span>
                        <span className="text-scifi-text font-medium">{district.satisfaction}%</span>
                      </div>
                      <ProgressBar value={district.satisfaction} max={100} color="green" showLabel={false} height={6} />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-cyan-400 flex items-center gap-1">
                          <Activity className="w-3 h-3" /> 活跃度
                        </span>
                        <span className="text-scifi-text font-medium">{district.activity}%</span>
                      </div>
                      <ProgressBar value={district.activity} max={100} color="cyan" showLabel={false} height={6} />
                    </div>
                  </div>
                </TechCard>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 space-y-6"
        >
          <div>
            <h2 className="font-display text-sm font-semibold text-scifi-text uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              英雄状态
            </h2>
            {currentHero ? (
              <TechCard glow={false} className="p-5">
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.5 } }}
                      className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center text-4xl border border-cyan-400/30 shadow-[0_0_20px_rgba(0,212,255,0.2)]"
                    >
                      {currentHero.avatar}
                      <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-yellow-500 to-orange-500 text-[10px] font-bold text-black">
                        Lv.{currentHero.level}
                      </div>
                    </motion.div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-gradient-cyber">{currentHero.alias}</h3>
                      <p className="text-xs text-scifi-muted mb-1">{currentHero.name}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {heroSuit && <RarityBadge rarity={heroSuit.rarity}>{heroSuit.icon} {heroSuit.name}</RarityBadge>}
                        {heroWeapon && <RarityBadge rarity={heroWeapon.rarity}>{heroWeapon.icon} {heroWeapon.name}</RarityBadge>}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-red-400 flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" /> 生命值
                        </span>
                        <span className="text-xs text-scifi-text font-mono">{currentHero.hp} / {currentHero.maxHp}</span>
                      </div>
                      <ProgressBar value={currentHero.hp} max={currentHero.maxHp} color="red" showLabel={false} height={10} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-cyan-400 flex items-center gap-1">
                          <Battery className="w-3.5 h-3.5" /> 能量值
                        </span>
                        <span className="text-xs text-scifi-text font-mono">{currentHero.energy} / {currentHero.maxEnergy}</span>
                      </div>
                      <ProgressBar value={currentHero.energy} max={currentHero.maxEnergy} color="cyan" showLabel={false} height={10} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-purple-400 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> 经验值
                        </span>
                        <span className="text-xs text-scifi-text font-mono">{currentHero.exp} / {currentHero.maxExp}</span>
                      </div>
                      <ProgressBar value={currentHero.exp} max={currentHero.maxExp} color="purple" showLabel={false} height={10} />
                    </div>
                  </div>
                </div>

                {heroPowers.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-white/10">
                    <p className="text-xs text-scifi-muted uppercase tracking-wider mb-3">核心技能冷却</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {heroPowers.map((power, idx) => (
                        <motion.div
                          key={power!.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + idx * 0.05 }}
                          whileHover={{ scale: 1.03 }}
                          className="relative p-3 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/30 transition-all overflow-hidden"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-lg">{power!.icon}</span>
                            <span className="text-sm font-medium text-scifi-text">{power!.name}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-yellow-400">⚡ {power!.energyCost}</span>
                            <span className="text-scifi-muted">
                              <Clock className="w-3 h-3 inline mr-0.5" />{power!.cooldown}s
                            </span>
                          </div>
                          <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 1.5 + idx * 0.3, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </TechCard>
            ) : (
              <TechCard className="p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <Users className="w-12 h-12 text-scifi-muted mb-3" />
                  <p className="text-sm font-medium text-scifi-text mb-1">暂无英雄</p>
                  <p className="text-xs text-scifi-muted mb-4">创建你的第一个超级英雄，开始守护星城</p>
                  <GlowButton variant="primary" onClick={() => navigate('/hero-create')}>
                    <Sparkles className="w-4 h-4" />
                    创建英雄
                  </GlowButton>
                </div>
              </TechCard>
            )}
          </div>

          <div>
            <h2 className="font-display text-sm font-semibold text-scifi-text uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              快捷入口
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickEntries.map((entry, idx) => {
                const Icon = entry.icon;
                return (
                  <motion.button
                    key={entry.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.05 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(entry.path)}
                    className={cn(
                      'group relative p-5 rounded-xl border transition-all duration-300 overflow-hidden text-left',
                      entry.color === 'cyan' && 'bg-cyan-500/5 border-cyan-400/20 hover:bg-cyan-500/10 hover:border-cyan-400/50',
                      entry.color === 'red' && 'bg-red-500/5 border-red-400/20 hover:bg-red-500/10 hover:border-red-400/50',
                      entry.color === 'purple' && 'bg-purple-500/5 border-purple-400/20 hover:bg-purple-500/10 hover:border-purple-400/50',
                      entry.color === 'green' && 'bg-green-500/5 border-green-400/20 hover:bg-green-500/10 hover:border-green-400/50',
                    )}
                  >
                    <div
                      className={cn(
                        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none',
                        entry.color === 'cyan' && 'bg-[radial-gradient(circle_at_50%_0%,rgba(0,212,255,0.15),transparent_60%)]',
                        entry.color === 'red' && 'bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.15),transparent_60%)]',
                        entry.color === 'purple' && 'bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.15),transparent_60%)]',
                        entry.color === 'green' && 'bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.15),transparent_60%)]',
                      )}
                    />
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110',
                        entry.color === 'cyan' && 'bg-cyan-500/20 text-cyan-400',
                        entry.color === 'red' && 'bg-red-500/20 text-red-400',
                        entry.color === 'purple' && 'bg-purple-500/20 text-purple-400',
                        entry.color === 'green' && 'bg-green-500/20 text-green-400',
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-scifi-text">{entry.label}</p>
                    <p className="text-[11px] text-scifi-muted mt-0.5 flex items-center gap-1">
                      立即前往 <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div>
            <h2 className="font-display text-sm font-semibold text-scifi-text uppercase tracking-wider mb-3 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-yellow-400" />
              实时动态
            </h2>
            <TechCard glow={false} className="overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto">
                <AnimatePresence initial={false}>
                  {dynamicEvents.length > 0 ? (
                    dynamicEvents.map((event, idx) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: 30, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                        exit={{ opacity: 0, x: -30, height: 0 }}
                        transition={{ duration: 0.4 }}
                        className={cn(
                          'px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors',
                          idx === 0 && 'bg-yellow-500/5',
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-lg flex-shrink-0 mt-0.5">{event.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                'text-xs leading-relaxed',
                                event.type === 'announcement' && 'text-yellow-300',
                                event.type === 'trade' && 'text-purple-300',
                                event.type === 'event' && 'text-red-300',
                              )}
                            >
                              {event.message}
                            </p>
                            <p className="text-[10px] text-scifi-muted mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(event.timestamp).toLocaleTimeString('zh-CN', { hour12: false })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Megaphone className="w-10 h-10 text-scifi-muted mx-auto mb-2" />
                      <p className="text-xs text-scifi-muted">暂无动态</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </TechCard>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<Trophy className="w-5 h-5" />}
              label="全服英雄"
              value={heroList.length + 128}
              change={5}
              color="yellow"
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="活跃公会"
              value={36}
              change={2}
              color="green"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
