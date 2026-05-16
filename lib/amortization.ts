import { CreditConfig, Installment } from "./types";

function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + months, d));
  // Handle month overflow (e.g., Jan 31 + 1 month → Feb 28)
  if (date.getUTCDate() !== d) {
    date.setUTCDate(0); // last day of previous month
  }
  return date.toISOString().slice(0, 10);
}

// La cuota se valoriza con la UVA del día 10 del mes en que vence.
export function referenciaUvaFecha(fechaCuotaIso: string): string {
  return `${fechaCuotaIso.slice(0, 7)}-10`;
}

export function buildSchedule(cfg: CreditConfig): Installment[] {
  const r = cfg.tnaPct / 100 / 12;
  const n = cfg.cuotas;
  const capitalUVA0 = cfg.capitalARS / cfg.uvaOriginal;
  const cuotaUVA = (capitalUVA0 * r) / (1 - Math.pow(1 + r, -n));

  const out: Installment[] = [];
  let saldo = capitalUVA0;
  for (let k = 1; k <= n; k++) {
    const interesUVA = saldo * r;
    const amortUVA = cuotaUVA - interesUVA;
    saldo = saldo - amortUVA;
    const ym = addMonths(cfg.primeraCuota, k - 1).slice(0, 7);
    const fecha = `${ym}-10`;
    out.push({
      numero: k,
      fecha,
      fechaUVA: fecha, // mismo día: cuotas vencen y se valorizan el día 10

      cuotaUVA,
      interesUVA,
      amortUVA,
      saldoUVA: Math.max(0, saldo),
    });
  }
  return out;
}

export function installmentARS(cuotaUVA: number, uvaValue: number): number {
  return cuotaUVA * uvaValue;
}

export function findCurrentInstallment(schedule: Installment[], today: string): Installment | undefined {
  const past = schedule.filter((i) => i.fecha <= today);
  return past[past.length - 1] ?? schedule[0];
}

export function findNextInstallments(schedule: Installment[], today: string, count: number): Installment[] {
  return schedule.filter((i) => i.fecha > today).slice(0, count);
}

export function findPastInstallments(schedule: Installment[], today: string): Installment[] {
  return schedule.filter((i) => i.fecha <= today);
}
