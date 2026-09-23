export type StoryType = 'fabel' | 'legenda' | 'mite' | 'dongeng';

export interface StoryPin {
  id: string;
  slug: string;
  title: string;
  type: StoryType;
  lat: number;
  lng: number;
  tier: number;
  score: number;
  cover?: string;
  region?: string;
}

export const DUMMY_STORIES: StoryPin[] = [
  { id: '1', slug: 'dev-sangkuriang', title: 'Sangkuriang', type: 'legenda', lat: -6.8, lng: 107.6, tier: 1, score: 100, region: 'Jawa Barat' },
  { id: '2', slug: 'dev-malin-kundang', title: 'Malin Kundang', type: 'legenda', lat: -0.9, lng: 100.3, tier: 1, score: 95, region: 'Sumatera Barat' },
  { id: '3', slug: 'dev-kancil-buaya', title: 'Kancil dan Buaya', type: 'fabel', lat: -7.2, lng: 110.4, tier: 2, score: 80, region: 'Jawa Tengah' },
  { id: '4', slug: 'dev-timun-mas', title: 'Timun Mas', type: 'dongeng', lat: -7.5, lng: 112.7, tier: 1, score: 90, region: 'Jawa Timur' },
  { id: '5', slug: 'dev-nyai-roro-kidul', title: 'Nyai Roro Kidul', type: 'mite', lat: -8.0, lng: 110.3, tier: 1, score: 85, region: 'DI Yogyakarta' },
  { id: '6', slug: 'dev-danau-toba', title: 'Asal Usul Danau Toba', type: 'legenda', lat: 2.6, lng: 98.8, tier: 1, score: 99, region: 'Sumatera Utara' },
  { id: '7', slug: 'dev-bawang-merah-putih', title: 'Bawang Merah Bawang Putih', type: 'dongeng', lat: -6.2, lng: 106.8, tier: 2, score: 85, region: 'DKI Jakarta' }
];
