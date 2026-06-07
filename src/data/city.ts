export interface District {
  id: string;
  name: string;
  type: 'financial' | 'industrial' | 'residential';
  population: number;
  crimeRate: number;
  satisfaction: number;
  activity: number;
  description: string;
  icon: string;
  controlledBy?: string;
}

export interface CityEvent {
  id: string;
  name: string;
  type: 'robbery' | 'alien-invasion' | 'fire' | 'gang-war' | 'hostage' | 'disaster';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reward: {
    exp: number;
    gold: number;
    reputation: number;
  };
  duration: number;
  icon: string;
}

export interface DailyStats {
  date: string;
  crimeRate: number;
  satisfaction: number;
  activity: number;
}

export const districts: District[] = [
  {
    id: 'financial-district',
    name: '金融区',
    type: 'financial',
    population: 120000,
    crimeRate: 35,
    satisfaction: 72,
    activity: 85,
    description: '城市的经济中心，高楼林立，银行与企业总部云集',
    icon: '🏙️',
  },
  {
    id: 'industrial-district',
    name: '工业区',
    type: 'industrial',
    population: 80000,
    crimeRate: 58,
    satisfaction: 55,
    activity: 65,
    description: '工厂与仓库聚集的区域，治安状况较差',
    icon: '🏭',
  },
  {
    id: 'residential-district',
    name: '住宅区',
    type: 'residential',
    population: 250000,
    crimeRate: 22,
    satisfaction: 80,
    activity: 60,
    description: '市民生活的主要区域，环境优美，配套设施完善',
    icon: '🏘️',
  },
];

export const cityEvents: CityEvent[] = [
  {
    id: 'bank-robbery',
    name: '银行劫案',
    type: 'robbery',
    severity: 'medium',
    description: '一伙武装歹徒正在抢劫金融区的中央银行',
    reward: { exp: 500, gold: 2000, reputation: 50 },
    duration: 600,
    icon: '💰',
  },
  {
    id: 'alien-invasion',
    name: '外星入侵',
    type: 'alien-invasion',
    severity: 'critical',
    description: '不明外星生物在工业区降落，正在攻击市民',
    reward: { exp: 2000, gold: 8000, reputation: 200 },
    duration: 1800,
    icon: '👽',
  },
  {
    id: 'warehouse-fire',
    name: '仓库火灾',
    type: 'fire',
    severity: 'high',
    description: '工业区大型仓库发生火灾，火势正在蔓延',
    reward: { exp: 800, gold: 3000, reputation: 80 },
    duration: 900,
    icon: '🔥',
  },
  {
    id: 'gang-warfare',
    name: '帮派火拼',
    type: 'gang-war',
    severity: 'high',
    description: '两大黑帮在工业区交界地带展开激烈交火',
    reward: { exp: 1000, gold: 4000, reputation: 100 },
    duration: 1200,
    icon: '🔫',
  },
  {
    id: 'hostage-situation',
    name: '人质事件',
    type: 'hostage',
    severity: 'critical',
    description: '恐怖分子在住宅区购物中心劫持了多名人质',
    reward: { exp: 1500, gold: 6000, reputation: 150 },
    duration: 1500,
    icon: '🆘',
  },
  {
    id: 'earthquake',
    name: '地震灾害',
    type: 'disaster',
    severity: 'medium',
    description: '城市发生里氏5.8级地震，多处建筑受损',
    reward: { exp: 600, gold: 2500, reputation: 60 },
    duration: 720,
    icon: '🌋',
  },
];

export const historicalStats: DailyStats[] = [
  { date: '06-01', crimeRate: 42, satisfaction: 68, activity: 72 },
  { date: '06-02', crimeRate: 38, satisfaction: 71, activity: 75 },
  { date: '06-03', crimeRate: 45, satisfaction: 65, activity: 68 },
  { date: '06-04', crimeRate: 35, satisfaction: 74, activity: 80 },
  { date: '06-05', crimeRate: 40, satisfaction: 70, activity: 77 },
  { date: '06-06', crimeRate: 33, satisfaction: 76, activity: 82 },
  { date: '06-07', crimeRate: 38, satisfaction: 72, activity: 78 },
];
