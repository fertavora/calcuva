"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UvaPoint } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  historic: UvaPoint[];
  projections: { label: string; scenario: string; points: UvaPoint[] }[];
}

const COLORS: Record<string, string> = {
  historico: "var(--color-chart-3)",
  optimista: "var(--color-chart-2)",
  base: "var(--color-chart-1)",
  pesimista: "var(--color-chart-5)",
  promedio: "var(--color-chart-1)",
  rem: "var(--color-chart-4)",
};

export function ProjectionChart({ historic, projections }: Props) {
  const data = useMemo(() => {
    // Build wide table: { fecha, historico, optimista, base, pesimista, ... }
    const map = new Map<string, Record<string, number | string>>();
    // Sample historic monthly to keep chart light
    const monthly = new Map<string, number>();
    for (const p of historic) {
      const ym = p.fecha.slice(0, 7) + "-01";
      monthly.set(ym, p.valor);
    }
    for (const [fecha, valor] of monthly) {
      map.set(fecha, { fecha, historico: valor });
    }
    for (const proj of projections) {
      for (const p of proj.points) {
        const ym = p.fecha.slice(0, 7) + "-01";
        const existing = map.get(ym) ?? { fecha: ym };
        existing[proj.scenario] = p.valor;
        map.set(ym, existing);
      }
    }
    return Array.from(map.values()).sort((a, b) => (String(a.fecha) < String(b.fecha) ? -1 : 1));
  }, [historic, projections]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proyección UVA</CardTitle>
        <p className="text-sm text-muted-foreground">
          Histórico real + escenarios proyectados (mensual)
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="fecha" tickFormatter={(v) => String(v).slice(0, 7)} fontSize={11} />
              <YAxis fontSize={11} tickFormatter={(v) => Number(v).toLocaleString("es-AR")} />
              <Tooltip
                formatter={(v) => {
                  const n = typeof v === "number" ? v : Number(v);
                  return Number.isFinite(n) ? n.toLocaleString("es-AR", { maximumFractionDigits: 2 }) : "—";
                }}
                labelFormatter={(v) => String(v).slice(0, 7)}
                contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }}
              />
              <Legend />
              <Line type="monotone" dataKey="historico" stroke={COLORS.historico} strokeWidth={2} dot={false} name="Histórico" />
              {projections.map((p) => (
                <Line
                  key={p.scenario}
                  type="monotone"
                  dataKey={p.scenario}
                  stroke={COLORS[p.scenario] ?? "var(--color-chart-1)"}
                  strokeDasharray="5 4"
                  strokeWidth={2}
                  dot={false}
                  name={p.label}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
