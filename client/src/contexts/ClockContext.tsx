import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// Available font options
export const FONT_OPTIONS = [
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
  { label: 'Roboto Mono', value: "'Roboto Mono', monospace" },
  { label: 'Fira Code', value: "'Fira Code', monospace" },
  { label: 'Source Code Pro', value: "'Source Code Pro', monospace" },
  { label: 'IBM Plex Mono', value: "'IBM Plex Mono', monospace" },
  { label: 'Courier Prime', value: "'Courier Prime', monospace" },
  { label: 'Orbitron', value: "'Orbitron', sans-serif" },
  { label: 'Share Tech Mono', value: "'Share Tech Mono', monospace" },
  { label: 'Oswald', value: "'Oswald', sans-serif" },
  { label: 'Anton', value: "'Anton', sans-serif" },
  { label: 'Bebas Neue', value: "'Bebas Neue', sans-serif" },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Lora', value: "'Lora', serif" },
];

export interface ClockSettings {
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  bgColor: string;
  hideSeconds: boolean;
  showDate: boolean;
  calibrationOffset: number; // in milliseconds
  lineHeight: number; // 整体高度调整，百分比 (50-150)
  letterSpacing: number; // 数字左右间距，像素值 (-20 to 50)
}

const DEFAULT_SETTINGS: ClockSettings = {
  fontSize: 220,
  fontFamily: "'JetBrains Mono', monospace",
  fontColor: '#e0e0e0',
  bgColor: '#0a0a0a',
  hideSeconds: false,
  showDate: false,
  calibrationOffset: 0,
  lineHeight: 100,
  letterSpacing: 0,
};

const STORAGE_KEY = 'advanced-clock-settings';

interface ClockContextType {
  settings: ClockSettings;
  updateSettings: (partial: Partial<ClockSettings>) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  showCalibration: boolean;
  setShowCalibration: (v: boolean) => void;
  exportConfig: () => void;
  importConfig: (file: File) => Promise<void>;
  applyTheme: (theme: 'cyberpunk' | 'minimal' | 'retro') => void;
}

const ClockContext = createContext<ClockContextType | null>(null);

export function ClockProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ClockSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save settings with debounce
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch {}
    }, 300);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<ClockSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  }, []);

  // Listen for fullscreen changes (e.g., user presses Esc)
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const exportConfig = useCallback(() => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clock-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [settings]);

  const importConfig = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const imported = JSON.parse(text) as Partial<ClockSettings>;
      updateSettings(imported);
    } catch (e) {
      console.error('Failed to import config:', e);
      throw new Error('Invalid configuration file');
    }
  }, [updateSettings]);

  const applyTheme = useCallback((theme: 'cyberpunk' | 'minimal' | 'retro') => {
    const themes = {
      cyberpunk: {
        fontColor: '#00ff00',
        bgColor: '#0a0a0a',
        fontFamily: "'Orbitron', sans-serif",
      },
      minimal: {
        fontColor: '#1a1a1a',
        bgColor: '#ffffff',
        fontFamily: "'Playfair Display', serif",
      },
      retro: {
        fontColor: '#00aa00',
        bgColor: '#001100',
        fontFamily: "'Courier Prime', monospace",
      },
    };
    updateSettings(themes[theme]);
  }, [updateSettings]);

  return (
    <ClockContext.Provider value={{
      settings,
      updateSettings,
      isFullscreen,
      toggleFullscreen,
      showCalibration,
      setShowCalibration,
      exportConfig,
      importConfig,
      applyTheme,
    }}>
      {children}
    </ClockContext.Provider>
  );
}

export function useClock() {
  const ctx = useContext(ClockContext);
  if (!ctx) throw new Error('useClock must be used within ClockProvider');
  return ctx;
}

export const THEME_PRESETS = {
  cyberpunk: { name: '赛博朋克', fontColor: '#00ff00', bgColor: '#0a0a0a' },
  minimal: { name: '极简白', fontColor: '#1a1a1a', bgColor: '#ffffff' },
  retro: { name: '复古绿屏', fontColor: '#00aa00', bgColor: '#001100' },
} as const;
