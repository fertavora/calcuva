"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, X } from "lucide-react";

const CONSENT_KEY = "cookie-consent-v1";

type ConsentState = "accepted" | "rejected" | null;

export function CookieConsent({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | "loading">("loading");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY) as ConsentState | null;
      setConsent(saved);
    } catch {
      // localStorage unavailable (private mode extremo, etc.)
      setConsent(null);
    }
  }, []);

  const accept = () => {
    try { localStorage.setItem(CONSENT_KEY, "accepted"); } catch {}
    setConsent("accepted");
  };

  const reject = () => {
    try { localStorage.setItem(CONSENT_KEY, "rejected"); } catch {}
    setConsent("rejected");
  };

  // Still hydrating — render children silently (avoid flash)
  if (consent === "loading") return <>{children}</>;

  // Accepted: render app normally
  if (consent === "accepted") return <>{children}</>;

  // Rejected: show blocking screen
  if (consent === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md text-center space-y-4">
          <X className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="text-xl font-semibold">Calculadora no disponible</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            La app necesita almacenamiento local (<code className="font-mono">localStorage</code>)
            para guardar los parámetros de tu crédito y el caché de datos del BCRA. Sin aceptar
            su uso, el cálculo no puede funcionar.
          </p>
          <p className="text-muted-foreground text-sm">
            No se recopilan datos personales ni se envía nada a terceros.{" "}
            <Link href="/ayuda" className="underline hover:text-foreground">
              Leer más sobre privacidad →
            </Link>
          </p>
          <Button onClick={accept} className="w-full">
            Aceptar y continuar
          </Button>
        </div>
      </div>
    );
  }

  // null: first visit — show banner over app content
  return (
    <>
      {children}
      <div
        role="dialog"
        aria-modal="false"
        aria-label="Consentimiento de almacenamiento"
        className="fixed bottom-0 inset-x-0 z-50 p-4"
      >
        <div className="mx-auto max-w-2xl rounded-xl border bg-card shadow-lg p-5 space-y-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 mt-0.5 shrink-0 text-green-600 dark:text-green-400" />
            <div className="space-y-1">
              <p className="font-medium text-sm">Esta app usa almacenamiento local</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Guardamos en tu navegador los parámetros de tu crédito, tus preferencias y el caché
                de datos del BCRA. <strong className="text-foreground">No se recopilan datos
                personales</strong>, no hay registro, y nada se envía a servidores externos.{" "}
                <Link href="/ayuda" className="underline hover:text-foreground transition-colors">
                  Ver política de privacidad
                </Link>
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={reject}>
              No aceptar
            </Button>
            <Button size="sm" onClick={accept}>
              Aceptar y continuar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
