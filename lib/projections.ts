import { ProjectionStrategy, UvaPoint } from "./types";
import { buildMonthlyUvaSeries } from "./bcra";

function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + months, d));
  if (date.getUTCDate() !== d) date.setUTCDate(0);
  return date.toISOString().slice(0, 10);
}

function lastValue(serie: UvaPoint[]): { fecha: string; valor: number } {
  const last = [...serie].sort((a, b) => (a.fecha < b.fecha ? -1 : 1)).at(-1);
  if (!last) throw new Error("Serie UVA vacía");
  return { fecha: last.fecha, valor: last.valor };
}

export function avgMonthlyRate(serie: UvaPoint[], windowMonths: number): number {
  const monthly = buildMonthlyUvaSeries(serie);
  if (monthly.length < 2) return 0;
  const slice = monthly.slice(-windowMonths - 1);
  if (slice.length < 2) return 0;
  const first = slice[0].valor;
  const last = slice[slice.length - 1].valor;
  const periods = slice.length - 1;
  return Math.pow(last / first, 1 / periods) - 1;
}

interface ProjectedSeries {
  label: string;
  scenario: NonNullable<UvaPoint["scenario"]>;
  points: UvaPoint[];
}

export interface ImpliedRates {
  m3: number;  // tasa mensual implícita últimos 3 meses
  m6: number;
  m12: number;
}

export function getImpliedRates(historic: UvaPoint[]): ImpliedRates {
  return {
    m3: avgMonthlyRate(historic, 3),
    m6: avgMonthlyRate(historic, 6),
    m12: avgMonthlyRate(historic, 12),
  };
}

export function projectUVA(
  historic: UvaPoint[],
  strategy: ProjectionStrategy,
  horizonMonths: number
): ProjectedSeries[] {
  const { fecha: lastDate, valor: lastVal } = lastValue(historic);

  const generate = (rateMonthly: number, scenario: NonNullable<UvaPoint["scenario"]>, label: string): ProjectedSeries => {
    const points: UvaPoint[] = [];
    let val = lastVal;
    for (let i = 1; i <= horizonMonths; i++) {
      val = val * (1 + rateMonthly);
      points.push({
        fecha: addMonths(lastDate, i),
        valor: val,
        isProjection: true,
        scenario,
      });
    }
    return { label, scenario, points };
  };

  if (strategy.tipo === "promedio") {
    const rate = avgMonthlyRate(historic, strategy.ventanaMeses);
    return [generate(rate, "promedio", `Promedio últimos ${strategy.ventanaMeses}m (${(rate * 100).toFixed(2)}% mensual)`)];
  }
  if (strategy.tipo === "escenarios") {
    return [
      generate(strategy.tasaOptimistaMensualPct / 100, "optimista", `Optimista ${strategy.tasaOptimistaMensualPct}% mensual`),
      generate(strategy.tasaBaseMensualPct / 100, "base", `Base ${strategy.tasaBaseMensualPct}% mensual`),
      generate(strategy.tasaPesimistaMensualPct / 100, "pesimista", `Pesimista ${strategy.tasaPesimistaMensualPct}% mensual`),
    ];
  }
  // rem
  return [generate(strategy.tasaMensualPct / 100, "rem", `REM ${strategy.tasaMensualPct}% mensual`)];
}
