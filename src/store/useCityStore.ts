import { create } from 'zustand';
import type { District, CityEvent } from '../data/city';
import { districts, cityEvents } from '../data/city';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  type: 'info' | 'warning' | 'success' | 'danger';
}

interface ActiveCityEvent extends CityEvent {
  instanceId: string;
  triggeredAt: number;
  districtId: string;
}

interface CityState {
  districts: District[];
  activeEvents: ActiveCityEvent[];
  announcements: Announcement[];
}

interface CityActions {
  triggerRandomEvent: () => ActiveCityEvent | null;
  updateDistrictStats: (districtId: string, stats: Partial<Pick<District, 'crimeRate' | 'satisfaction' | 'activity'>>) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'timestamp'>) => void;
}

export const useCityStore = create<CityState & CityActions>((set) => ({
  districts,
  activeEvents: [],
  announcements: [
    {
      id: 'ann-1',
      title: '欢迎来到星城',
      content: '各位英雄，感谢你们守护这座城市！',
      timestamp: Date.now() - 86400000,
      type: 'info',
    },
  ],

  triggerRandomEvent: () => {
    const event = cityEvents[Math.floor(Math.random() * cityEvents.length)];
    const district = districts[Math.floor(Math.random() * districts.length)];
    const activeEvent: ActiveCityEvent = {
      ...event,
      instanceId: `event-${Date.now()}`,
      triggeredAt: Date.now(),
      districtId: district.id,
    };
    set((state) => ({
      activeEvents: [...state.activeEvents, activeEvent],
    }));
    return activeEvent;
  },

  updateDistrictStats: (districtId, stats) =>
    set((state) => ({
      districts: state.districts.map((d) =>
        d.id === districtId
          ? {
              ...d,
              crimeRate: Math.min(100, Math.max(0, stats.crimeRate ?? d.crimeRate)),
              satisfaction: Math.min(100, Math.max(0, stats.satisfaction ?? d.satisfaction)),
              activity: Math.min(100, Math.max(0, stats.activity ?? d.activity)),
            }
          : d
      ),
    })),

  addAnnouncement: (announcement) =>
    set((state) => ({
      announcements: [
        {
          ...announcement,
          id: `ann-${Date.now()}`,
          timestamp: Date.now(),
        },
        ...state.announcements,
      ].slice(0, 50),
    })),
}));
