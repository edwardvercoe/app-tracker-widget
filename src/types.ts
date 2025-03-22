export interface UserStats {
  totalUsers: number;
  dailySignups: number;
  lastUpdated: string;
}

export interface UserStats {
  totalUsers: number;
  dailySignups: number;
  lastUpdated: string;
}

// Extend Window interface to include our API
declare global {
  interface Window {
    api: {
      getLastStats: () => Promise<UserStats | null>;
      refreshStats: () => Promise<void>;
      setSupabaseCredentials: (url: string, key: string) => Promise<boolean>;
      onStatsUpdated: (callback: (data: UserStats) => void) => () => void;
    };
  }
}
