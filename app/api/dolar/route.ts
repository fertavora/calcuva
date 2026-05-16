import { NextResponse } from "next/server";

interface BcraDetalle {
  fecha: string;
  valor: number;
}
interface BcraResponse {
  status: number;
  results: { idVariable: number; detalle: BcraDetalle[] }[];
}

const memCache = new Map<string, { fetchedAt: number; valor: number }>();
const TTL_MS = 60 * 60 * 1000; // 1h

export async function GET() {
  const cached = memCache.get("dolar");
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
    return NextResponse.json({ valor: cached.valor }, { headers: { "Cache-Control": "public, max-age=1800" } });
  }

  const hasta = new Date().toISOString().slice(0, 10);
  const desdeDate = new Date();
  desdeDate.setUTCDate(desdeDate.getUTCDate() - 7);
  const desde = desdeDate.toISOString().slice(0, 10);

  try {
    const url = `https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias/4?desde=${desde}&hasta=${hasta}`;
    const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!res.ok) throw new Error(`BCRA ${res.status}`);
    const json = (await res.json()) as BcraResponse;
    const detalle: BcraDetalle[] = json.results?.[0]?.detalle ?? [];
    if (detalle.length === 0) throw new Error("Sin datos");
    // Ordenar descendente y tomar el más reciente
    const sorted = [...detalle].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
    const { valor } = sorted[0];
    memCache.set("dolar", { fetchedAt: Date.now(), valor });
    return NextResponse.json({ valor }, { headers: { "Cache-Control": "public, max-age=1800" } });
  } catch (err) {
    if (cached) return NextResponse.json({ valor: cached.valor, stale: true });
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
