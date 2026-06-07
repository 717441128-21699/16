import { create } from 'zustand';
import type { Hero } from '../data/heroes';
import { sampleHeroes } from '../data/heroes';

interface HeroState {
  currentHero: Hero | null;
  heroList: Hero[];
}

interface HeroActions {
  createHero: (hero: Omit<Hero, 'id'>) => void;
  updateHero: (id: string, updates: Partial<Hero>) => void;
  addExp: (id: string, exp: number) => void;
  takeDamage: (id: string, damage: number) => void;
  recoverEnergy: (id: string, amount: number) => void;
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

export const useHeroStore = create<HeroState & HeroActions>((set) => ({
  currentHero: sampleHeroes[0] ?? null,
  heroList: sampleHeroes,

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
