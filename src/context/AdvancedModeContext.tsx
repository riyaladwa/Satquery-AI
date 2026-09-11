import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdvancedModeContextType {
  advancedMode: boolean;
  setAdvancedMode: (val: boolean) => void;
  toggleAdvancedMode: () => void;
}

const AdvancedModeContext = createContext<AdvancedModeContextType>({
  advancedMode: false,
  setAdvancedMode: () => {},
  toggleAdvancedMode: () => {},
});

export const AdvancedModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [advancedMode, setAdvancedModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('satquery_advanced_mode');
    return saved ? JSON.parse(saved) : false;
  });

  const setAdvancedMode = (val: boolean) => {
    setAdvancedModeState(val);
    localStorage.setItem('satquery_advanced_mode', JSON.stringify(val));
  };

  const toggleAdvancedMode = () => {
    setAdvancedModeState((prev) => {
      const next = !prev;
      localStorage.setItem('satquery_advanced_mode', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AdvancedModeContext.Provider value={{ advancedMode, setAdvancedMode, toggleAdvancedMode }}>
      {children}
    </AdvancedModeContext.Provider>
  );
};

export const useAdvancedMode = () => useContext(AdvancedModeContext);
