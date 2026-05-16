"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { CreditConfig } from "@/lib/types";
import { Settings } from "lucide-react";

interface Props {
  config: CreditConfig;
  onSave: (next: CreditConfig) => void;
}

export function CreditConfigSheet({ config, onSave }: Props) {
  const [draft, setDraft] = useState<CreditConfig>(config);

  return (
    <Sheet onOpenChange={(open) => open && setDraft(config)}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings /> Configurar crédito
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Parámetros del crédito</SheetTitle>
          <SheetDescription>Se guardan en tu navegador.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4">
          <div>
            <Label className="mb-2 block">Capital original (ARS)</Label>
            <Input
              type="number"
              value={draft.capitalARS}
              onChange={(e) => setDraft({ ...draft, capitalARS: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label className="mb-2 block">Plazo (cuotas)</Label>
            <Input
              type="number"
              value={draft.cuotas}
              onChange={(e) => setDraft({ ...draft, cuotas: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label className="mb-2 block">TNA (%)</Label>
            <Input
              type="number"
              step="0.01"
              value={draft.tnaPct}
              onChange={(e) => setDraft({ ...draft, tnaPct: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label className="mb-2 block">Fecha primera cuota</Label>
            <Input
              type="date"
              value={draft.primeraCuota}
              onChange={(e) => setDraft({ ...draft, primeraCuota: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-2 block">UVA al desembolso</Label>
            <Input
              type="number"
              step="0.01"
              value={draft.uvaOriginal}
              onChange={(e) => setDraft({ ...draft, uvaOriginal: Number(e.target.value) || 0 })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Default: UVA del 2018-03-11 (22.30). Editar si tu desembolso fue otro día.
            </p>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button onClick={() => onSave(draft)}>Guardar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
