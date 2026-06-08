import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";
export type SidebarStyle = "full" | "compact";

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const emit = () => listeners.forEach((l) => l());

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const dark = t === "dark" || (t === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
}

export function getTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const v = localStorage.getItem("cc_theme") as Theme | null;
  if (v === "light" || v === "dark" || v === "system") return v;
  // legacy fallback
  return localStorage.getItem("cc_dark") === "1" ? "dark" : "light";
}

export function setTheme(t: Theme) {
  localStorage.setItem("cc_theme", t);
  // keep legacy key roughly in sync
  const dark = t === "dark" || (t === "system" && systemPrefersDark());
  localStorage.setItem("cc_dark", dark ? "1" : "0");
  applyTheme(t);
  emit();
}

export function useTheme() {
  const value = useSyncExternalStore(subscribe, getTheme, () => "light" as Theme);
  return [value, setTheme] as const;
}

export function getSidebarStyle(): SidebarStyle {
  if (typeof window === "undefined") return "full";
  const v = localStorage.getItem("cc_sidebar") as SidebarStyle | null;
  return v === "compact" ? "compact" : "full";
}

export function setSidebarStyle(s: SidebarStyle) {
  localStorage.setItem("cc_sidebar", s);
  emit();
}

export function useSidebarStyle() {
  const value = useSyncExternalStore(subscribe, getSidebarStyle, () => "full" as SidebarStyle);
  return [value, setSidebarStyle] as const;
}

// Initialize on first import (client only)
if (typeof window !== "undefined") {
  applyTheme(getTheme());
  try {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (getTheme() === "system") {
        applyTheme("system");
        emit();
      }
    });
  } catch {
    /* older browsers */
  }
}