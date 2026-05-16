import Link from "next/link";

export default function AyudaPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Volver al dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">Ayuda y privacidad</h1>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">¿Qué hace esta app?</h2>
        <p className="text-muted-foreground leading-relaxed">
          Es una calculadora personal para créditos hipotecarios UVA (Unidad de Valor Adquisitivo)
          en Argentina. Consulta el valor de la UVA en tiempo real desde la API pública del Banco
          Central de la República Argentina (BCRA) y calcula el valor de tus cuotas pasadas,
          presentes y proyectadas.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">¿Cómo funciona el cálculo?</h2>
        <div className="space-y-2 text-muted-foreground leading-relaxed">
          <p>
            Los créditos UVA usan el <strong className="text-foreground">sistema francés</strong>:
            la cuota en UVAs es fija durante toda la vida del préstamo. Lo que varía mes a mes es
            su equivalente en pesos, porque depende del valor de la UVA publicado por el BCRA el
            día 10 de cada mes.
          </p>
          <p>
            Fórmula de la cuota fija en UVAs:
          </p>
          <code className="block bg-muted rounded-md px-4 py-2 text-sm font-mono text-foreground">
            cuotaUVA = capitalUVA × (TNA/12) / (1 − (1 + TNA/12)^−n)
          </code>
          <p>
            Donde <code className="font-mono text-sm">capitalUVA = capitalARS / UVA(desembolso)</code> y{" "}
            <code className="font-mono text-sm">n</code> es el plazo en meses.
          </p>
          <p>
            Cuota en pesos de cada mes: <code className="font-mono text-sm">cuotaARS = cuotaUVA × UVA(día 10 del mes)</code>.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Proyecciones</h2>
        <p className="text-muted-foreground leading-relaxed">
          Como el valor futuro de la UVA es incierto, la app ofrece tres estrategias de proyección:
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>
            <strong className="text-foreground">Promedio histórico</strong>: usa la tasa mensual
            promedio de los últimos 3, 6 o 12 meses de la UVA real.
          </li>
          <li>
            <strong className="text-foreground">Escenarios</strong>: tres curvas con tasas mensuales
            configurables (optimista, base, pesimista).
          </li>
          <li>
            <strong className="text-foreground">Tasa personalizada</strong>: ingresás la inflación
            mensual que vos esperás.
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Las proyecciones son estimaciones. No constituyen asesoramiento financiero.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Fuentes de datos</h2>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>
            <strong className="text-foreground">UVA</strong>: BCRA Estadísticas Monetarias v4.0,
            variable 31 —{" "}
            <a
              href="https://api.bcra.gob.ar"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              api.bcra.gob.ar
            </a>
          </li>
          <li>
            <strong className="text-foreground">Dólar oficial BNA</strong>: BCRA Estadísticas
            Monetarias v4.0, variable 4 (tipo de cambio minorista promedio vendedor).
          </li>
        </ul>
      </section>

      <section className="space-y-3 rounded-xl border border-green-500/30 bg-green-500/5 p-5">
        <h2 className="text-xl font-semibold text-green-700 dark:text-green-400">
          Privacidad — no se recopilan datos personales
        </h2>
        <div className="space-y-2 text-muted-foreground leading-relaxed">
          <p>
            Esta app <strong className="text-foreground">no requiere registro</strong>,
            no solicita nombre, email, DNI, ni ningún dato de identificación personal.
          </p>
          <p>
            Todos los datos que ingresás (capital del crédito, TNA, plazo, fecha) se guardan
            exclusivamente en <strong className="text-foreground">tu propio navegador</strong>,
            mediante <code className="font-mono text-sm">localStorage</code>. Nunca se envían
            a ningún servidor externo ni se comparten con terceros.
          </p>
          <p>
            Los únicos datos que salen de tu dispositivo son las consultas a la API pública
            del BCRA para obtener el valor de la UVA y el dólar oficial, que son datos públicos
            sin relación con tu identidad.
          </p>
        </div>
        <div className="text-sm text-muted-foreground border-t border-green-500/20 pt-3 mt-3">
          <strong className="text-foreground">¿Qué guarda el navegador?</strong>
          <ul className="list-disc list-inside mt-1 space-y-0.5">
            <li>Parámetros de tu crédito (capital, TNA, plazo, fecha)</li>
            <li>Preferencias de proyección</li>
            <li>Caché de valores UVA del BCRA (para no repetir la consulta)</li>
            <li>Cotización del dólar oficial (caché 1 hora)</li>
            <li>Preferencia de tema (claro/oscuro)</li>
          </ul>
          <p className="mt-2">
            Podés borrar estos datos en cualquier momento limpiando el almacenamiento local
            de tu navegador.
          </p>
        </div>
      </section>

      <footer className="text-xs text-muted-foreground border-t pt-4">
        Cálculos basados en la normativa del BCRA para créditos UVA.
        Las proyecciones son estimaciones — no constituyen asesoramiento financiero ni legal.
      </footer>
    </div>
  );
}
