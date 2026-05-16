"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreditConfig, useProjectionConfig } from "@/lib/credit-store";
import { buildSchedule, findCurrentInstallment, findNextInstallments, findPastInstallments } from "@/lib/amortization";
import { getUvaRange, findUvaForDate, getDolarHoy } from "@/lib/bcra";
import { projectUVA, getImpliedRates, ImpliedRates } from "@/lib/projections";
import { UvaPoint } from "@/lib/types";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { PaymentHistory } from "@/components/dashboard/payment-history";
import { ProjectionChart } from "@/components/dashboard/projection-chart";
import { NextInstallments } from "@/components/dashboard/next-installments";
import { DebtBalanceChart } from "@/components/dashboard/debt-balance-chart";
import { AmortizationChart } from "@/components/dashboard/amortization-chart";
import { ScenarioControls } from "@/components/dashboard/scenario-controls";
import { CreditConfigSheet } from "@/components/dashboard/credit-config-sheet";
import { OnboardingModal } from "@/components/dashboard/onboarding-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SummaryCardsSkeleton, ChartSkeleton, TableSkeleton } from "@/components/dashboard/skeletons";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

export default function Home() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { config, setConfig, hydrated, configured } = useCreditConfig();
  const { config: projConfig, setConfig: setProjConfig } = useProjectionConfig();
  const [uvaSerie, setUvaSerie] = useState<UvaPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dolarHoy, setDolarHoy] = useState<number | undefined>();

  const today = new Date().toISOString().slice(0, 10);

  // A partir del 15 de cada mes el BCRA publica el UVA del día 10 del mes siguiente.
  // Pedimos hasta 45 días adelante para capturar esos valores ya disponibles.
  const fetchHasta = useMemo(() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 45);
    return d.toISOString().slice(0, 10);
  }, []);

  useEffect(() => {
    getDolarHoy().then((v) => { if (v) setDolarHoy(v); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getUvaRange(config.primeraCuota, fetchHasta)
      .then((data) => {
        if (!cancelled) setUvaSerie(data);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, config.primeraCuota, today]);

  const schedule = useMemo(() => (hydrated ? buildSchedule(config) : []), [hydrated, config]);
  const past = useMemo(() => findPastInstallments(schedule, today), [schedule, today]);
  const current = useMemo(() => findCurrentInstallment(schedule, today), [schedule, today]);
  const next = useMemo(() => findNextInstallments(schedule, today, 12), [schedule, today]);

  const projections = useMemo(() => {
    if (uvaSerie.length === 0) return [];
    try {
      const horizon = Math.max(projConfig.horizonMonths, schedule.length - past.length + 1);
      return projectUVA(uvaSerie, projConfig.strategy, horizon);
    } catch {
      return [];
    }
  }, [uvaSerie, projConfig, schedule.length, past.length]);

  const uvaToday = useMemo(() => findUvaForDate(uvaSerie, today), [uvaSerie, today]);
  const impliedRates = useMemo<ImpliedRates | undefined>(
    () => (uvaSerie.length > 12 ? getImpliedRates(uvaSerie) : undefined),
    [uvaSerie]
  );
  // UVA del día 10 del mes actual → referencia para cuota en curso
  const uvaDia10 = useMemo(() => {
    const dia10 = `${today.slice(0, 7)}-10`;
    return findUvaForDate(uvaSerie, dia10);
  }, [uvaSerie, today]);

  return (
    <>
    {hydrated && !configured && (
      <OnboardingModal onSave={(cfg) => setConfig(cfg)} />
    )}
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Análisis crédito UVA</h1>
          <p className="text-sm text-muted-foreground">
            Monitoreo y proyección de cuotas · datos en vivo del BCRA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Cambiar tema">
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
          <CreditConfigSheet config={config} onSave={setConfig} />
        </div>
      </header>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-sm text-destructive">
            Error obteniendo UVA del BCRA: {error}
          </CardContent>
        </Card>
      )}

      {!hydrated || (loading && uvaSerie.length === 0) ? (
        <SummaryCardsSkeleton />
      ) : (
        <SummaryCards current={current} uvaDia10={uvaDia10} uvaToday={uvaToday} dolarHoy={dolarHoy} totalCuotas={config.cuotas} />
      )}

      <Tabs defaultValue="proyeccion">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="proyeccion" className="flex-1 sm:flex-none">Proyección</TabsTrigger>
          <TabsTrigger value="historico" className="flex-1 sm:flex-none">Histórico</TabsTrigger>
          <TabsTrigger value="saldo" className="flex-1 sm:flex-none">Saldo</TabsTrigger>
        </TabsList>

        <TabsContent value="proyeccion" className="space-y-4">
          <ScenarioControls config={projConfig} onChange={setProjConfig} impliedRates={impliedRates} />
          {loading && uvaSerie.length === 0 ? (
            <>
              <ChartSkeleton />
              <TableSkeleton rows={6} />
            </>
          ) : (
            <>
              <ProjectionChart historic={uvaSerie} projections={projections} />
              <NextInstallments next={next} uvaSerie={uvaSerie} projections={projections} />
            </>
          )}
        </TabsContent>

        <TabsContent value="historico">
          {loading && uvaSerie.length === 0 ? (
            <TableSkeleton rows={12} />
          ) : (
            <PaymentHistory past={past} uvaSerie={uvaSerie} />
          )}
        </TabsContent>

        <TabsContent value="saldo" className="space-y-4">
          {loading && uvaSerie.length === 0 ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              <DebtBalanceChart schedule={schedule} uvaSerie={uvaSerie} projections={projections} todayIso={today} />
              <AmortizationChart schedule={schedule} todayIso={today} />
            </>
          )}
        </TabsContent>
      </Tabs>

      <footer className="text-xs text-muted-foreground pt-4 border-t flex flex-col sm:flex-row sm:justify-between gap-1">
        <span>
          Fuente:{" "}
          <a className="underline" href="https://api.bcra.gob.ar" target="_blank" rel="noreferrer">
            BCRA Estadísticas Monetarias v4.0
          </a>
          . Cálculo: sistema francés en UVAs. Las proyecciones son estimaciones, no asesoramiento financiero.
        </span>
        <a href="/ayuda" className="underline whitespace-nowrap">
          Ayuda y privacidad →
        </a>
      </footer>
    </div>
    </>
  );
}
