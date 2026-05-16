"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Installment, UvaPoint } from "@/lib/types";
import { findUvaForDate } from "@/lib/bcra";
import { formatARS, formatDateAR, formatUVA } from "@/lib/utils";
import { Download } from "lucide-react";

interface Props {
  past: Installment[];
  uvaSerie: UvaPoint[];
}

export function PaymentHistory({ past, uvaSerie }: Props) {
  const [showAll, setShowAll] = useState(false);
  const rows = useMemo(() => {
    const base = past.map((i) => {
      const uva = findUvaForDate(uvaSerie, i.fechaUVA);
      return { ...i, uva, ars: uva ? i.cuotaUVA * uva : undefined };
    });
    return base.map((r, idx) => {
      const prev = base[idx - 1];
      const variacion =
        r.ars && prev?.ars ? ((r.ars - prev.ars) / prev.ars) * 100 : undefined;
      return { ...r, variacion };
    });
  }, [past, uvaSerie]);

  const visible = showAll ? rows : rows.slice(-12).reverse();
  const ordered = showAll ? [...rows].reverse() : visible;

  const totalARS = rows.reduce((acc, r) => acc + (r.ars ?? 0), 0);

  function exportCSV() {
    const header = ["numero", "fecha", "uva", "cuotaUVA", "cuotaARS", "interesUVA", "amortUVA", "saldoUVA"].join(",");
    const lines = rows.map((r) =>
      [r.numero, r.fecha, r.uva ?? "", r.cuotaUVA.toFixed(4), r.ars?.toFixed(2) ?? "", r.interesUVA.toFixed(4), r.amortUVA.toFixed(4), r.saldoUVA.toFixed(4)].join(",")
    );
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "historico-cuotas-uva.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Histórico de cuotas pagadas</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {rows.length} cuotas · total estimado: {formatARS(totalARS)}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download /> CSV
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Vence</TableHead>
              <TableHead className="text-right">UVA (día 10)</TableHead>
              <TableHead className="text-right">Cuota UVA</TableHead>
              <TableHead className="text-right">Cuota ARS</TableHead>
              <TableHead className="text-right hidden md:table-cell">Interés UVA</TableHead>
              <TableHead className="text-right hidden md:table-cell">Amort. UVA</TableHead>
              <TableHead className="text-right hidden lg:table-cell">Saldo UVA</TableHead>
              <TableHead className="text-right">Var. cuota</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordered.map((r) => (
              <TableRow key={r.numero}>
                <TableCell className="font-medium">{r.numero}</TableCell>
                <TableCell>{formatDateAR(r.fecha)}</TableCell>
                <TableCell className="text-right">{r.uva ? formatUVA(r.uva) : "—"}</TableCell>
                <TableCell className="text-right">{formatUVA(r.cuotaUVA)}</TableCell>
                <TableCell className="text-right font-medium">{r.ars ? formatARS(r.ars) : "—"}</TableCell>
                <TableCell className="text-right hidden md:table-cell">{formatUVA(r.interesUVA)}</TableCell>
                <TableCell className="text-right hidden md:table-cell">{formatUVA(r.amortUVA)}</TableCell>
                <TableCell className="text-right hidden lg:table-cell">{formatUVA(r.saldoUVA)}</TableCell>
                <TableCell className={`text-right font-medium ${r.variacion !== undefined ? (r.variacion >= 0 ? "text-red-500" : "text-green-600") : ""}`}>
                  {r.variacion !== undefined ? `${r.variacion >= 0 ? "+" : ""}${r.variacion.toFixed(2)}%` : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length > 12 && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Mostrar últimas 12" : `Ver todas (${rows.length})`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
