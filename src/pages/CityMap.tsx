import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Radio, ShieldAlert, AlertTriangle, X, Search, Swords, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechCard, GlowButton, StatCard } from '@/components/ui';
import { DistrictCard } from '@/components/city/DistrictCard';
import { EventCard } from '@/components/city/EventCard';
import { Heatmap } from '@/components/city/Heatmap';
import { useCityStore } from '@/store/useCityStore';
import { useHeroStore } from '@/store/useHeroStore';
import { api } from '@/lib/api';
import type { District } from '@/data/city';

export default function CityMap() {
  const navigate = useNavigate();
  const { districts, activeEvents, triggerEventAsync, fetchDistricts, fetchEvents, updateDistrictStats, loading: cityLoading } = useCityStore();
  const { currentHero, heroList } = useHeroStore();
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const hero = currentHero ?? heroList[0];

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchDistricts(),
          fetchEvents(),
        ]);
      } catch (error) {
        console.error('加载城市数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchDistricts, fetchEvents]);

  useEffect(() => {
    if (!loading && activeEvents.length === 0) {
      handleTriggerEvent();
    }
  }, [loading, activeEvents.length]);

  const handleTriggerEvent = async () => {
    setTriggering(true);
    try {
      await triggerEventAsync();
    } catch (error) {
      console.error('触发事件失败:', error);
    } finally {
      setTriggering(false);
    }
  };

  const handlePatrol = (district: District) => {
    setIsScanning(true);
    setTimeout(() => {
      updateDistrictStats(district.id, {
        crimeRate: Math.max(0, district.crimeRate - 5),
        satisfaction: Math.min(100, district.satisfaction + 3),
        activity: Math.min(100, district.activity + 2),
      });
      if (Math.random() > 0.5) {
        handleTriggerEvent();
      }
      setIsScanning(false);
    }, 1500);
  };

  const handleAcceptMission = async (eventId: string) => {
    if (!hero) {
      navigate('/hero-create');
      return;
    }
    try {
      await api.joinEvent(eventId, hero.id);
      navigate('/battle');
    } catch (error) {
      console.error('接取任务失败:', error);
    }
  };

  const getDistrictEvents = (districtId: string) => {
    return activeEvents.filter((e) => e.districtId === districtId);
  };

  const avgCrimeRate = districts.length > 0
    ? Math.round(districts.reduce((sum, d) => sum + d.crimeRate, 0) / districts.length)
    : 0;
  const avgSatisfaction = districts.length > 0
    ? Math.round(districts.reduce((sum, d) => sum + d.satisfaction, 0) / districts.length)
    : 0;
  const totalPopulation = districts.reduce((sum, d) => sum + d.population, 0);

  if (loading || cityLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
          <p className="text-scifi-muted">加载城市数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient-cyber mb-1">
              星城监控中心
            </h1>
            <p className="text-scifi-muted text-sm">实时城市态势感知与事件响应系统</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/30">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-400">
                {activeEvents.length} 活跃事件
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-4 gap-4">
          <StatCard
            icon={<MapPin className="w-5 h-5" />}
            label="监控区域"
            value={`${districts.length} 个`}
            color="cyan"
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5" />}
            label="平均犯罪率"
            value={`${avgCrimeRate}%`}
            change={-3}
            color="red"
          />
          <StatCard
            icon={<ShieldAlert className="w-5 h-5" />}
            label="市民满意度"
            value={`${avgSatisfaction}%`}
            change={2}
            color="green"
          />
          <StatCard
            icon={<Radio className="w-5 h-5" />}
            label="覆盖人口"
            value={totalPopulation.toLocaleString()}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-5 space-y-4">
            <TechCard title="城市犯罪热力图" borderColor="cyan">
              <Heatmap
                districts={districts}
                onDistrictClick={setSelectedDistrict}
              />
            </TechCard>

            <TechCard title="区域概览" borderColor="purple">
              <div className="grid grid-cols-1 gap-4">
                {districts.map((district, idx) => (
                  <motion.div
                    key={district.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <DistrictCard
                      district={district}
                      hasActiveEvent={getDistrictEvents(district.id).length > 0}
                      onClick={() => setSelectedDistrict(district)}
                    />
                  </motion.div>
                ))}
              </div>
            </TechCard>
          </div>

          <div className="col-span-7 space-y-4">
            <TechCard title="活跃事件" borderColor="red">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-scifi-muted">
                  当前有 {activeEvents.length} 个事件需要处理
                </p>
                <GlowButton
                  size="sm"
                  variant="primary"
                  onClick={handleTriggerEvent}
                  disabled={triggering}
                >
                  {triggering ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Radio className="w-4 h-4" />
                  )}
                  {triggering ? '扫描中...' : '扫描事件'}
                </GlowButton>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {activeEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-scifi-muted">
                    <ShieldAlert className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm">暂无活跃事件，城市安全！</p>
                  </div>
                ) : (
                  activeEvents.map((event, idx) => (
                    <motion.div
                      key={event.instanceId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                    >
                      <EventCard event={event} onAccept={() => handleAcceptMission(event.id)} />
                    </motion.div>
                  ))
                )}
              </div>
            </TechCard>

            <div className="grid grid-cols-2 gap-4">
              <TechCard title="快速行动" borderColor="yellow">
                <div className="space-y-3">
                  <GlowButton
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => handleAcceptMission(activeEvents[0]?.id ?? '')}
                    disabled={activeEvents.length === 0}
                  >
                    <Swords className="w-5 h-5" />
                    进入战斗训练
                  </GlowButton>
                  <GlowButton
                    variant="ghost"
                    size="lg"
                    className="w-full"
                    onClick={() => setIsScanning(true)}
                    disabled={isScanning}
                  >
                    {isScanning ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                    {isScanning ? '扫描中...' : '全城扫描'}
                  </GlowButton>
                </div>
              </TechCard>

              <TechCard title="系统状态" borderColor="green">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-scifi-muted">监控系统</span>
                    <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      在线
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-scifi-muted">通讯系统</span>
                    <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      在线
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-scifi-muted">能量供应</span>
                    <span className="text-xs text-yellow-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                      87%
                    </span>
                  </div>
                </div>
              </TechCard>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedDistrict && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedDistrict(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg"
            >
              <button
                onClick={() => setSelectedDistrict(null)}
                className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-scifi-panel border border-white/20 flex items-center justify-center text-scifi-muted hover:text-white hover:border-white/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <DistrictCard
                district={selectedDistrict}
                hasActiveEvent={getDistrictEvents(selectedDistrict.id).length > 0}
              />

              <div className="mt-4 flex gap-3">
                <GlowButton
                  variant="primary"
                  className="flex-1"
                  onClick={() => handlePatrol(selectedDistrict)}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Radio className="w-4 h-4" />
                  )}
                  {isScanning ? '巡逻中...' : '开始巡逻'}
                </GlowButton>
                <GlowButton
                  variant="danger"
                  className="flex-1"
                  onClick={() => {
                    const districtEvent = getDistrictEvents(selectedDistrict.id)[0];
                    if (districtEvent) {
                      handleAcceptMission(districtEvent.id);
                    } else {
                      handleAcceptMission(activeEvents[0]?.id ?? '');
                    }
                  }}
                >
                  <Swords className="w-4 h-4" />
                  前往支援
                </GlowButton>
              </div>

              {getDistrictEvents(selectedDistrict.id).length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-semibold text-scifi-text">该区域事件</h4>
                  {getDistrictEvents(selectedDistrict.id).map((event) => (
                    <EventCard
                      key={event.instanceId}
                      event={event}
                      onAccept={() => handleAcceptMission(event.id)}
                      compact
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
