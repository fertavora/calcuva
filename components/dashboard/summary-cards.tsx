"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Installment } from "@/lib/types";
import { formatARS, formatUVA, formatUSD } from "@/lib/utils";

interface Props {
  current?: Installment;
  uvaDia10?: number;   // UVA del día 10 del mes en curso (referencia cuota)
  uvaToday?: number;   // UVA de hoy (para saldo ARS)
  dolarHoy?: number;   // Tipo de cambio oficial ARS/USD
  totalCuotas: number;
}

export function SummaryCards({ current, uvaDia10, uvaToday, dolarHoy, totalCuotas }: Props) {
  const cuotaARS = current && uvaDia10 ? current.cuotaUVA * uvaDia10 : undefined;
  const saldoARS = current && uvaToday ? current.saldoUVA * uvaToday : undefined;
  const saldoUSD = saldoARS && dolarHoy ? saldoARS / dolarHoy : undefined;
  const restantes = current ? Math.max(0, totalCuotas - current.numero) : totalCuotas;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">Cuota actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{cuotaARS ? formatARS(cuotaARS) : "—"}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {current
              ? `Cuota ${current.numero} · ${formatUVA(current.cuotaUVA)} UVA × ${uvaDia10 ? formatUVA(uvaDia10) : "—"} (día 10)`
              : "—"}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">Saldo deuda (UVA)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{current ? formatUVA(current.saldoUVA, 2) : "—"}</div>
          <div className="text-xs text-muted-foreground mt-1">UVAs por amortizar</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">Saldo deuda (ARS hoy)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{saldoARS ? formatARS(saldoARS) : "—"}</div>
          <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
            <div>UVA hoy: {uvaToday ? formatUVA(uvaToday) : "—"}</div>
            {saldoUSD && dolarHoy && (
              <div>
                ≈ <span className="font-medium text-foreground">{formatUSD(saldoUSD)}</span>
                {" · "}dólar oficial: {formatARS(dolarHoy, 2)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">Cuotas restantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{restantes}</div>
          <div className="text-xs text-muted-foreground mt-1">
            de {totalCuotas} ({current?.numero ?? 0} pagadas)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
