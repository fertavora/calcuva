"use client";

import { useEffect, useState } from "react";
import { CreditConfig, ProjectionConfig } from "./types";

const CONFIG_KEY = "uva-credit-config-v1";
const PROJ_KEY = "uva-projection-config-v1";

export const DEFAULT_CONFIG: CreditConfig = {
  capitalARS: 2_520_000,
  cuotas: 360,
  tnaPct: 3.5,
  primeraCuota: "2018-03-12",
  uvaOriginal: 21.7,
};

export const DEFAULT_PROJECTION: ProjectionConfig = {
  strategy: {
    tipo: "escenarios",
    tasaOptimistaMensualPct: 1.5,
    tasaBaseMensualPct: 2.5,
    tasaPesimistaMensualPct: 4.0,
  },
  horizonMonths: 60,
};

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function useCreditConfig() {
  const [config, setConfig] = useState<CreditConfig>(DEFAULT_CONFIG);
  const [hydrated, setHydrated] = useState(false);
  const [configured, setConfigured] = useState(false); // false = sin datos en localStorage

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      try {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(raw) });
        setConfigured(true);
      } catch {
        setConfigured(false);
      }
    } else {
      setConfigured(false);
    }
    setHydrated(true);
  }, []);

  const update = (patch: Partial<CreditConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      save(CONFIG_KEY, next);
      return next;
    });
    setConfigured(true);
  };

  return { config, setConfig: update, hydrated, configured };
}

export function useProjectionConfig() {
  const [config, setConfig] = useState<ProjectionConfig>(DEFAULT_PROJECTION);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setConfig(load(PROJ_KEY, DEFAULT_PROJECTION));
    setHydrated(true);
  }, []);
  const update = (next: ProjectionConfig) => {
    setConfig(next);
    save(PROJ_KEY, next);
  };
  return { config, setConfig: update, hydrated };
}
