import { create } from 'zustand';
import type { Guild, GuildRank, DistrictWar } from '../data/guild';
import { sampleGuilds, sampleWar } from '../data/guild';

interface GuildState {
  currentGuild: Guild | null;
  wars: DistrictWar[];
}

interface GuildActions {
  upgradeBuilding: (buildingId: string) => void;
  promoteMember: (memberId: string, newRank: GuildRank) => void;
  declareWar: (districtId: string, districtName: string, defenderGuildId: string, defenderGuildName: string) => void;
  endWar: (warId: string, winner: string) => void;
}

const rankOrder: GuildRank[] = ['recruit', 'member', 'officer', 'leader'];

export const useGuildStore = create<GuildState & GuildActions>((set, get) => ({
  currentGuild: sampleGuilds[0] ?? null,
  wars: [sampleWar],

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
