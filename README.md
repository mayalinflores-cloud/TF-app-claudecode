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

## Uso

```bash
npm install
npm run dev
```

La app queda disponible en http://localhost:5173/.

Otros comandos: `npm run build` (build de producción), `npm run preview` y `npm run lint`.

## Estructura

```
src/
  lib/          contexto con localStorage, conversión de monedas, traducciones y constantes
  components/   navegación, modales, formularios y piezas reutilizables
  screens/      Inicio, Estadísticas, Billetera y Perfil
```
