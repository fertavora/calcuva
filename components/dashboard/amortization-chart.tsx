"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Installment } from "@/lib/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

interface Props {
  schedule: Installment[];
  todayIso: string;
}

export function AmortizationChart({ schedule, todayIso }: Props) {
  const data = useMemo(
    () =>
      schedule.map((row) => ({
        fecha: row.fecha,
        interesUVA: parseFloat(row.interesUVA.toFixed(4)),
        amortUVA: parseFloat(row.amortUVA.toFixed(4)),
      })),
    [schedule]
  );

  // Cuota donde interés = amortización (cruce)
  const cruceIdx = schedule.findIndex((r) => r.amortUVA >= r.interesUVA);
  const cruceFecha = cruceIdx >= 0 ? schedule[cruceIdx].fecha : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Composición de la cuota (UVA)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Sistema francés: interés baja, amortización sube. Se cruzan en la cuota{" "}
          {cruceIdx >= 0 ? (
            <strong>{schedule[cruceIdx].numero}</strong>
          ) : "—"}{" "}
          ({cruceFecha?.slice(0, 7)}).
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="gradInteres" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-5)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-chart-5)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gradAmort" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="fecha"
                tickFormatter={(v) => String(v).slice(0, 7)}
                fontSize={11}
              />
              <YAxis
                fontSize={11}
                tickFormatter={(v) => Number(v).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
              />
              <Tooltip
                formatter={(v) => {
                  const n = typeof v === "number" ? v : Number(v);
                  return Number.isFinite(n)
                    ? n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " UVA"
                    : "—";
                }}
                labelFormatter={(v) => String(v).slice(0, 7)}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                }}
              />
              <Legend />
              {/* línea vertical: hoy */}
              <ReferenceLine
                x={todayIso.slice(0, 7) + "-10"}
                stroke="var(--color-muted-foreground)"
                strokeDasharray="4 3"
                label={{ value: "Hoy", position: "top", fontSize: 10, fill: "var(--color-muted-foreground)" }}
              />
              {/* línea vertical: cruce interés = amort */}
              {cruceFecha && (
                <ReferenceLine
                  x={cruceFecha}
                  stroke="var(--color-chart-1)"
                  strokeDasharray="4 3"
                  label={{ value: "Cruce", position: "top", fontSize: 10, fill: "var(--color-chart-1)" }}
                />
              )}
              <Area
                type="monotone"
                dataKey="interesUVA"
                stroke="var(--color-chart-5)"
                strokeWidth={2}
                fill="url(#gradInteres)"
                dot={false}
                name="Interés UVA"
              />
              <Area
                type="monotone"
                dataKey="amortUVA"
                stroke="var(--color-chart-2)"
                strokeWidth={2}
                fill="url(#gradAmort)"
                dot={false}
                name="Amort. UVA"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
