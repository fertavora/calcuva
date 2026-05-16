import { NextResponse } from "next/server";

interface BcraDetalle {
  fecha: string;
  valor: number;
}
interface BcraResponse {
  status: number;
  results: { idVariable: number; detalle: BcraDetalle[] }[];
}

const memCache = new Map<string, { fetchedAt: number; data: BcraDetalle[] }>();
const TTL_MS = 30 * 60 * 1000;

async function fetchChunk(desde: string, hasta: string): Promise<BcraDetalle[]> {
  const url = `https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias/31?desde=${desde}&hasta=${hasta}`;
  const res = await fetch(url, {
    // BCRA API uses a self-signed cert chain; but server-side fetch should be fine.
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`BCRA ${res.status}`);
  const json = (await res.json()) as BcraResponse;
  return json.results?.[0]?.detalle ?? [];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");
  if (!desde || !hasta) {
    return NextResponse.json({ error: "missing desde/hasta" }, { status: 400 });
  }

  const key = `${desde}__${hasta}`;
  const cached = memCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, max-age=600" },
    });
  }

  // The BCRA API may have a soft cap (1000 rows). Split into yearly chunks.
  const chunks: Array<[string, string]> = [];
  const startY = Number(desde.slice(0, 4));
  const endY = Number(hasta.slice(0, 4));
  for (let y = startY; y <= endY; y++) {
    const from = y === startY ? desde : `${y}-01-01`;
    const to = y === endY ? hasta : `${y}-12-31`;
    chunks.push([from, to]);
  }

  try {
    const results: BcraDetalle[] = [];
    for (const [d, h] of chunks) {
      const part = await fetchChunk(d, h);
      results.push(...part);
    }
    // Sort ascending and dedup
    const dedup = new Map<string, BcraDetalle>();
    for (const r of results) dedup.set(r.fecha, r);
    const sorted = Array.from(dedup.values()).sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
    memCache.set(key, { fetchedAt: Date.now(), data: sorted });
    return NextResponse.json(sorted, {
      headers: { "Cache-Control": "public, max-age=600" },
    });
  } catch (err) {
    if (cached) {
      return NextResponse.json(cached.data, { status: 200 });
    }
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
