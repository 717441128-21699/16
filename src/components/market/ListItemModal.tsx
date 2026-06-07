import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Tag, DollarSign, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { TechCard } from "@/components/ui/TechCard";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { GlowButton } from "@/components/ui/GlowButton";
import { PriceSuggestionBar } from "./PriceSuggestionBar";
import { marketItems } from "@/data/market";
import type { ItemCategory } from "@/data/market";
import type { Rarity } from "@/data/heroes";

const categoryOptions: { value: ItemCategory | "all"; label: string; icon: string }[] = [
  { value: "suit-blueprint", label: "战衣蓝图", icon: "📜" },
  { value: "skill-book", label: "技能书", icon: "📕" },
  { value: "rare-material", label: "稀有材料", icon: "💎" },
  { value: "weapon-part", label: "武器配件", icon: "⚙️" },
  { value: "consumable", label: "消耗品", icon: "🧪" },
];

interface ListItemModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: (data: {
    itemId: string;
    itemName: string;
    category: ItemCategory;
    rarity: Rarity;
    price: number;
    quantity: number;
  }) => void;
}

export function ListItemModal({ open, onClose, onConfirm }: ListItemModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>("suit-blueprint");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  const filteredItems = marketItems.filter((i) => i.category === selectedCategory);
  const selectedItem = filteredItems.find((i) => i.id === selectedItemId);

  useEffect(() => {
    if (filteredItems.length > 0 && !selectedItemId) {
      setSelectedItemId(filteredItems[0].id);
    }
  }, [selectedCategory, filteredItems, selectedItemId]);

  useEffect(() => {
    if (selectedItem) {
      setPrice(selectedItem.basePrice);
    }
  }, [selectedItem]);

  const handleCategoryChange = (category: ItemCategory) => {
    setSelectedCategory(category);
    setSelectedItemId("");
  };

  const handleSubmit = () => {
    if (!selectedItem || price <= 0 || quantity <= 0) return;
    onConfirm?.({
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      category: selectedItem.category,
      rarity: selectedItem.rarity,
      price,
      quantity,
    });
    onClose();
  };

  const suggestedMin = selectedItem ? Math.round(selectedItem.basePrice * 0.85) : 0;
  const suggestedMax = selectedItem ? Math.round(selectedItem.basePrice * 1.2) : 0;
  const suggestedAvg = selectedItem ? selectedItem.basePrice : 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-xl">
              <TechCard className="relative" borderColor="purple" glow={false}>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-md border border-white/10 flex items-center justify-center text-scifi-muted hover:text-scifi-text hover:border-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="mb-6">
                  <h2 className="font-display text-xl font-bold text-scifi-text tracking-tight flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-400" />
                    发布商品
                  </h2>
                  <p className="text-sm text-scifi-muted mt-1">
                    选择要上架的物品并设置合理的价格
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-scifi-muted uppercase tracking-wider mb-2.5">
                      <Tag className="w-3.5 h-3.5" />
                      物品类型
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {categoryOptions.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => handleCategoryChange(cat.value as ItemCategory)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all duration-200",
                            selectedCategory === cat.value
                              ? "border-purple-400/60 bg-purple-500/15 text-purple-300"
                              : "border-white/10 bg-white/5 text-scifi-muted hover:border-white/20 hover:text-scifi-text",
                          )}
                        >
                          <span className="text-xl">{cat.icon}</span>
                          <span className="text-[10px] font-medium">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-scifi-muted uppercase tracking-wider mb-2.5">
                      <Package className="w-3.5 h-3.5" />
                      选择物品
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                      {filteredItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedItemId(item.id)}
                          className={cn(
                            "flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all duration-200",
                            selectedItemId === item.id
                              ? "border-cyan-400/50 bg-cyan-500/10"
                              : "border-white/10 bg-white/5 hover:border-white/20",
                          )}
                        >
                          <span className="text-xl">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-scifi-text truncate">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <RarityBadge rarity={item.rarity as Rarity}>
                                {item.rarity === "common" && "普通"}
                                {item.rarity === "rare" && "稀有"}
                                {item.rarity === "epic" && "史诗"}
                                {item.rarity === "legendary" && "传说"}
                              </RarityBadge>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedItem && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-medium text-scifi-muted uppercase tracking-wider mb-2.5">
                            <DollarSign className="w-3.5 h-3.5" />
                            单价 (¥)
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={price}
                            onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                            className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-scifi-text font-mono text-sm focus:outline-none focus:border-cyan-400/50 focus:bg-cyan-500/5 transition-all"
                            placeholder="输入价格"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-medium text-scifi-muted uppercase tracking-wider mb-2.5">
                            <Package className="w-3.5 h-3.5" />
                            数量
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={99}
                            value={quantity}
                            onChange={(e) =>
                              setQuantity(Math.max(1, Math.min(99, Number(e.target.value))))
                            }
                            className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-scifi-text font-mono text-sm focus:outline-none focus:border-cyan-400/50 focus:bg-cyan-500/5 transition-all"
                            placeholder="数量"
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border border-cyan-400/20 bg-cyan-500/5 space-y-3">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">
                            系统定价建议
                          </span>
                        </div>
                        <PriceSuggestionBar
                          minPrice={suggestedMin}
                          maxPrice={suggestedMax}
                          avgPrice={suggestedAvg}
                          currentPrice={price}
                        />
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-green-400">建议最低: ¥{suggestedMin.toLocaleString()}</span>
                          <span className="text-cyan-400">基准价: ¥{suggestedAvg.toLocaleString()}</span>
                          <span className="text-red-400">建议最高: ¥{suggestedMax.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                        <span className="text-sm text-scifi-muted">预计收入</span>
                        <span className="font-display text-lg font-bold text-gradient-cyber">
                          ¥{(price * quantity).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 pt-2">
                    <GlowButton variant="ghost" size="md" className="flex-1" onClick={onClose}>
                      取消
                    </GlowButton>
                    <GlowButton
                      variant="primary"
                      size="md"
                      className="flex-1"
                      onClick={handleSubmit}
                      disabled={!selectedItem || price <= 0 || quantity <= 0}
                    >
                      <Sparkles className="w-4 h-4" />
                      确认上架
                    </GlowButton>
                  </div>
                </div>
              </TechCard>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ListItemModal;
