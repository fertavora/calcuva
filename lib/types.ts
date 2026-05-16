export interface CreditConfig {
  capitalARS: number;
  cuotas: number;
  tnaPct: number;
  primeraCuota: string; // YYYY-MM-DD
  uvaOriginal: number;
}

export interface Installment {
  numero: number;
  fecha: string; // YYYY-MM-DD - vencimiento real
  fechaUVA: string; // YYYY-MM-10 - día de referencia para valorizar la cuota
  cuotaUVA: number;
  interesUVA: number;
  amortUVA: number;
  saldoUVA: number;
}

export interface UvaPoint {
  fecha: string; // YYYY-MM-DD
  valor: number;
  isProjection?: boolean;
  scenario?: "base" | "optimista" | "pesimista" | "promedio" | "rem" | "historico";
}

export type ProjectionStrategy =
  | { tipo: "promedio"; ventanaMeses: 3 | 6 | 12 }
  | { tipo: "escenarios"; tasaOptimistaMensualPct: number; tasaBaseMensualPct: number; tasaPesimistaMensualPct: number }
  | { tipo: "rem"; tasaMensualPct: number };

export interface ProjectionConfig {
  strategy: ProjectionStrategy;
  horizonMonths: number;
}
