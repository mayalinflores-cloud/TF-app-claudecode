# TF Finance

Aplicación web de finanzas personales con diseño oscuro y los colores de marca TF.

**Stack:** React + Vite + Tailwind CSS 3 · Recharts · lucide-react

## Funcionalidades

- **Inicio:** saldo total con gradiente TF, ingresos y gastos (total y del mes), accesos rápidos (Ingreso / Gasto / Tasas / Limpiar), últimos 5 movimientos y gastos por categoría.
- **Estadísticas:** revenue mensual de los últimos 6 meses (ingresos vs. gastos), breakdown por categoría, neto, tasa de ahorro y promedio mensual.
- **Billetera:** cuentas (Efectivo, Banco, Binance, PayPal y las que agregues) y movimientos (formulario de registro y lista con búsqueda y filtro).
- **Perfil:** nombre editable, idioma (español / inglés), moneda principal, tasas de cambio en Bs y zona de riesgo para borrar todos los datos.
- **Multimoneda:** USD, EUR, Bs y USDT. Todos los cálculos se hacen en USD usando las tasas configuradas.
- Botón flotante **+** en la barra inferior para registrar movimientos rápido.
- Datos guardados solo en el navegador (`localStorage`, clave `tf-finance:v1`), sin backend.
- Mobile-first (`max-w-md`), con distribución en varias columnas a partir de `md`.
- **Boti — Tu Asistente Financiero:** chat con Claude que responde preguntas sobre tus finanzas. Se abre desde el ícono del robot en el header de Inicio.

## Boti

- El frontend llama a `/api/chat` (función serverless en `api/chat.js`), que llama a la API de Anthropic con el SDK oficial. La API key nunca llega al navegador.
- Cada mensaje incluye un resumen financiero construido desde `FinanceContext`: saldo total, ingresos, gastos, cantidad de movimientos, principales categorías de gasto, cuentas y deudas pendientes. La app no tiene un módulo de deudas, así que se toman como deudas las cuentas con saldo negativo.
- Modelo por defecto: `claude-sonnet-5-5` ($2 / $10 por millón de tokens de entrada / salida). Se puede cambiar con la variable `ANTHROPIC_MODEL`; si lo haces, agrega su precio en `src/lib/pricing.js`.
- Debajo de cada respuesta se muestran los tokens y el costo estimado, y en el header del panel el costo acumulado de la sesión.
- El historial vive solo en memoria: cada vez que abres Boti la conversación empieza de cero.

### Configurar la API key

Local: copia `.env.example` como `.env` y completa `ANTHROPIC_API_KEY`. `npm run dev` sirve `/api/chat` con esa key. El archivo `.env` está en `.gitignore`.

Vercel: en el proyecto, Settings → Environment Variables, agrega `ANTHROPIC_API_KEY` (sin prefijo `VITE_`) y vuelve a desplegar.

## Uso

```bash
npm install
npm run dev
```

La app queda disponible en http://localhost:5173/.

Otros comandos: `npm run build` (build de producción), `npm run preview` y `npm run lint`.

## Estructura

```
api/
  chat.js       función serverless de Boti (Vercel)
src/
  lib/          contexto con localStorage, conversión de monedas, traducciones y constantes
  components/   navegación, modales, formularios y piezas reutilizables
  screens/      Inicio, Estadísticas, Billetera y Perfil
```
