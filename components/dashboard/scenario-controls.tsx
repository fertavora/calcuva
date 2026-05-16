"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectionConfig } from "@/lib/types";
import { ImpliedRates } from "@/lib/projections";

interface Props {
  config: ProjectionConfig;
  onChange: (next: ProjectionConfig) => void;
  impliedRates?: ImpliedRates;
}

function RateChip({
  label,
  rate,
  onClick,
}: {
  label: string;
  rate: number;
  onClick: (pct: number) => void;
}) {
  const pct = parseFloat((rate * 100).toFixed(2));
  return (
    <button
      type="button"
      onClick={() => onClick(pct)}
      className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      title={`Usar ${pct}% mensual`}
    >
      {label}: <span className="font-semibold text-foreground">{pct}%</span>
    </button>
  );
}

function ImpliedRatesRow({
  rates,
  onSelect,
}: {
  rates: ImpliedRates;
  onSelect: (pct: number) => void;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3 space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">
        Tasas implícitas de la UVA real — hacé clic para usar como referencia
      </p>
      <div className="flex flex-wrap gap-2">
        <RateChip label="3m" rate={rates.m3} onClick={onSelect} />
        <RateChip label="6m" rate={rates.m6} onClick={onSelect} />
        <RateChip label="12m" rate={rates.m12} onClick={onSelect} />
      </div>
    </div>
  );
}

export function ScenarioControls({ config, onChange, impliedRates }: Props) {
  const tipo = config.strategy.tipo;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estrategia de proyección</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Tipo de proyección</Label>
            <Select
              value={tipo}
              onValueChange={(v) => {
                if (v === "promedio") onChange({ ...config, strategy: { tipo: "promedio", ventanaMeses: 6 } });
                else if (v === "rem") onChange({ ...config, strategy: { tipo: "rem", tasaMensualPct: 2.5 } });
                else
                  onChange({
                    ...config,
                    strategy: {
                      tipo: "escenarios",
                      tasaOptimistaMensualPct: 1.5,
                      tasaBaseMensualPct: 2.5,
                      tasaPesimistaMensualPct: 4.0,
                    },
                  });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="escenarios">Optimista / Base / Pesimista</SelectItem>
                <SelectItem value="promedio">Promedio últimos N meses</SelectItem>
                <SelectItem value="rem">Tasa personalizada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Horizonte (meses)</Label>
            <Input
              type="number"
              min={6}
              max={360}
              value={config.horizonMonths}
              onChange={(e) => onChange({ ...config, horizonMonths: Number(e.target.value) || 60 })}
            />
          </div>
        </div>

        {config.strategy.tipo === "promedio" && (
          <div>
            <Label className="mb-2 block">Ventana</Label>
            <Select
              value={String(config.strategy.ventanaMeses)}
              onValueChange={(v) =>
                onChange({ ...config, strategy: { tipo: "promedio", ventanaMeses: Number(v) as 3 | 6 | 12 } })
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Últimos 3 meses</SelectItem>
                <SelectItem value="6">Últimos 6 meses</SelectItem>
                <SelectItem value="12">Últimos 12 meses</SelectItem>
              </SelectContent>
            </Select>
            {impliedRates && (
              <div className="mt-3">
                <ImpliedRatesRow rates={impliedRates} onSelect={() => {}} />
              </div>
            )}
          </div>
        )}

        {config.strategy.tipo === "escenarios" && (() => {
          const s = config.strategy;
          return (
            <div className="space-y-3">
              {impliedRates && (
                <ImpliedRatesRow
                  rates={impliedRates}
                  onSelect={(pct) =>
                    onChange({ ...config, strategy: { ...s, tasaBaseMensualPct: pct } })
                  }
                />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="mb-2 block">Optimista (% mensual)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={s.tasaOptimistaMensualPct}
                    onChange={(e) =>
                      onChange({ ...config, strategy: { ...s, tasaOptimistaMensualPct: Number(e.target.value) } })
                    }
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Base (% mensual)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={s.tasaBaseMensualPct}
                    onChange={(e) =>
                      onChange({ ...config, strategy: { ...s, tasaBaseMensualPct: Number(e.target.value) } })
                    }
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Pesimista (% mensual)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={s.tasaPesimistaMensualPct}
                    onChange={(e) =>
                      onChange({ ...config, strategy: { ...s, tasaPesimistaMensualPct: Number(e.target.value) } })
                    }
                  />
                </div>
              </div>
            </div>
          );
        })()}

        {config.strategy.tipo === "rem" && (
          <div className="space-y-3">
            {impliedRates && (
              <ImpliedRatesRow
                rates={impliedRates}
                onSelect={(pct) =>
                  onChange({ ...config, strategy: { tipo: "rem", tasaMensualPct: pct } })
                }
              />
            )}
            <div>
              <Label className="mb-2 block">Tasa mensual esperada (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={config.strategy.tasaMensualPct}
                onChange={(e) =>
                  onChange({ ...config, strategy: { tipo: "rem", tasaMensualPct: Number(e.target.value) } })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ingresá la inflación mensual que esperás. Podés usar los chips de arriba como punto de partida.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
