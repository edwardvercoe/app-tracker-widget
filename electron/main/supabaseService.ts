import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Store from "electron-store";

interface StoreData {
  supabaseUrl?: string;
  supabaseKey?: string;
  [key: string]: any;
}

export interface UserStats {
  totalUsers: number;
  dailySignups: number;
  lastUpdated: string;
}

class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private store: Store<StoreData>;

  constructor() {
    // Use electron-store to securely store credentials
    this.store = new Store<StoreData>({
      name: "credentials",
      encryptionKey: "your-encryption-key", // In production, generate this dynamically
    });

    // Try to initialize with stored credentials
    const url = this.store.get("supabaseUrl");
    const key = this.store.get("supabaseKey");

    if (url && key) {
      this.initialize(url, key);
    }
  }

  public initialize(url: string, key: string): boolean {
    try {
      this.supabase = createClient(url, key);
      this.store.set("supabaseUrl", url);
      this.store.set("supabaseKey", key);
      return true;
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error);
      return false;
    }
  }

  public isAuthenticated(): boolean {
    return this.supabase !== null;
  }

  public async getUserStats(): Promise<UserStats> {
    if (!this.supabase) {
      throw new Error("Supabase client not initialized");
    }

    try {
      // Get total users count
      const { count: totalUsers, error: countError } = await this.supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;

      // Get daily signups (users created today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: dailySignups, error: dailyError } = await this.supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      if (dailyError) throw dailyError;

      return {
        totalUsers: totalUsers || 0,
        dailySignups: dailySignups || 0,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return {
        totalUsers: 0,
        dailySignups: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
  }
}

export default SupabaseService;
