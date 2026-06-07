import { create } from 'zustand';
import type { BattleState as TypesBattleState } from '../types';
import { api } from '../lib/api';

export interface BattleLog {
  id: string;
  timestamp: number;
  message: string;
  type: 'attack' | 'skill' | 'damage' | 'heal' | 'info' | 'victory' | 'defeat';
}

export interface Combatant {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  attack: number;
  defense: number;
  isPlayer: boolean;
  icon: string;
}

export interface BattleState {
  player: Combatant | null;
  enemy: Combatant | null;
  turn: 'player' | 'enemy';
  logs: BattleLog[];
  isInBattle: boolean;
  round: number;
  result: 'ongoing' | 'victory' | 'defeat' | null;
  loading: boolean;
  error: string | null;
  serverBattleState: TypesBattleState | null;
}

interface BattleActions {
  startBattleAsync: (heroId: string, eventId: string) => Promise<void>;
  useSkillAsync: (battleId: string, skillId: string, targetId: string) => Promise<void>;
  tickBattleAsync: (battleId: string) => Promise<void>;
  endBattleAsync: (battleId: string, result: 'victory' | 'defeat') => Promise<void>;
  startBattle: (player: Combatant, enemy: Combatant) => void;
  useSkill: (skillName: string, damage: number, energyCost: number) => void;
  takeDamage: (target: 'player' | 'enemy', damage: number) => void;
  endBattle: (result: 'victory' | 'defeat') => void;
  addLog: (message: string, type: BattleLog['type']) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useBattleStore = create<BattleState & BattleActions>((set, get) => ({
  player: null,
  enemy: null,
  turn: 'player',
  logs: [],
  isInBattle: false,
  round: 1,
  result: null,
  loading: false,
  error: null,
  serverBattleState: null,

  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),

  startBattleAsync: async (heroId: string, eventId: string) => {
    set({ loading: true, error: null });
    try {
      const battleState = await api.startBattle(heroId, eventId);
      set({ serverBattleState: battleState, loading: false, isInBattle: true, result: null });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '开始战斗失败',
        loading: false,
      });
    }
  },

  useSkillAsync: async (battleId: string, skillId: string, targetId: string) => {
    set({ loading: true, error: null });
    try {
      const battleState = await api.useBattleSkill(battleId, skillId, targetId);
      set({ serverBattleState: battleState, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '使用技能失败',
        loading: false,
      });
    }
  },

  tickBattleAsync: async (battleId: string) => {
    set({ loading: true, error: null });
    try {
      const battleState = await api.battleTick(battleId);
      set({ serverBattleState: battleState, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '战斗推进失败',
        loading: false,
      });
    }
  },

  endBattleAsync: async (battleId: string, result: 'victory' | 'defeat') => {
    set({ loading: true, error: null });
    try {
      const battleState = await api.endBattle(battleId, result);
      set({
        serverBattleState: battleState,
        loading: false,
        isInBattle: false,
        result,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '结束战斗失败',
        loading: false,
      });
    }
  },

  startBattle: (player, enemy) =>
    set({
      player,
      enemy,
      turn: 'player',
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          message: `战斗开始！${player.name} VS ${enemy.name}`,
          type: 'info',
        },
      ],
      isInBattle: true,
      round: 1,
      result: null,
    }),

  useSkill: (skillName, damage, energyCost) => {
    const { player, enemy, turn } = get();
    if (!player || !enemy || turn !== 'player') return;
    if (player.energy < energyCost) {
      get().addLog('能量不足！', 'info');
      return;
    }

    const actualDamage = Math.max(1, damage - Math.floor(enemy.defense / 2));
    const newEnemyHp = Math.max(0, enemy.hp - actualDamage);

    set((state) => ({
      player: { ...state.player!, energy: state.player!.energy - energyCost },
      enemy: { ...state.enemy!, hp: newEnemyHp },
    }));

    get().addLog(`${player.name} 使用 ${skillName}，造成 ${actualDamage} 点伤害！`, 'skill');

    if (newEnemyHp <= 0) {
      get().endBattle('victory');
    } else {
      set((state) => ({ turn: 'enemy' }));
      setTimeout(() => {
        const s = get();
        if (!s.enemy || !s.player || s.result) return;
        const enemyDamage = Math.max(1, s.enemy.attack - Math.floor(s.player.defense / 2));
        get().addLog(`${s.enemy.name} 发动反击，造成 ${enemyDamage} 点伤害！`, 'attack');
        get().takeDamage('player', enemyDamage);
        set((st) => ({ turn: 'player', round: st.round + 1 }));
      }, 800);
    }
  },

  takeDamage: (target, damage) => {
    const state = get();
    if (target === 'player' && state.player) {
      const newHp = Math.max(0, state.player.hp - damage);
      set({ player: { ...state.player, hp: newHp } });
      if (newHp <= 0) {
        get().addLog(`${state.player.name} 倒下了...`, 'damage');
        get().endBattle('defeat');
      }
    } else if (target === 'enemy' && state.enemy) {
      const newHp = Math.max(0, state.enemy.hp - damage);
      set({ enemy: { ...state.enemy, hp: newHp } });
      if (newHp <= 0) {
        get().addLog(`${state.enemy.name} 被击败了！`, 'damage');
        get().endBattle('victory');
      }
    }
  },

  endBattle: (result) => {
    const message = result === 'victory' ? '战斗胜利！' : '战斗失败...';
    const type = result === 'victory' ? 'victory' : 'defeat';
    get().addLog(message, type);
    set({ isInBattle: false, result });
  },

  addLog: (message, type) =>
    set((state) => ({
      logs: [
        ...state.logs,
        {
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: Date.now(),
          message,
          type,
        },
      ],
    })),
}));
