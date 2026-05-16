"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditConfig } from "@/lib/types";
import { DEFAULT_CONFIG } from "@/lib/credit-store";
import { TrendingUp } from "lucide-react";

interface Props {
  onSave: (cfg: CreditConfig) => void;
}

export function OnboardingModal({ onSave }: Props) {
  const [draft, setDraft] = useState<CreditConfig>(DEFAULT_CONFIG);
  const [errors, setErrors] = useState<Partial<Record<keyof CreditConfig, string>>>({});

  function validate(): boolean {
    const e: typeof errors = {};
    if (!draft.capitalARS || draft.capitalARS <= 0) e.capitalARS = "Requerido";
    if (!draft.cuotas || draft.cuotas <= 0) e.cuotas = "Requerido";
    if (!draft.tnaPct || draft.tnaPct <= 0) e.tnaPct = "Requerido";
    if (!draft.primeraCuota) e.primeraCuota = "Requerido";
    if (!draft.uvaOriginal || draft.uvaOriginal <= 0) e.uvaOriginal = "Requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSave(draft);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card shadow-xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-tight">Configurá tu crédito UVA</h1>
            <p className="text-sm text-muted-foreground">
              Los datos se guardan solo en tu navegador.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="mb-1.5 block">Capital original (ARS)</Label>
              <Input
                type="number"
                placeholder="Ej: 2500000"
                value={draft.capitalARS || ""}
                onChange={(e) => setDraft({ ...draft, capitalARS: Number(e.target.value) })}
              />
              {errors.capitalARS && <p className="text-xs text-destructive mt-1">{errors.capitalARS}</p>}
            </div>

            <div>
              <Label className="mb-1.5 block">Plazo (cuotas)</Label>
              <Input
                type="number"
                placeholder="360"
                value={draft.cuotas || ""}
                onChange={(e) => setDraft({ ...draft, cuotas: Number(e.target.value) })}
              />
              {errors.cuotas && <p className="text-xs text-destructive mt-1">{errors.cuotas}</p>}
            </div>

            <div>
              <Label className="mb-1.5 block">TNA (%)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="3.5"
                value={draft.tnaPct || ""}
                onChange={(e) => setDraft({ ...draft, tnaPct: Number(e.target.value) })}
              />
              {errors.tnaPct && <p className="text-xs text-destructive mt-1">{errors.tnaPct}</p>}
            </div>

            <div className="col-span-2">
              <Label className="mb-1.5 block">Fecha primera cuota</Label>
              <Input
                type="date"
                value={draft.primeraCuota}
                onChange={(e) => setDraft({ ...draft, primeraCuota: e.target.value })}
              />
              {errors.primeraCuota && <p className="text-xs text-destructive mt-1">{errors.primeraCuota}</p>}
            </div>

            <div className="col-span-2">
              <Label className="mb-1.5 block">UVA al momento del desembolso</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej: 21.70"
                value={draft.uvaOriginal || ""}
                onChange={(e) => setDraft({ ...draft, uvaOriginal: Number(e.target.value) })}
              />
              {errors.uvaOriginal && <p className="text-xs text-destructive mt-1">{errors.uvaOriginal}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Valor de la UVA el día en que se acreditó el préstamo. Podés consultarlo en{" "}
                <a
                  href="https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias/31?desde=2018-01-01&hasta=2018-12-31"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  la API del BCRA
                </a>.
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Guardar y comenzar
          </Button>
        </form>
      </div>
    </div>
  );
}
