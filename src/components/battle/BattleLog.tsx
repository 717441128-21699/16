import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Swords, Heart, Sparkles, Skull, Info } from 'lucide-react';

export interface BattleLogEntry {
  id: string;
  timestamp: number;
  type: 'damage' | 'heal' | 'skill' | 'kill' | 'info';
  message: string;
  value?: number;
}

interface BattleLogProps {
  logs: BattleLogEntry[];
  maxLogs?: number;
  className?: string;
}

const typeConfig: Record<BattleLogEntry['type'], { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  damage: {
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/30',
    icon: <Swords className="w-3.5 h-3.5" />,
    label: '伤害',
  },
  heal: {
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/30',
    icon: <Heart className="w-3.5 h-3.5" />,
    label: '治疗',
  },
  skill: {
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/30',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    label: '技能',
  },
  kill: {
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/30',
    icon: <Skull className="w-3.5 h-3.5" />,
    label: '击杀',
  },
  info: {
    color: 'text-scifi-muted',
    bg: 'bg-white/5 border-white/10',
    icon: <Info className="w-3.5 h-3.5" />,
    label: '信息',
  },
};

export function BattleLog({ logs, maxLogs = 50, className }: BattleLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const displayLogs = logs.slice(-maxLogs);

  return (
    <div className={cn('flex flex-col h-full glass rounded-lg border border-scifi-border overflow-hidden', className)}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-display text-xs font-semibold uppercase tracking-wider text-scifi-text">
            战斗日志
          </span>
        </div>
        <span className="text-xs font-mono text-scifi-muted">
          {logs.length} 条记录
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin"
      >
        <AnimatePresence initial={false}>
          {displayLogs.map((log) => {
            const config = typeConfig[log.type];
            const time = new Date(log.timestamp);
            const timeStr = `${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  'flex items-start gap-2 px-3 py-2 rounded-md border text-sm',
                  config.bg,
                )}
              >
                <span className="text-[10px] font-mono text-scifi-muted mt-0.5 flex-shrink-0">
                  {timeStr}
                </span>
                <div className={cn('mt-0.5 flex-shrink-0', config.color)}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm leading-snug', config.color)}>
                    {log.message}
                    {log.value !== undefined && (
                      <span className="ml-1.5 font-bold font-mono">
                        {log.value > 0 ? '+' : ''}{log.value}
                      </span>
                    )}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {displayLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-scifi-muted">
            <Info className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">等待战斗开始...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BattleLog;
