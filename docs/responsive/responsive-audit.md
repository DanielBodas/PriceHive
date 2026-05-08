# Auditoría Responsive - PriceHive

Este documento detalla los problemas de diseño adaptativo detectados en la aplicación PriceHive tras un análisis exhaustivo del código fuente de los componentes frontend.

## Resumen General
La aplicación utiliza Tailwind CSS, lo cual facilita la adaptabilidad, pero se han detectado patrones que rompen la experiencia en dispositivos móviles y tablets, especialmente en las páginas con alta densidad de datos (Admin, Analytics, Shopping List).

---

## 1. Problemas Críticos por Página

### Global (Layout / Nav)
- **Severidad:** Media
- **Problema:** El contenido principal tiene un padding fijo `pt-12` y `max-w-7xl mx-auto px-4`. En móviles muy pequeños, 16px de padding a cada lado puede ser mucho, reduciendo drásticamente el espacio para tablas o grids.
- **Causa Raíz:** Uso de contenedores estándar sin ajuste fino para breakpoints pequeños.
- **Impacto:** Pérdida de espacio útil en pantallas de <360px.

### Landing Page
- **Severidad:** Baja
- **Problema:** El Hero utiliza `text-5xl lg:text-7xl`. Aunque escala, en móviles medianos (iPhone SE) "falsas ofertas" puede desbordar si no tiene un `break-words` adecuado.
- **Causa Raíz:** Tipografía muy grande sin escala fluida.
- **Impacto:** Desbordamiento horizontal potencial en el título principal.

### Dashboard
- **Severidad:** Crítica
- **Problema:** Uso extensivo de **estilos inline** en el componente `Dashboard.js` (especialmente en la versión principal del componente). Los estilos inline como `style={{ position: "sticky", top: "3.5rem" }}` no responden a breakpoints.
- **Problema:** Grids de 4 columnas (`grid-cols-2 lg:grid-cols-4`) en las stats superiores pueden apretarse demasiado en móviles de 320px.
- **Causa Raíz:** Mezcla de Tailwind con estilos CSS en línea rígidos.
- **Impacto:** Elementos que se solapan o textos de stats ilegibles en móvil.

### Lista de Compra (Shopping List)
- **Severidad:** Alta
- **Problema:** El modo "Compra" tiene un header sticky complejo. Los inputs de precio y cantidad en la lista de items están en un `flex-row` que puede apretarse en móviles estrechos.
- **Problema:** Los diálogos (Modales) tienen `max-h-[90vh]`. En móviles con teclado en pantalla (software keyboard), el espacio para scroll dentro del modal se vuelve casi nulo.
- **Causa Raíz:** Modales con altura fija relativa y formularios densos.
- **Impacto:** Imposibilidad de completar formularios en móvil si el teclado oculta el botón de acción.

### Análisis (Analytics)
- **Severidad:** Media
- **Problema:** Grids de filtros (`grid md:grid-cols-3` y `grid md:grid-cols-4`) colapsan a 1 columna en móvil, lo que genera un scroll vertical muy largo antes de llegar al gráfico.
- **Problema:** Los gráficos de Recharts pueden no redimensionarse correctamente si el contenedor padre no tiene dimensiones definidas en el reflow.
- **Causa Raíz:** Falta de agrupación de filtros en acordeones o drawers para móvil.
- **Impacto:** UX tediosa (mucho scroll) para ver un dato simple.

### Panel de Administración (Admin)
- **Severidad:** Crítica
- **Problema:** Tablas complejas con muchas columnas (Nombre, Descripción, Valores, Acciones) que no tienen scroll horizontal ni transformación a cards.
- **Problema:** Navegación por Tabs en 3 niveles (Main Tabs -> Sub Tabs -> Accordions). En móvil, los `TabsList` se vuelven ilegibles o se desbordan.
- **Causa Raíz:** Interfaz diseñada puramente para escritorio (Data-heavy desktop-first).
- **Impacto:** Página prácticamente inutilizable en dispositivos móviles.

---

## 2. Checklist de Problemas Comunes

| Problema | Severidad | Impacto |
| :--- | :--- | :--- |
| Desbordamiento horizontal en tablas | Crítica | Pérdida de acceso a botones de acción (Editar/Borrar) |
| Dependencia de Hover | Media | Imposibilidad de ver botones de acción en items de lista (Shopping List items) |
| Grids que no colapsan | Media | Elementos demasiado estrechos (Dashboard stats) |
| Modales sin scroll adecuado | Alta | Botones de formulario inaccesibles con teclado abierto |
| Textos rígidos | Baja | Estética pobre en resoluciones intermedias |

---

## 3. Conclusión de Auditoría
PriceHive es una aplicación funcionalmente rica pero visualmente rígida. El mayor riesgo está en el **Panel de Administración** y el **Dashboard**, donde la mezcla de estilos inline y tablas densas impide una experiencia móvil profesional. La **Lista de Compra** requiere un ajuste en los items para que el uso táctil sea más ergonómico (evitar botones pequeños).
