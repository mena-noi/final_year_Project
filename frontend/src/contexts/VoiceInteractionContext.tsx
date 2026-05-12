import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type VoiceInteractionState = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  enable: () => void;
  disable: () => void;
};

const STORAGE_KEY = 'voiceInteractionEnabled';

const VoiceInteractionContext = createContext<VoiceInteractionState | null>(null);

export const VoiceInteractionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled, setEnabledState] = useState<boolean>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return true;
    return raw === 'true';
  });

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }, []);

  const enable = useCallback(() => setEnabled(true), [setEnabled]);
  const disable = useCallback(() => setEnabled(false), [setEnabled]);

  // Keep state in sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setEnabledState(e.newValue === 'true');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(
    () => ({ enabled, setEnabled, enable, disable }),
    [enabled, setEnabled, enable, disable]
  );

  return <VoiceInteractionContext.Provider value={value}>{children}</VoiceInteractionContext.Provider>;
};

export const useVoiceInteraction = () => {
  const ctx = useContext(VoiceInteractionContext);
  if (!ctx) {
    throw new Error('useVoiceInteraction must be used inside VoiceInteractionProvider');
  }
  return ctx;
};

