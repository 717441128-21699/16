import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Package,
  Tag,
  ShoppingBag,
  History,
  Clock,
  CheckCircle,
  ShoppingCart,
  Megaphone,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TechCard } from "@/components/ui/TechCard";
import { StatCard } from "@/components/ui/StatCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { MarketItemCard } from "@/components/market/MarketItemCard";
import { ListItemModal } from "@/components/market/ListItemModal";
import { useMarketStore } from "@/store/useMarketStore";
import type { MarketItem, ItemCategory } from "@/data/market";

type TabKey = "all" | "suit-blueprint" | "skill-book" | "rare-material";
type OrderTabKey = "selling" | "sold" | "bought";

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: "all", label: "全部", icon: "🌐" },
  { key: "suit-blueprint", label: "蓝图", icon: "📜" },
  { key: "skill-book", label: "技能书", icon: "📕" },
  { key: "rare-material", label: "材料", icon: "💎" },
];

const orderTabs: { key: OrderTabKey; label: string; icon: typeof Clock }[] = [
  { key: "selling", label: "出售中", icon: Clock },
  { key: "sold", label: "已售出", icon: CheckCircle },
  { key: "bought", label: "购买记录", icon: History },
];

interface ToastItem {
  id: string;
  message: string;
  type: "buy" | "info";
}

export default function Market() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [orderTab, setOrderTab] = useState<OrderTabKey>("selling");
  const [searchQuery, setSearchQuery] = useState("");
  const [showListModal, setShowListModal] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const items = useMarketStore((s) => s.items);
  const priceHistory = useMarketStore((s) => s.priceHistory);
  const myOrders = useMarketStore((s) => s.myOrders);
  const listItem = useMarketStore((s) => s.listItem);
  const buyItem = useMarketStore((s) => s.buyItem);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesTab = activeTab === "all" || item.category === activeTab;
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [items, activeTab, searchQuery]);

  const totalListed = items.length;
  const totalValue = items.reduce((sum, i) => sum + i.currentPrice * i.stock, 0);
  const activeOrders = myOrders.filter((o) => o.status === "active").length;

  const showToast = (message: string, type: "buy" | "info" = "info") => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleBuy = (item: MarketItem) => {
    const success = buyItem(item.id, 1);
    if (success) {
      showToast(
        `📢 [全服公告] 恭喜英雄成功购买 ${item.name}！交易金额 ¥${item.currentPrice.toLocaleString()}`,
        "buy",
      );
    }
  };

  const handleListConfirm = (data: {
    itemId: string;
    itemName: string;
    category: ItemCategory;
    rarity: string;
    price: number;
    quantity: number;
  }) => {
    const baseItem = items.find((i) => i.id === data.itemId);
    listItem({
      id: `listed-${Date.now()}`,
      name: data.itemName,
      category: data.category,
      rarity: data.rarity as "common" | "rare" | "epic" | "legendary",
      description: baseItem?.description ?? "",
      basePrice: data.price,
      currentPrice: data.price,
      icon: baseItem?.icon ?? "📦",
      sellerName: "当前玩家",
      listedAt: Date.now(),
      quantity: data.quantity,
    });
    showToast(`✅ 商品已成功上架：${data.itemName} x${data.quantity}`, "info");
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gradient-cyber tracking-tight">
            交易市场
          </h1>
          <p className="text-sm text-scifi-muted mt-1">
            英雄间的物资流通平台，安全、高效、透明
          </p>
        </div>
        <GlowButton variant="primary" size="lg" onClick={() => setShowListModal(true)}>
          <Plus className="w-4 h-4" />
          发布商品
        </GlowButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Package className="w-5 h-5" />}
          label="在售商品"
          value={totalListed}
          change={12}
          color="cyan"
        />
        <StatCard
          icon={<Tag className="w-5 h-5" />}
          label="市场总值"
          value={`¥${totalValue.toLocaleString()}`}
          change={8}
          color="purple"
        />
        <StatCard
          icon={<ShoppingBag className="w-5 h-5" />}
          label="我的挂单"
          value={activeOrders}
          change={-3}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <TechCard className="p-4" glow={false} borderColor="cyan">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium uppercase tracking-wider transition-all duration-200",
                      activeTab === tab.key
                        ? "bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(0,212,255,0.25)]"
                        : "text-scifi-muted hover:text-scifi-text hover:bg-white/5",
                    )}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-scifi-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索商品名称或描述..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm text-scifi-text placeholder:text-scifi-muted focus:outline-none focus:border-cyan-400/50 focus:bg-cyan-500/5 transition-all"
                />
              </div>
            </div>
          </TechCard>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                >
                  <MarketItemCard
                    item={item}
                    priceHistory={priceHistory.find((h) => h.itemId === item.id)}
                    onBuy={handleBuy}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <TechCard className="p-12" glow={false}>
              <div className="flex flex-col items-center justify-center text-center">
                <Package className="w-12 h-12 text-scifi-muted mb-3" />
                <p className="text-sm font-medium text-scifi-text mb-1">暂无商品</p>
                <p className="text-xs text-scifi-muted">试试切换分类或修改搜索条件</p>
              </div>
            </TechCard>
          )}
        </div>

        <div className="space-y-4">
          <TechCard className="p-4" glow={false} borderColor="purple">
            <h3 className="font-display text-sm font-semibold text-scifi-text uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-purple-400" />
              我的订单
            </h3>
            <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10 mb-4">
              {orderTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setOrderTab(tab.key)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-wider transition-all duration-200",
                      orderTab === tab.key
                        ? "bg-purple-500/20 text-purple-300"
                        : "text-scifi-muted hover:text-scifi-text hover:bg-white/5",
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {myOrders.length > 0 ? (
                myOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3 rounded-lg border border-white/10 bg-white/5 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-xs font-medium text-scifi-text truncate">
                        {order.itemName}
                      </p>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-medium",
                          order.status === "active"
                            ? "bg-cyan-500/15 text-cyan-400 border border-cyan-400/30"
                            : order.status === "completed"
                              ? "bg-green-500/15 text-green-400 border border-green-400/30"
                              : "bg-gray-500/15 text-gray-400 border border-gray-400/30",
                        )}
                      >
                        {order.status === "active"
                          ? "出售中"
                          : order.status === "completed"
                            ? "已完成"
                            : "已取消"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-gradient-cyber font-semibold">
                        ¥{order.price.toLocaleString()}
                      </span>
                      <span className="text-scifi-muted">x{order.quantity}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <History className="w-8 h-8 text-scifi-muted mx-auto mb-2" />
                  <p className="text-xs text-scifi-muted">暂无订单记录</p>
                </div>
              )}
            </div>
          </TechCard>
        </div>
      </div>

      <ListItemModal
        open={showListModal}
        onClose={() => setShowListModal(false)}
        onConfirm={handleListConfirm}
      />

      <div className="fixed top-6 right-6 z-[100] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(
                "pointer-events-auto relative px-4 py-3 rounded-lg border backdrop-blur-xl max-w-sm",
                toast.type === "buy"
                  ? "bg-gradient-to-r from-yellow-500/15 to-orange-500/10 border-yellow-400/40 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                  : "bg-scifi-panel/95 border-cyan-400/30",
              )}
            >
              <div className="flex items-start gap-3">
                {toast.type === "buy" && (
                  <Megaphone className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5 animate-pulse" />
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
        </AnimatePresence>
      </div>
    </div>
  );
}
