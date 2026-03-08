import React, { createContext, useContext, useState, useCallback } from 'react';

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  purchase: (plan: 'monthly' | 'annual') => Promise<void>;
  restore: () => Promise<void>;
  setPremium: (v: boolean) => void;
}

const PremiumContext = createContext<PremiumContextType | null>(null);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // In production, this would use RevenueCat
  // For now, a simple local toggle (set via settings or paywall)
  const purchase = useCallback(async (_plan: 'monthly' | 'annual') => {
    setIsLoading(true);
    // Simulate purchase — in production: Purchases.purchasePackage()
    await new Promise(r => setTimeout(r, 800));
    setIsPremium(true);
    setIsLoading(false);
  }, []);

  const restore = useCallback(async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setIsLoading(false);
  }, []);

  return (
    <PremiumContext.Provider value={{ isPremium, isLoading, purchase, restore, setPremium: setIsPremium }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium(): PremiumContextType {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}
