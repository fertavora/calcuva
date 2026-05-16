import { UvaPoint } from "./types";

const CACHE_KEY = "uva-bcra-cache-v1";
const TTL_MS = 24 * 60 * 60 * 1000;

interface CacheEntry {
  fetchedAt: number;
  data: UvaPoint[];
}

function readCache(): Record<string, CacheEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCache(cache: Record<string, CacheEntry>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore quota errors
  }
}

function rangeKey(desde: string, hasta: string) {
  return `${desde}__${hasta}`;
}

export async function getUvaRange(desde: string, hasta: string): Promise<UvaPoint[]> {
  const key = rangeKey(desde, hasta);
  const cache = readCache();
  const entry = cache[key];
  // Only cache historic ranges (hasta < today). For ranges including today, refresh more aggressively.
  const todayIso = new Date().toISOString().slice(0, 10);
  const includesToday = hasta >= todayIso;
  if (entry && Date.now() - entry.fetchedAt < (includesToday ? 60 * 60 * 1000 : TTL_MS)) {
    return entry.data;
  }
  const res = await fetch(`/api/uva?desde=${desde}&hasta=${hasta}`);
  if (!res.ok) {
    if (entry) return entry.data; // fallback to stale cache
    throw new Error(`BCRA API error: ${res.status}`);
  }
  const data = (await res.json()) as UvaPoint[];
  cache[key] = { fetchedAt: Date.now(), data };
  writeCache(cache);
  return data;
}

export function findUvaForDate(serie: UvaPoint[], date: string): number | undefined {
  // Exact or last published before `date`
  const sorted = [...serie].sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  let last: UvaPoint | undefined;
  for (const p of sorted) {
    if (p.fecha <= date) last = p;
    else break;
  }
  return last?.valor;
}

// ── Dólar oficial ─────────────────────────────────────────────────────────────

const DOLAR_CACHE_KEY = "dolar-bcra-cache-v1";
const DOLAR_TTL_MS = 60 * 60 * 1000; // 1h

interface DolarCache {
  fetchedAt: number;
  valor: number;
}

export async function getDolarHoy(): Promise<number | undefined> {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(DOLAR_CACHE_KEY);
      if (raw) {
        const entry: DolarCache = JSON.parse(raw);
        if (Date.now() - entry.fetchedAt < DOLAR_TTL_MS) return entry.valor;
      }
    } catch {}
  }

  try {
    const res = await fetch("/api/dolar");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { valor?: number; error?: string };
    if (!json.valor) return undefined;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(DOLAR_CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), valor: json.valor }));
      } catch {}
    }
    return json.valor;
  } catch {
    // fallback: return stale cache even if expired
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(DOLAR_CACHE_KEY);
        if (raw) return (JSON.parse(raw) as DolarCache).valor;
      } catch {}
    }
    return undefined;
  }
}

// ── UVA series helpers ─────────────────────────────────────────────────────────

export function buildMonthlyUvaSeries(serie: UvaPoint[]): UvaPoint[] {
  // Pick last published value of each YYYY-MM
  const byMonth = new Map<string, UvaPoint>();
  for (const p of [...serie].sort((a, b) => (a.fecha < b.fecha ? -1 : 1))) {
    const ym = p.fecha.slice(0, 7);
    byMonth.set(ym, p);
  }
  return Array.from(byMonth.values()).sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
}
