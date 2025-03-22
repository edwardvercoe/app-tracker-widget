import React, { useState } from "react";
import "../styles/Settings.css";

const Settings: React.FC = () => {
  const [supabaseUrl, setSupabaseUrl] = useState<string>("");
  const [supabaseKey, setSupabaseKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const success = await window.api.setSupabaseCredentials(
        supabaseUrl,
        supabaseKey
      );

      if (!success) {
        setError(
          "Failed to connect to Supabase. Please check your credentials."
        );
      }
      // On success, the main process will switch to widget mode
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-container bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg p-6 text-white">
      <h1 className="text-xl font-semibold mb-6">Supabase Configuration</h1>

      <form onSubmit={handleSubmit} className="flex flex-col">
        {error && (
          <div className="bg-red-800/50 border border-red-700 text-white px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Supabase Project URL
          </label>
          <input
            type="text"
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            placeholder="https://your-project.supabase.co"
            className="w-full bg-gray-700 rounded px-3 py-2 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Supabase API Key
          </label>
          <input
            type="password"
            value={supabaseKey}
            onChange={(e) => setSupabaseKey(e.target.value)}
            placeholder="Service role key (not anon key)"
            className="w-full bg-gray-700 rounded px-3 py-2 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Use the Service Role key for proper database access.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isLoading ? "Connecting..." : "Connect"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
