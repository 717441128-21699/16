import type {
  Hero,
  SuperPower,
  Suit,
  Weapon,
  CityDistrict,
  CityEvent,
  BattleState,
  MarketItem,
  PriceHistory,
  RankingEntry,
  Guild,
  DistrictWar,
  WeeklyReport,
} from '../types';

import type {
  Hero as DataHero,
  SuperPower as DataSuperPower,
  Suit as DataSuit,
  Weapon as DataWeapon,
} from '../data/heroes';

import type {
  District,
  CityEvent as DataCityEvent,
} from '../data/city';

import type {
  MarketItem as DataMarketItem,
  ItemPriceHistory,
} from '../data/market';

import type {
  Guild as DataGuild,
  DistrictWar as DataDistrictWar,
} from '../data/guild';

const API_BASE = 'http://localhost:3001/api';

class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options?.headers ?? {}),
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      throw new ApiError(
        `请求失败: ${response.status} ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const json = await response.json();
      if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
        return json.data as T;
      }
      return json as T;
    }
    return (await response.blob()) as unknown as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败',
      0
    );
  }
}

export const api = {
  getHeroes: (): Promise<Hero[] | DataHero[]> =>
    request<Hero[] | DataHero[]>('/heroes'),

  getHero: (id: string): Promise<Hero | DataHero> =>
    request<Hero | DataHero>(`/heroes/${id}`),

  createHero: (data: Omit<Hero, 'id'> | Omit<DataHero, 'id'>): Promise<Hero | DataHero> =>
    request<Hero | DataHero>('/heroes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateHero: (id: string, data: Partial<Hero> | Partial<DataHero>): Promise<Hero | DataHero> =>
    request<Hero | DataHero>(`/heroes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  addHeroExp: (id: string, amount: number): Promise<Hero | DataHero> =>
    request<Hero | DataHero>(`/heroes/${id}/exp`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  getPowers: (): Promise<SuperPower[] | DataSuperPower[]> =>
    request<SuperPower[] | DataSuperPower[]>('/powers'),

  getSuits: (): Promise<Suit[] | DataSuit[]> =>
    request<Suit[] | DataSuit[]>('/suits'),

  getWeapons: (): Promise<Weapon[] | DataWeapon[]> =>
    request<Weapon[] | DataWeapon[]>('/weapons'),

  getDistricts: (): Promise<CityDistrict[] | District[]> =>
    request<CityDistrict[] | District[]>('/districts'),

  triggerRandomEvent: (): Promise<CityEvent | DataCityEvent> =>
    request<CityEvent | DataCityEvent>('/events/random', {
      method: 'POST',
    }),

  getEvents: (): Promise<CityEvent[] | DataCityEvent[]> =>
    request<CityEvent[] | DataCityEvent[]>('/events'),

  joinEvent: (eventId: string, heroId: string): Promise<CityEvent | DataCityEvent> =>
    request<CityEvent | DataCityEvent>(`/events/${eventId}/join`, {
      method: 'POST',
      body: JSON.stringify({ heroId }),
    }),

  startBattle: (heroId: string, eventId: string): Promise<BattleState> =>
    request<BattleState>('/battles', {
      method: 'POST',
      body: JSON.stringify({ heroId, eventId }),
    }),

  getBattle: (battleId: string): Promise<BattleState> =>
    request<BattleState>(`/battles/${battleId}`),

  useBattleSkill: (battleId: string, skillId: string, targetId: string): Promise<BattleState> =>
    request<BattleState>(`/battles/${battleId}/skill`, {
      method: 'POST',
      body: JSON.stringify({ skillId, targetId }),
    }),

  battleAttack: (battleId: string, targetId: string): Promise<BattleState> =>
    request<BattleState>(`/battles/${battleId}/attack`, {
      method: 'POST',
      body: JSON.stringify({ targetId }),
    }),

  battleTick: (battleId: string): Promise<BattleState> =>
    request<BattleState>(`/battles/${battleId}/tick`, {
      method: 'POST',
    }),

  endBattle: (battleId: string, result: 'victory' | 'defeat'): Promise<BattleState> =>
    request<BattleState>(`/battles/${battleId}/end`, {
      method: 'POST',
      body: JSON.stringify({ result }),
    }),

  getMarketItems: (itemType?: string): Promise<MarketItem[] | DataMarketItem[]> => {
    const path = itemType ? `/market/items?itemType=${encodeURIComponent(itemType)}` : '/market/items';
    return request<MarketItem[] | DataMarketItem[]>(path);
  },

  listMarketItem: (data: Partial<MarketItem> | Partial<DataMarketItem>): Promise<MarketItem | DataMarketItem> =>
    request<MarketItem | DataMarketItem>('/market/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  buyMarketItem: (itemId: string, buyerId: string): Promise<any> =>
    request<any>(`/market/items/${itemId}/buy`, {
      method: 'POST',
      body: JSON.stringify({ buyerId }),
    }),

  cancelMarketItem: (itemId: string): Promise<any> =>
    request<any>(`/market/items/${itemId}`, {
      method: 'DELETE',
    }),

  getMyOrders: (heroId: string): Promise<MarketItem[] | DataMarketItem[]> =>
    request<MarketItem[] | DataMarketItem[]>(`/market/orders/${heroId}`),

  getPriceHistory: (itemType: string): Promise<PriceHistory | ItemPriceHistory> =>
    request<PriceHistory | ItemPriceHistory>(`/market/price-history/${encodeURIComponent(itemType)}`),

  getMarketAnnouncements: (): Promise<any[]> =>
    request<any[]>('/market/announcements'),

  getRankings: (type: 'power' | 'mission' | 'contribution'): Promise<RankingEntry[]> =>
    request<RankingEntry[]>(`/rankings/${type}`),

  getGuilds: (): Promise<Guild[] | DataGuild[]> =>
    request<Guild[] | DataGuild[]>('/guilds'),

  getGuild: (id: string): Promise<Guild | DataGuild> =>
    request<Guild | DataGuild>(`/guilds/${id}`),

  createGuild: (data: Record<string, unknown>): Promise<Guild | DataGuild> =>
    request<Guild | DataGuild>('/guilds', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getGuildBuildings: (): Promise<any[]> =>
    request<any[]>('/guilds/buildings/list'),

  promoteMember: (guildId: string, heroId: string, role: string): Promise<Guild | DataGuild> =>
    request<Guild | DataGuild>(`/guilds/${guildId}/members/${heroId}/promote`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  upgradeBuilding: (guildId: string, buildingId: string): Promise<Guild | DataGuild> =>
    request<Guild | DataGuild>(`/guilds/${guildId}/buildings/${buildingId}/upgrade`, {
      method: 'POST',
    }),

  declareWar: (data: Record<string, unknown>): Promise<DistrictWar | DataDistrictWar> =>
    request<DistrictWar | DataDistrictWar>('/guilds/wars', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getWars: (): Promise<DistrictWar[] | DataDistrictWar[]> =>
    request<DistrictWar[] | DataDistrictWar[]>('/guilds/wars/list'),

  getWar: (id: string): Promise<DistrictWar | DataDistrictWar> =>
    request<DistrictWar | DataDistrictWar>(`/guilds/wars/${id}`),

  tickWar: (warId: string): Promise<DistrictWar | DataDistrictWar> =>
    request<DistrictWar | DataDistrictWar>(`/guilds/wars/${warId}/tick`, {
      method: 'POST',
    }),

  endWar: (warId: string): Promise<DistrictWar | DataDistrictWar> =>
    request<DistrictWar | DataDistrictWar>(`/guilds/wars/${warId}/end`, {
      method: 'POST',
    }),

  getWeeklyReport: (): Promise<WeeklyReport> =>
    request<WeeklyReport>('/reports/weekly'),

  getWeeklyReportPdf: (): Promise<Blob> =>
    request<Blob>('/reports/weekly/pdf', {
      headers: {
        Accept: 'application/pdf',
      },
    }),
};

export { ApiError, API_BASE };
