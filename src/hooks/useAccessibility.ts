import { useState, useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description?: string;
  handler: () => void;
}

export function useKeyboardNavigation(shortcuts: KeyboardShortcut[]) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const { key, ctrl = false, shift = false, alt = false, meta = false, handler } = shortcut;
        
        const matches = 
          event.key.toLowerCase() === key.toLowerCase() &&
          event.ctrlKey === ctrl &&
          event.shiftKey === shift &&
          event.altKey === alt &&
          event.metaKey === meta;

        if (matches) {
          event.preventDefault();
          handler();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);

  return { enabled, setEnabled };
}

export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);
  const [focusHistory, setFocusHistory] = useState<HTMLElement[]>([]);

  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      setFocusedElement(target);
      setFocusHistory(prev => [...prev.slice(-4), target]); // Keep last 5 focused elements
    };

    const handleBlur = (event: FocusEvent) => {
      if (focusedElement === event.target) {
        setFocusedElement(null);
      }
    };

    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);

    return () => {
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('blur', handleBlur, true);
    };
  }, [focusedElement]);

  const focusPrevious = useCallback(() => {
    if (focusHistory.length > 1) {
      const previousElement = focusHistory[focusHistory.length - 2];
      previousElement?.focus();
    }
  }, [focusHistory]);

  const focusNext = useCallback(() => {
    const focusableElements = Array.from(
      document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ) as HTMLElement[];
    
    const currentIndex = focusableElements.indexOf(focusedElement as HTMLElement);
    const nextElement = focusableElements[currentIndex + 1] || focusableElements[0];
    nextElement?.focus();
  }, [focusedElement]);

  const focusFirst = useCallback(() => {
    const focusableElements = Array.from(
      document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ) as HTMLElement[];
    
    focusableElements[0]?.focus();
  }, []);

  const focusLast = useCallback(() => {
    const focusableElements = Array.from(
      document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ) as HTMLElement[];
    
    focusableElements[focusableElements.length - 1]?.focus();
  }, []);

  return {
    focusedElement,
    focusHistory,
    focusPrevious,
    focusNext,
    focusFirst,
    focusLast,
  };
}

export interface A11yAnnouncement {
  id: string;
  message: string;
  priority?: 'polite' | 'assertive';
}

export function useScreenReader() {
  const [announcements, setAnnouncements] = useState<A11yAnnouncement[]>([]);
  const announcementIdRef = useRef(0);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const id = `announcement-${++announcementIdRef.current}`;
    const announcement: A11yAnnouncement = { id, message, priority };
    
    setAnnouncements(prev => [...prev, announcement]);
    
    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 1000);
  }, []);

  const announceError = useCallback((message: string) => {
    announce(`Error: ${message}`, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`, 'polite');
  }, [announce]);

  const announceLoading = useCallback((message: string) => {
    announce(`Loading: ${message}`, 'polite');
  }, [announce]);

  return {
    announcements,
    announce,
    announceError,
    announceSuccess,
    announceLoading,
  };
}

export function useTabTrap(containerRef: React.RefObject<HTMLElement>) {
  const [isTrapped, setIsTrapped] = useState(false);

  useEffect(() => {
    if (!isTrapped || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = Array.from(
      container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ) as HTMLElement[];

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTrapped, containerRef]);

  const trapFocus = useCallback(() => setIsTrapped(true), []);
  const releaseFocus = useCallback(() => setIsTrapped(false), []);

  return { isTrapped, trapFocus, releaseFocus };
}

export function useHighContrast() {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const checkHighContrast = () => {
      setHighContrast(window.matchMedia('(prefers-contrast: high)').matches);
    };

    checkHighContrast();
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', checkHighContrast);

    return () => {
      window.matchMedia('(prefers-contrast: high)').removeEventListener('change', checkHighContrast);
    };
  }, []);

  return highContrast;
}

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const checkReducedMotion = () => {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };

    checkReducedMotion();
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', checkReducedMotion);

    return () => {
      window.matchMedia('(prefers-reduced-motion: reduce)').removeEventListener('change', checkReducedMotion);
    };
  }, []);

  return reducedMotion;
}