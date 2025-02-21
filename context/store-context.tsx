"use client";

import { createContext, useState } from "react";
import { stores } from "@/data/stores";

export const StoreContext = createContext({
  currentStore: stores[0],
  setCurrentStore: (store: typeof stores[0]) => {},
  addStore: (store: typeof stores[0]) => {}
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentStore, setCurrentStore] = useState(stores[0]);
  const [allStores, setAllStores] = useState(stores);

  const addStore = (newStore: typeof stores[0]) => {
    setAllStores([...allStores, newStore]);
    setCurrentStore(newStore);
  };

  return (
    <StoreContext.Provider value={{ 
      currentStore, 
      setCurrentStore,
      addStore 
    }}>
      {children}
    </StoreContext.Provider>
  );
} 