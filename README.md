# CalcUVA

Dashboard para monitorear y proyectar cuotas de créditos hipotecarios UVA en Argentina. Consume datos en vivo de la API pública del BCRA, sin backend propio ni registro de usuarios.

🔗 **https://calcuva.vercel.app**

---

## Qué hace

- Muestra la **cuota actual en ARS** (usando el UVA del día 10 del mes en curso)
- Calcula el **saldo de deuda** en UVAs y en ARS, con equivalente en USD (dólar oficial BNA)
- Tabla de **cuotas históricas** pagadas con UVA de referencia y variación mensual
- **Proyección de cuotas futuras** bajo tres estrategias: promedio histórico, escenarios (optimista/base/pesimista) y tasa personalizada
- Chips de **tasas implícitas** (últimos 3/6/12 meses) calculadas desde la serie real de UVA
- Gráficos: evolución de la UVA, saldo de capital y composición amortización/intereses
- **Dark mode**, onboarding en primera visita, página de ayuda y política de privacidad

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Estilos | Tailwind CSS v4 + primitivas Radix UI |
| Gráficos | Recharts |
| Fechas | date-fns |
| Datos | BCRA API v4.0 (variable 31 = UVA, variable 4 = dólar oficial) |
| Persistencia | `localStorage` (sin backend, sin DB) |

## Estructura

```
app/
  page.tsx                  # Dashboard principal
  ayuda/page.tsx            # Ayuda y política de privacidad
  api/
    uva/route.ts            # Proxy BCRA variable 31, cache 30 min
    dolar/route.ts          # Proxy BCRA variable 4, cache 1 h
components/
  dashboard/
    summary-cards.tsx       # Cards: cuota, saldo UVA/ARS/USD, cuotas restantes
    payment-history.tsx     # Tabla histórico con variación mensual
    next-installments.tsx   # Próximas cuotas: confirmadas o proyectadas
    projection-chart.tsx    # Gráfico UVA histórica + escenarios
    debt-balance-chart.tsx  # Saldo capital en UVAs y ARS
    amortization-chart.tsx  # Composición interés vs. amortización
    scenario-controls.tsx   # Selector de estrategia + tasas implícitas
    credit-config-sheet.tsx # Sheet lateral para editar parámetros
    onboarding-modal.tsx    # Modal primera visita
    skeletons.tsx           # Skeletons de carga
  cookie-consent.tsx
  theme-provider.tsx
lib/
  amortization.ts           # Sistema francés en UVAs
  bcra.ts                   # Cliente BCRA + cache localStorage
  projections.ts            # 3 estrategias de proyección
  credit-store.ts           # Hook localStorage (config crédito + proyección)
  types.ts
  utils.ts
```

## Desarrollo local

Requiere Node.js 18+ y yarn.

```bash
git clone https://github.com/fertavora/calcuva.git
cd calcuva
yarn install
yarn dev
```

Abrí [http://localhost:3000](http://localhost:3000). No se necesitan variables de entorno: la app solo consume la API pública del BCRA.

> **Nota:** la primera vez que abrís la app en un navegador nuevo aparece un modal para ingresar los datos de tu crédito. Todos los datos se guardan únicamente en `localStorage` del navegador.

## Cálculo

Sistema francés en UVAs:

```
r           = TNA / 12
capitalUVA  = capitalARS / UVA(desembolso)
cuotaUVA    = capitalUVA × r / (1 − (1 + r)^−n)     ← constante
cuotaARS_k  = cuotaUVA × UVA(día 10 del mes k)
```

La cuota en UVAs es fija durante toda la vida del préstamo. Lo que varía es su equivalente en pesos, indexado por el UVA publicado por el BCRA el día 10 de cada mes.

## Deploy en Vercel

El proyecto está conectado al repositorio GitHub. Cada push a `main` genera un re-deploy automático.

### Primera vez (fork o cuenta nueva)

1. Crear repo en GitHub (o hacer fork de este).
2. Instalar [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`
3. Autenticarse: `vercel login`
4. Desde la raíz del proyecto:
   ```bash
   vercel --yes
   ```
   Vercel detecta Next.js automáticamente. No se necesitan variables de entorno.

### Deploy manual a producción

```bash
vercel --prod
```

### Variables de entorno

Ninguna. La app no tiene secrets ni configuración de entorno.

---

Datos en vivo: [api.bcra.gob.ar](https://api.bcra.gob.ar) — BCRA Estadísticas Monetarias v4.0.  
Las proyecciones son estimaciones. No constituyen asesoramiento financiero.
