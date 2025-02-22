"use client";

import { createContext, useState } from "react";

export const StoreContext = createContext({
  currentStore: null as any,
  setCurrentStore: (store: any) => {},
  addStore: (store: any) => {}
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentStore, setCurrentStore] = useState<any>(null);
  
  const addStore = (store: any) => {
    setCurrentStore(store);
  };

  return (
    <StoreContext.Provider value={{ currentStore, setCurrentStore, addStore }}>
      {children}
    </StoreContext.Provider>
  );
} 