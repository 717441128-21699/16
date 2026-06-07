import { create } from 'zustand';
import type { District, CityEvent } from '../data/city';
import { districts as defaultDistricts, cityEvents } from '../data/city';
import { api } from '../lib/api';
import { adaptDistricts, adaptCityEvents, adaptCityEvent } from '../lib/adapters';

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
  loading: boolean;
  error: string | null;
}

interface CityActions {
  fetchDistricts: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchAnnouncements: () => Promise<void>;
  triggerEventAsync: () => Promise<void>;
  triggerRandomEvent: () => ActiveCityEvent | null;
  updateDistrictStats: (districtId: string, stats: Partial<Pick<District, 'crimeRate' | 'satisfaction' | 'activity'>>) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'timestamp'>) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useCityStore = create<CityState & CityActions>((set, get) => ({
  districts: [],
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
  loading: false,
  error: null,

  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),

  fetchDistricts: async () => {
    set({ loading: true, error: null });
    try {
      const districts = await api.getDistricts();
      const adapted = adaptDistricts(districts as any[]);
      const districtList = adapted.length > 0 ? adapted : defaultDistricts;
      set({ districts: districtList, loading: false });
    } catch (error) {
      set({
        districts: defaultDistricts,
        error: error instanceof Error ? error.message : '获取区域列表失败',
        loading: false,
      });
    }
  },

  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const events = await api.getEvents();
      const adapted = adaptCityEvents(events as any[]);
      const eventList = adapted.length > 0 ? adapted : cityEvents;
      const activeEvents: ActiveCityEvent[] = eventList.map((e) => ({
        ...e,
        instanceId: e.id,
        triggeredAt: Date.now(),
        districtId: '',
      }));
      set({ activeEvents, loading: false });
    } catch (error) {
      set({
        activeEvents: cityEvents.map((e) => ({
          ...e,
          instanceId: e.id,
          triggeredAt: Date.now(),
          districtId: '',
        })),
        error: error instanceof Error ? error.message : '获取事件列表失败',
        loading: false,
      });
    }
  },

  fetchAnnouncements: async () => {
    set({ loading: true, error: null });
    const defaultAnnouncements: Announcement[] = [
      {
        id: 'ann-1',
        title: '系统公告',
        content: '【系统公告】新英雄「雷霆之翼」已上线，快来体验吧！',
        timestamp: Date.now() - 86400000,
        type: 'info',
      },
      {
        id: 'ann-2',
        title: '活动通知',
        content: '【活动通知】周末双倍经验活动开启，持续至周日24:00',
        timestamp: Date.now() - 43200000,
        type: 'success',
      },
      {
        id: 'ann-3',
        title: '紧急警报',
        content: '【紧急警报】东区出现异常能量波动，请英雄们前往支援',
        timestamp: Date.now() - 21600000,
        type: 'danger',
      },
      {
        id: 'ann-4',
        title: '市场动态',
        content: '【市场动态】传说品质装备「永恒战甲」已上架交易市场',
        timestamp: Date.now() - 10800000,
        type: 'warning',
      },
    ];
    try {
      set({ announcements: defaultAnnouncements, loading: false });
    } catch (error) {
      set({
        announcements: defaultAnnouncements,
        error: error instanceof Error ? error.message : '获取公告失败',
        loading: false,
      });
    }
  },

  triggerEventAsync: async () => {
    set({ loading: true, error: null });
    try {
      const event = await api.triggerRandomEvent();
      const adapted = adaptCityEvent(event);
      const districts = get().districts;
      const district = districts.length > 0
        ? districts[Math.floor(Math.random() * districts.length)]
        : null;

      const activeEvent: ActiveCityEvent = {
        ...adapted,
        instanceId: `event-${Date.now()}`,
        triggeredAt: Date.now(),
        districtId: district?.id ?? '',
      };

      set((state) => ({
        activeEvents: [...state.activeEvents, activeEvent],
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '触发随机事件失败',
        loading: false,
      });
    }
  },

  triggerRandomEvent: () => {
    const event = cityEvents[Math.floor(Math.random() * cityEvents.length)];
    const districts = get().districts;
    const district = districts.length > 0
      ? districts[Math.floor(Math.random() * districts.length)]
      : null;

    if (!district && districts.length === 0) return null;

    const activeEvent: ActiveCityEvent = {
      ...event,
      instanceId: `event-${Date.now()}`,
      triggeredAt: Date.now(),
      districtId: district?.id ?? '',
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
