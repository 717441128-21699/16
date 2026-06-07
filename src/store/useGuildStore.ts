import { create } from 'zustand';
import type { Guild, GuildRank, DistrictWar } from '../data/guild';
import { api } from '../lib/api';
import { adaptGuild, adaptGuilds, adaptDistrictWar, adaptDistrictWars } from '../lib/adapters';

interface GuildState {
  currentGuild: Guild | null;
  wars: DistrictWar[];
  loading: boolean;
  error: string | null;
}

interface GuildActions {
  fetchGuilds: () => Promise<Guild[]>;
  fetchGuildAsync: (id: string) => Promise<void>;
  promoteMemberAsync: (guildId: string, heroId: string, role: GuildRank) => Promise<void>;
  upgradeBuildingAsync: (guildId: string, buildingId: string) => Promise<void>;
  declareWarAsync: (data: Record<string, unknown>) => Promise<void>;
  fetchWarsAsync: () => Promise<void>;
  upgradeBuilding: (buildingId: string) => void;
  promoteMember: (memberId: string, newRank: GuildRank) => void;
  declareWar: (districtId: string, districtName: string, defenderGuildId: string, defenderGuildName: string) => void;
  endWar: (warId: string, winner: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

const rankOrder: GuildRank[] = ['recruit', 'member', 'officer', 'leader'];

export const useGuildStore = create<GuildState & GuildActions>((set, get) => ({
  currentGuild: null,
  wars: [],
  loading: false,
  error: null,

  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),

  fetchGuilds: async () => {
    set({ loading: true, error: null });
    try {
      const guilds = await api.getGuilds();
      const adapted = adaptGuilds(guilds as any[]);
      set({ loading: false });
      return adapted;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取公会列表失败',
        loading: false,
      });
      return [];
    }
  },

  fetchGuildAsync: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const guild = await api.getGuild(id);
      set({ currentGuild: adaptGuild(guild), loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取公会详情失败',
        loading: false,
      });
    }
  },

  promoteMemberAsync: async (guildId: string, heroId: string, role: GuildRank) => {
    set({ loading: true, error: null });
    try {
      const updatedGuild = await api.promoteMember(guildId, heroId, role);
      set((state) => ({
        currentGuild:
          state.currentGuild?.id === guildId
            ? adaptGuild(updatedGuild)
            : state.currentGuild,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '晋升成员失败',
        loading: false,
      });
    }
  },

  upgradeBuildingAsync: async (guildId: string, buildingId: string) => {
    set({ loading: true, error: null });
    try {
      const updatedGuild = await api.upgradeBuilding(guildId, buildingId);
      set((state) => ({
        currentGuild:
          state.currentGuild?.id === guildId
            ? adaptGuild(updatedGuild)
            : state.currentGuild,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '升级建筑失败',
        loading: false,
      });
    }
  },

  declareWarAsync: async (data: Record<string, unknown>) => {
    set({ loading: true, error: null });
    try {
      const newWar = await api.declareWar(data);
      const adapted = adaptDistrictWar(newWar);
      set((state) => ({
        wars: [...state.wars, adapted],
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '宣战失败',
        loading: false,
      });
    }
  },

  fetchWarsAsync: async () => {
    set({ loading: true, error: null });
    try {
      const wars = await api.getWars();
      const adapted = adaptDistrictWars(wars as any[]);
      set({ wars: adapted, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取战争列表失败',
        loading: false,
      });
    }
  },

  upgradeBuilding: (buildingId) =>
    set((state) => {
      if (!state.currentGuild) return state;
      const building = state.currentGuild.buildings.find((b) => b.id === buildingId);
      if (!building || building.level >= building.maxLevel) return state;
      if (state.currentGuild.treasury < building.upgradeCost) return state;

      return {
        currentGuild: {
          ...state.currentGuild,
          treasury: state.currentGuild.treasury - building.upgradeCost,
          buildings: state.currentGuild.buildings.map((b) =>
            b.id === buildingId
              ? {
                  ...b,
                  level: b.level + 1,
                  upgradeCost: Math.floor(b.upgradeCost * 1.8),
                }
              : b
          ),
        },
      };
    }),

  promoteMember: (memberId, newRank) =>
    set((state) => {
      if (!state.currentGuild) return state;
      const member = state.currentGuild.members.find((m) => m.id === memberId);
      if (!member) return state;

      const currentRankIdx = rankOrder.indexOf(member.rank);
      const newRankIdx = rankOrder.indexOf(newRank);
      if (newRankIdx <= currentRankIdx || newRank === 'leader') return state;

      return {
        currentGuild: {
          ...state.currentGuild,
          members: state.currentGuild.members.map((m) =>
            m.id === memberId ? { ...m, rank: newRank } : m
          ),
        },
      };
    }),

  declareWar: (districtId, districtName, defenderGuildId, defenderGuildName) => {
    const { currentGuild } = get();
    if (!currentGuild) return;

    const attackerPower = currentGuild.members.reduce((sum, m) => sum + m.power, 0);
    const defenderPower = Math.round(attackerPower * (0.8 + Math.random() * 0.5));

    const war: DistrictWar = {
      id: `war-${Date.now()}`,
      districtId,
      districtName,
      attackerGuildId: currentGuild.id,
      attackerGuildName: currentGuild.name,
      defenderGuildId,
      defenderGuildName,
      attackerPower,
      defenderPower,
      startTime: Date.now(),
      endTime: Date.now() + 3 * 60 * 60 * 1000,
      attackerScore: 0,
      defenderScore: 0,
      status: 'preparing',
    };

    set((state) => ({
      wars: [...state.wars, war],
    }));
  },

  endWar: (warId, winner) =>
    set((state) => ({
      wars: state.wars.map((w) =>
        w.id === warId
          ? {
              ...w,
              status: 'ended',
              winner,
              endTime: Date.now(),
            }
          : w
      ),
      currentGuild:
        state.currentGuild && winner === state.currentGuild.id
          ? {
              ...state.currentGuild,
              controlledDistricts: [
                ...state.currentGuild.controlledDistricts,
                state.wars.find((w) => w.id === warId)?.districtId ?? '',
              ].filter(Boolean),
            }
          : state.currentGuild,
    })),
}));
