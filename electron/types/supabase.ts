export interface SupabaseConfig {
  url: string;
  key: string;
}

export interface UserStats {
  totalUsers: number;
  dailySignups: number;
  lastUpdated: string;
}
