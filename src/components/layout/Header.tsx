import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Coins,
  Award,
  Clock,
  Bell,
  ChevronDown,
  User,
  Megaphone,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHeroStore } from "@/store/useHeroStore";
import { useCityStore } from "@/store/useCityStore";

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  const currentHero = useHeroStore((s) => s.currentHero);
  const heroLoading = useHeroStore((s) => s.loading);
  const fetchHeroes = useHeroStore((s) => s.fetchHeroes);
  const announcements = useCityStore((s) => s.announcements);
  const fetchAnnouncements = useCityStore((s) => s.fetchAnnouncements);

  useEffect(() => {
    fetchHeroes();
    fetchAnnouncements();
  }, [fetchHeroes, fetchAnnouncements]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (announcements.length === 0) return;
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    });
  };

  const gold = currentHero?.gold ?? 0;
  const reputation = currentHero?.reputation ?? 0;

  return (
    <header className="h-16 fixed top-0 left-64 right-0 glass border-b border-scifi-border z-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-6 flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center"
          >
            <Shield className="w-4 h-4 text-cyan-400" />
          </motion.div>
          <span className="font-display text-sm font-semibold text-scifi-text tracking-wide hidden sm:block">
            超级英雄联盟
          </span>
        </div>

        <div className="flex-1 max-w-xl relative">
          <div className="h-8 rounded-md bg-white/5 border border-white/10 flex items-center overflow-hidden">
            <div className="px-3 h-full flex items-center gap-2 border-r border-white/10 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
              <Megaphone className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-[10px] font-display font-semibold uppercase tracking-wider text-yellow-400">
                公告
              </span>
            </div>
            <div className="flex-1 overflow-hidden relative px-3">
              {announcements.length > 0 ? (
                <motion.div
                  key={announcementIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="whitespace-nowrap text-xs text-scifi-text truncate"
                >
                  {announcements[announcementIndex]?.content}
                </motion.div>
              ) : (
                <span className="text-xs text-scifi-muted">暂无公告</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-yellow-500/10 border border-yellow-400/20 cursor-pointer transition-colors hover:bg-yellow-500/15"
          >
            <Coins className="w-4 h-4 text-yellow-400" />
            {heroLoading ? (
              <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
            ) : (
              <span className="text-sm font-semibold text-yellow-300">
                {gold.toLocaleString()}
              </span>
            )}
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-purple-500/10 border border-purple-400/20 cursor-pointer transition-colors hover:bg-purple-500/15"
          >
            <Award className="w-4 h-4 text-purple-400" />
            {heroLoading ? (
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            ) : (
              <span className="text-sm font-semibold text-purple-300">
                {reputation.toLocaleString()}
              </span>
            )}
          </motion.div>

          <div className="flex items-center gap-2 text-scifi-muted">
            <Clock className="w-4 h-4" />
            <div className="text-right leading-tight">
              <p className="text-xs text-scifi-text font-mono font-medium">
                {formatTime(currentTime)}
              </p>
              <p className="text-[10px]">{formatDate(currentTime)}</p>
            </div>
          </div>
        </div>

        <button className="relative p-2 rounded-md text-scifi-muted hover:text-scifi-text hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse-glow shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
        </button>

        <div className="h-8 w-px bg-white/10" />

        <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-white/5 transition-colors group">
          <div className="relative">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center overflow-hidden">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-scifi-bg" />
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <p className="text-xs font-semibold text-scifi-text">
              {currentHero?.alias ?? '指挥官'}
            </p>
            <p className="text-[10px] text-scifi-muted">
              LV.{currentHero?.level ?? 1}
            </p>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-scifi-muted transition-transform duration-200",
              "group-hover:text-scifi-text",
            )}
          />
        </button>
      </div>
    </header>
  );
}

export default Header;
