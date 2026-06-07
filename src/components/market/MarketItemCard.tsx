import { useState } from "react";
import { motion } from "framer-motion";
import { User, ShoppingCart, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { TechCard } from "@/components/ui/TechCard";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { GlowButton } from "@/components/ui/GlowButton";
import { PriceSuggestionBar } from "./PriceSuggestionBar";
import type { MarketItem, ItemPriceHistory } from "@/data/market";
import type { Rarity } from "@/data/heroes";

const categoryIcons: Record<string, string> = {
  "suit-blueprint": "📜",
  "skill-book": "📕",
  "rare-material": "💎",
  "weapon-part": "⚙️",
  consumable: "🧪",
};

const categoryLabels: Record<string, string> = {
  "suit-blueprint": "蓝图",
  "skill-book": "技能书",
  "rare-material": "材料",
  "weapon-part": "武器配件",
  consumable: "消耗品",
};

interface MarketItemCardProps {
  item: MarketItem;
  priceHistory?: ItemPriceHistory;
  onBuy?: (item: MarketItem) => void;
}

export function MarketItemCard({ item, priceHistory, onBuy }: MarketItemCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const history = priceHistory?.history ?? [];
  const minPrice = history.length > 0 ? Math.min(...history.map((h) => h.price)) : item.basePrice;
  const maxPrice = history.length > 0 ? Math.max(...history.map((h) => h.price)) : item.basePrice * 1.3;
  const avgPrice =
    history.length > 0
      ? Math.round(history.reduce((sum, h) => sum + h.price, 0) / history.length)
      : item.basePrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <TechCard className="h-full overflow-hidden" glow={false} borderColor="cyan">
        <div className="flex flex-col h-full gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-lg border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 flex items-center justify-center text-3xl">
                {item.icon}
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-display text-base font-semibold text-scifi-text tracking-tight leading-tight">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <RarityBadge rarity={item.rarity as Rarity}>
                    {item.rarity === "common" && "普通"}
                    {item.rarity === "rare" && "稀有"}
                    {item.rarity === "epic" && "史诗"}
                    {item.rarity === "legendary" && "传说"}
                  </RarityBadge>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 text-[10px] font-medium text-scifi-muted border border-white/5">
                    <span>{categoryIcons[item.category]}</span>
                    {categoryLabels[item.category]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-scifi-muted leading-relaxed line-clamp-2">
            {item.description}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-scifi-muted mb-1">
                当前价格
              </p>
              <p className="font-display text-xl font-bold text-gradient-cyber">
                ¥{item.currentPrice.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-scifi-muted mb-1">
                库存
              </p>
              <p className="font-mono text-sm text-scifi-text">{item.stock}</p>
            </div>
          </div>

          {item.sellerName && (
            <div className="flex items-center gap-2 text-xs text-scifi-muted">
              <User className="w-3.5 h-3.5" />
              <span>卖家: {item.sellerName}</span>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: showDetails ? 1 : 0,
              height: showDetails ? "auto" : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-white/5 space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] text-scifi-muted">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-400">系统建议价格区间</span>
              </div>
              <PriceSuggestionBar
                minPrice={minPrice}
                maxPrice={maxPrice}
                avgPrice={avgPrice}
                currentPrice={item.currentPrice}
              />
              <div className="flex justify-between text-[10px] text-scifi-muted font-mono">
                <span>最低: ¥{minPrice.toLocaleString()}</span>
                <span className="text-cyan-400">均价: ¥{avgPrice.toLocaleString()}</span>
                <span>最高: ¥{maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          <div className="mt-auto pt-2">
            <GlowButton
              variant="primary"
              size="md"
              className={cn("w-full")}
              disabled={item.stock <= 0}
              onClick={() => onBuy?.(item)}
            >
              <ShoppingCart className="w-4 h-4" />
              {item.stock <= 0 ? "已售罄" : "立即购买"}
            </GlowButton>
          </div>
        </div>
      </TechCard>
    </motion.div>
  );
}

export default MarketItemCard;
