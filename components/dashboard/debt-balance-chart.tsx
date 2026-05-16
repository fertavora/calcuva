"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Installment, UvaPoint } from "@/lib/types";
import { findUvaForDate } from "@/lib/bcra";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  schedule: Installment[];
  uvaSerie: UvaPoint[];
  projections: { label: string; scenario: string; points: UvaPoint[] }[];
  todayIso: string;
}

export function DebtBalanceChart({ schedule, uvaSerie, projections, todayIso }: Props) {
  const data = useMemo(() => {
    const baseProj = projections.find((p) => p.scenario === "base") ?? projections[0];
    return schedule.map((row) => {
      const isPast = row.fechaUVA <= todayIso;
      const ym = row.fechaUVA.slice(0, 7);
      const uva = isPast
        ? findUvaForDate(uvaSerie, row.fechaUVA)
        : baseProj
          ? baseProj.points.find((p) => p.fecha.slice(0, 7) === ym)?.valor
          : undefined;
      return {
        fecha: row.fecha,
        saldoUVA: row.saldoUVA,
        saldoARS: uva ? row.saldoUVA * uva : undefined,
      };
    });
  }, [schedule, uvaSerie, projections, todayIso]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución del saldo de capital</CardTitle>
        <p className="text-sm text-muted-foreground">
          Saldo en UVAs (decreciente por sistema francés) y proyectado en ARS (escenario base)
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="fecha" tickFormatter={(v) => String(v).slice(0, 7)} fontSize={11} />
              <YAxis yAxisId="uva" fontSize={11} tickFormatter={(v) => Number(v).toLocaleString("es-AR")} />
              <YAxis yAxisId="ars" orientation="right" fontSize={11} tickFormatter={(v) => `$${(Number(v) / 1_000_000).toFixed(1)}M`} />
              <Tooltip
                formatter={(v, name) => {
                  const num = typeof v === "number" ? v : Number(v);
                  if (!Number.isFinite(num)) return "—";
                  return name === "saldoARS"
                    ? num.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
                    : num.toLocaleString("es-AR", { maximumFractionDigits: 2 });
                }}
                contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }}
              />
              <Legend />
              <Line yAxisId="uva" type="monotone" dataKey="saldoUVA" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} name="Saldo UVA" />
              <Line yAxisId="ars" type="monotone" dataKey="saldoARS" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} name="Saldo ARS" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
