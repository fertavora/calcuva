# CLAUDE.md — CalcUVA

Contexto para agentes y sesiones de Claude Code sobre este proyecto.

## Qué es

Dashboard Next.js para créditos hipotecarios UVA en Argentina. Calcula cuotas (sistema francés en UVAs), consume la API pública del BCRA en tiempo real y proyecta cuotas futuras bajo distintos escenarios de inflación. Sin backend propio, sin base de datos, sin autenticación.

- **Repo:** https://github.com/fertavora/calcuva
- **Producción:** https://calcuva.vercel.app
- **Stack:** Next.js 15 · App Router · TypeScript · Tailwind v4 · Recharts · date-fns · Radix UI
- **Package manager:** yarn (`yarn install --ignore-engines` si hay conflictos con Node)

## Datos del crédito de referencia (defaults)

```ts
capitalARS:    2_520_000
cuotas:        360
tnaPct:        3.5
primeraCuota:  "2018-03-12"   // las fechas de cuota se normalizan a día 10: 2018-03-10
uvaOriginal:   21.70          // UVA al momento del desembolso
```

Cuota UVA constante: **521.47 UVAs**. Cuota ARS varía cada mes según UVA del día 10.

## Lógica financiera clave

- `lib/amortization.ts` — `buildSchedule(config)`: genera array de 360 cuotas. Todas las fechas forzadas a día 10 (`${ym}-10`). Campo `fechaUVA` = misma fecha.
- `lib/bcra.ts` — `getUvaRange(desde, hasta)`: llama `/api/uva`, cachea en localStorage por bloques mensuales (TTL 24h). `getDolarHoy()`: cachea 1h.
- `lib/projections.ts` — `projectUVA(historic, strategy, horizonMonths)`. Tres estrategias: `"promedio"`, `"escenarios"`, `"personalizada"`.
- `lib/credit-store.ts` — `useCreditConfig()`: hook sobre localStorage. `configured: boolean` distingue primera visita (sin datos) de visita recurrente. Muestra `OnboardingModal` si `!configured`.

## API routes

| Route | Variable BCRA | Cache servidor | Descripción |
|---|---|---|---|
| `/api/uva` | 31 | 30 min (in-memory) | Serie histórica UVA, chunking por año |
| `/api/dolar` | 4 | 1 h (in-memory) | Dólar oficial BNA, últimos 7 días |

El cliente pide `fetchHasta = hoy + 45 días` para capturar el UVA del día 10 del mes siguiente (disponible desde el día 15 del mes en curso).

## Persistencia localStorage

| Key | Contenido | TTL |
|---|---|---|
| `uva-credit-config-v1` | Parámetros del crédito | Permanente |
| `uva-projection-config-v1` | Estrategia + tasas de proyección | Permanente |
| `uva-cache-YYYY-MM` | Valores UVA del mes | 24 h |
| `dolar-bcra-cache-v1` | Cotización dólar oficial | 1 h |
| `cookie-consent-v1` | `"accepted"` o `"rejected"` | Permanente |
| `theme` | `"dark"` o `"light"` | Permanente |

## Comandos frecuentes

```bash
yarn dev                     # servidor local en :3000
yarn build                   # build de producción
vercel --prod                # deploy a producción
git push origin main         # push → re-deploy automático en Vercel
```

## Errores conocidos

- `yarn install` puede fallar con Node 22 por incompatibilidad de engines → usar `--ignore-engines`
- `lucide-react` debe estar fijado a `^0.460.0` (versión 1.x tiene API distinta)
- Recharts `Tooltip` formatter: el valor puede llegar como `string | number` → castear con `typeof v === "number" ? v : Number(v)`

## Archivos críticos

```
lib/amortization.ts       ← no modificar sin validar contra cuota esperada (521.47 UVAs)
lib/bcra.ts               ← cache localStorage + proxy routes
app/api/uva/route.ts      ← chunking por año, memCache 30 min
components/dashboard/summary-cards.tsx   ← usa uvaDia10 (no uvaToday) para cuota actual
components/dashboard/next-installments.tsx  ← "Confirmado" si hay UVA real para fechaUVA
```
