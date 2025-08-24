import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../lib/api";

// Types for our cached data
export interface UserBundle {
  profile: any;
  children: any[];
  booklets: any[];
  token_accounts: any[];
  recent_activity: any[];
  cache_timestamp: number;
}

interface CacheContextType {
  bundle: UserBundle | null;
  isLoading: boolean;
  error: string | null;

  // Cache operations
  loadInitialData: () => Promise<void>;
  refreshData: () => Promise<void>;
  updateCache: (updates: Partial<UserBundle>) => void;
  clearCache: () => void;

  // Getter helpers
  getUserProfile: () => any;
  getChildren: () => any[];
  getBookletsForChild: (childId: string) => any[];
  getTokenAccount: (childId: string) => any;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

const CACHE_KEY = "user_bundle_cache";
const CACHE_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes

export const CacheProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [bundle, setBundle] = useState<UserBundle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch fresh data from API
  const fetchFreshData = useCallback(async () => {
    try {
      console.log("🌐 Fetching user bundle from API...");
      const response = await api.getUserBundle();

      const bundleData: UserBundle = {
        ...response.data,
        cache_timestamp: Date.now(),
      };

      setBundle(bundleData);
      await saveToStorage(bundleData);
      console.log("✅ Fresh data loaded and cached");
    } catch (err) {
      console.error("❌ Error fetching fresh data:", err);
      throw err;
    }
  }, []);

  // Load initial data (from cache or API)
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔄 Loading initial cache data...");

      // First, try to load from AsyncStorage
      const cachedData = await loadFromStorage();

      if (cachedData && !isCacheExpired(cachedData.cache_timestamp)) {
        console.log("✅ Using cached data");
        setBundle(cachedData);
        setIsLoading(false);
        return;
      }

      console.log("🌐 Cache expired or empty, fetching fresh data...");
      await fetchFreshData();
    } catch (err) {
      console.error("❌ Error loading initial data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [fetchFreshData]);

  // Refresh data (force fetch from API)
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await fetchFreshData();
    } catch (err) {
      console.error("❌ Error refreshing data:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  }, [fetchFreshData]);

  // Update cache with new data
  const updateCache = useCallback(
    (updates: Partial<UserBundle>) => {
      if (!bundle) return;

      const updatedBundle = {
        ...bundle,
        ...updates,
        cache_timestamp: Date.now(),
      };

      setBundle(updatedBundle);
      saveToStorage(updatedBundle).catch((err) =>
        console.error("❌ Error saving cache update:", err)
      );

      console.log("✅ Cache updated:", Object.keys(updates));
    },
    [bundle]
  );

  // Clear all cached data
  const clearCache = useCallback(() => {
    setBundle(null);
    AsyncStorage.removeItem(CACHE_KEY).catch((err: any) =>
      console.error("❌ Error clearing cache:", err)
    );
    console.log("🗑️ Cache cleared");
  }, []);

  // Helper: Load from AsyncStorage
  const loadFromStorage = async (): Promise<UserBundle | null> => {
    try {
      const stored = await AsyncStorage.getItem(CACHE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error("❌ Error loading from storage:", err);
      return null;
    }
  };

  // Helper: Save to AsyncStorage
  const saveToStorage = async (data: UserBundle) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("❌ Error saving to storage:", err);
    }
  };

  // Helper: Check if cache is expired
  const isCacheExpired = (timestamp: number): boolean => {
    return Date.now() - timestamp > CACHE_EXPIRY_TIME;
  };

  // Getter helpers
  const getUserProfile = useCallback(() => bundle?.profile || null, [bundle]);
  const getChildren = useCallback(() => bundle?.children || [], [bundle]);
  const getBookletsForChild = useCallback(
    (childId: string) =>
      bundle?.booklets?.filter((booklet) => booklet.child_id === childId) || [],
    [bundle]
  );
  const getTokenAccount = useCallback(
    (childId: string) =>
      bundle?.token_accounts?.find((account) => account.child_id === childId) ||
      null,
    [bundle]
  );

  const value: CacheContextType = {
    bundle,
    isLoading,
    error,
    loadInitialData,
    refreshData,
    updateCache,
    clearCache,
    getUserProfile,
    getChildren,
    getBookletsForChild,
    getTokenAccount,
  };

  return (
    <CacheContext.Provider value={value}>{children}</CacheContext.Provider>
  );
};

// Hook to use cache
export const useCache = (): CacheContextType => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error("useCache must be used within a CacheProvider");
  }
  return context;
};
