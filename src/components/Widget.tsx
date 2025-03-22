import React, { useState, useEffect } from "react";
import { UserStats } from "../types";
import "@/styles/Widget.css";

const Widget: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    // Get initial stats
    const fetchInitialStats = async () => {
      const lastStats = await window.api.getLastStats();
      if (lastStats) {
        setStats(lastStats);
      }
    };

    fetchInitialStats();

    // Set up event listener for stats updates
    const unsubscribe = window.api.onStatsUpdated((newStats: UserStats) => {
      setStats(newStats);
    });

    return () => {
      // Clean up event listener
      unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await window.api.refreshStats();
    } catch (error) {
      console.error("Failed to refresh stats:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="widget-container bg-gradient-to-t from-[#302726] to-[#2a2a2a]  rounded-xl shadow-lg">
      <div className="p-2 drag-region flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 no-drag ${
            isRefreshing ? "spinning" : ""
          }`}
          title="Refresh Data"
        >
          ↻
        </button>
      </div>

      <div className="p-3 flex flex-col justify-center items-center">
        {/* Total users */}
        <div className="mb-4 text-center">
          <h2 className="text-sm font-medium text-white opacity-80 m-0 mb-1">
            Total Users
          </h2>
          <div className="text-3xl font-bold text-white">
            {stats?.totalUsers !== undefined
              ? stats.totalUsers.toLocaleString()
              : "--"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Widget;
