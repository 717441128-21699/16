import { create } from 'zustand';
import type { Hero } from '../data/heroes';
import { sampleHeroes } from '../data/heroes';
import { api } from '../lib/api';
import { adaptHero, adaptHeroes } from '../lib/adapters';

interface HeroState {
  currentHero: Hero | null;
  heroList: Hero[];
  loading: boolean;
  error: string | null;
}

interface HeroActions {
  fetchHeroes: () => Promise<void>;
  fetchCurrentHero: (id: string) => Promise<void>;
  createHeroAsync: (hero: Omit<Hero, 'id'>) => Promise<void>;
  updateHeroAsync: (id: string, updates: Partial<Hero>) => Promise<void>;
  addExpAsync: (id: string, exp: number) => Promise<void>;
  createHero: (hero: Omit<Hero, 'id'>) => void;
  updateHero: (id: string, updates: Partial<Hero>) => void;
  addExp: (id: string, exp: number) => void;
  takeDamage: (id: string, damage: number) => void;
  recoverEnergy: (id: string, amount: number) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

const levelUp = (hero: Hero): Hero => {
  let { level, exp, maxExp, maxHp, maxEnergy, attack, defense, speed } = hero;
  while (exp >= maxExp) {
    exp -= maxExp;
    level += 1;
    maxExp = Math.floor(maxExp * 1.5);
    maxHp += 100;
    maxEnergy += 10;
    attack += 10;
    defense += 8;
    speed += 5;
  }
  return { ...hero, level, exp, maxExp, maxHp, maxEnergy, attack, defense, speed, hp: maxHp, energy: maxEnergy };
};

export const useHeroStore = create<HeroState & HeroActions>((set, get) => ({
  currentHero: null,
  heroList: [],
  loading: false,
  error: null,

  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),

  fetchHeroes: async () => {
    set({ loading: true, error: null });
    try {
      const heroes = await api.getHeroes();
      const transformedHeroes = adaptHeroes(heroes as any[]);
      const finalHeroes = transformedHeroes.length > 0 ? transformedHeroes : sampleHeroes;
      const currentHero = finalHeroes[0] ?? null;
      set({ heroList: finalHeroes, currentHero, loading: false });
    } catch (error) {
      set({
        heroList: sampleHeroes,
        currentHero: sampleHeroes[0] ?? null,
        error: error instanceof Error ? error.message : '获取英雄列表失败',
        loading: false,
      });
    }
  },

  fetchCurrentHero: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const hero = await api.getHero(id);
      set({
        currentHero: adaptHero(hero),
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取英雄详情失败',
        loading: false,
      });
    }
  },

  createHeroAsync: async (hero) => {
    set({ loading: true, error: null });
    try {
      const newHero = await api.createHero(hero);
      const adapted = adaptHero(newHero);
      set((state) => ({
        heroList: [...state.heroList, adapted],
        currentHero: state.currentHero ?? adapted,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '创建英雄失败',
        loading: false,
      });
    }
  },

  updateHeroAsync: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updatedHero = await api.updateHero(id, updates);
      const adapted = adaptHero(updatedHero);
      set((state) => ({
        heroList: state.heroList.map((h) =>
          h.id === id ? adapted : h
        ),
        currentHero:
          state.currentHero?.id === id
            ? adapted
            : state.currentHero,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '更新英雄失败',
        loading: false,
      });
    }
  },

  addExpAsync: async (id, exp) => {
    set({ loading: true, error: null });
    try {
      const updatedHero = await api.addHeroExp(id, exp);
      const adapted = adaptHero(updatedHero);
      const leveledHero = levelUp(adapted);
      set((state) => ({
        heroList: state.heroList.map((h) =>
          h.id === id ? leveledHero : h
        ),
        currentHero:
          state.currentHero?.id === id ? leveledHero : state.currentHero,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '添加经验失败',
        loading: false,
      });
    }
  },

  createHero: (hero) =>
    set((state) => {
      const newHero: Hero = {
        ...hero,
        id: `hero-${Date.now()}`,
      };
      return {
        heroList: [...state.heroList, newHero],
        currentHero: state.currentHero ?? newHero,
      };
    }),

  updateHero: (id, updates) =>
    set((state) => ({
      heroList: state.heroList.map((h) => (h.id === id ? { ...h, ...updates } : h)),
      currentHero: state.currentHero?.id === id ? { ...state.currentHero, ...updates } : state.currentHero,
    })),

  addExp: (id, exp) =>
    set((state) => ({
      heroList: state.heroList.map((h) => (h.id === id ? levelUp({ ...h, exp: h.exp + exp }) : h)),
      currentHero: state.currentHero?.id === id ? levelUp({ ...state.currentHero, exp: state.currentHero.exp + exp }) : state.currentHero,
    })),

  takeDamage: (id, damage) =>
    set((state) => ({
      heroList: state.heroList.map((h) => (h.id === id ? { ...h, hp: Math.max(0, h.hp - damage) } : h)),
      currentHero: state.currentHero?.id === id ? { ...state.currentHero, hp: Math.max(0, state.currentHero.hp - damage) } : state.currentHero,
    })),

  recoverEnergy: (id, amount) =>
    set((state) => ({
      heroList: state.heroList.map((h) => (h.id === id ? { ...h, energy: Math.min(h.maxEnergy, h.energy + amount) } : h)),
      currentHero: state.currentHero?.id === id ? { ...state.currentHero, energy: Math.min(state.currentHero.maxEnergy, state.currentHero.energy + amount) } : state.currentHero,
    })),
}));
