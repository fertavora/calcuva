"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Installment, UvaPoint } from "@/lib/types";
import { findUvaForDate } from "@/lib/bcra";
import { formatARS, formatDateAR } from "@/lib/utils";

interface Props {
  next: Installment[];
  uvaSerie: UvaPoint[];
  projections: { label: string; scenario: string; points: UvaPoint[] }[];
}

function uvaForMonth(points: UvaPoint[], ym: string): number | undefined {
  const match = points.find((p) => p.fecha.slice(0, 7) === ym);
  return match?.valor;
}

export function NextInstallments({ next, uvaSerie, projections }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas cuotas</CardTitle>
        <p className="text-sm text-muted-foreground">
          Valor confirmado cuando el BCRA ya publicó el UVA del día 10; proyectado en caso contrario.
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">UVA (día 10)</TableHead>
              <TableHead className="text-right">Cuota ARS</TableHead>
              {projections.length > 0 && (
                <TableHead className="text-right text-muted-foreground hidden sm:table-cell">
                  Escenarios
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {next.map((cuota) => {
              const uvaReal = findUvaForDate(uvaSerie, cuota.fechaUVA);
              const confirmed = uvaReal !== undefined;
              return (
                <TableRow key={cuota.numero}>
                  <TableCell className="font-medium">{cuota.numero}</TableCell>
                  <TableCell>{formatDateAR(cuota.fecha)}</TableCell>
                  <TableCell className="text-right">
                    {confirmed ? (
                      <span className="font-medium">{uvaReal!.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {confirmed ? (
                      <span className="text-foreground">{formatARS(cuota.cuotaUVA * uvaReal!)}</span>
                    ) : projections.length > 0 ? (
                      <span className="text-muted-foreground text-xs">ver →</span>
                    ) : "—"}
                  </TableCell>
                  {projections.length > 0 && (
                    <TableCell className="text-right hidden sm:table-cell">
                      {confirmed ? (
                        <span className="text-xs text-green-600 font-medium">Confirmado</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {projections.map((p) => {
                            const uva = uvaForMonth(p.points, cuota.fechaUVA.slice(0, 7));
                            return uva
                              ? `${p.scenario}: ${formatARS(cuota.cuotaUVA * uva)}`
                              : null;
                          }).filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
