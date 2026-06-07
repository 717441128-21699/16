import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  Users,
  Map,
  ShoppingBag,
  ShieldAlert,
  Trophy,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { to: "/", label: "主控台", icon: LayoutDashboard },
  { to: "/hero-create", label: "英雄创建", icon: Sparkles },
  { to: "/hero-manage", label: "英雄管理", icon: Users },
  { to: "/city-map", label: "城市地图", icon: Map },
  { to: "/market", label: "交易市场", icon: ShoppingBag },
  { to: "/security", label: "安全报告", icon: ShieldAlert },
  { to: "/rankings", label: "排行榜", icon: Trophy },
  { to: "/guild", label: "公会大厅", icon: Building2 },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-screen fixed left-0 top-0 glass border-r border-scifi-border flex flex-col z-30">
      <div className="h-16 flex items-center px-6 border-b border-scifi-border">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-glow-cyan">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="absolute inset-0 rounded-md bg-gradient-to-br from-cyan-500 to-purple-600 blur-md opacity-50 -z-10" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold text-scifi-text leading-tight">
              超级英雄联盟
            </h1>
            <p className="text-[10px] text-scifi-muted uppercase tracking-wider">
              Hero Alliance
            </p>
          </div>
        </motion.div>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-display font-semibold uppercase tracking-widest text-scifi-muted">
          导航菜单
        </p>
        <ul className="space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.li
                key={item.to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-300 overflow-hidden",
                      isActive
                        ? "text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 shadow-glow-cyan"
                        : "text-scifi-muted hover:text-scifi-text hover:bg-white/5 border border-transparent hover:border-cyan-400/20",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-r-full"
                        />
                      )}
                      <Icon
                        className={cn(
                          "w-5 h-5 transition-colors duration-300 flex-shrink-0",
                          isActive
                            ? "text-cyan-400"
                            : "text-scifi-muted group-hover:text-cyan-400",
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.8)] animate-pulse-glow"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-scifi-border">
        <div className="glass rounded-lg p-3 border border-cyan-400/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-glow shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            <span className="text-xs font-medium text-scifi-text">系统状态</span>
          </div>
          <p className="text-[11px] text-scifi-muted leading-relaxed">
            所有系统运行正常，城市安全等级：优秀
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
