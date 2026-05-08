# Estrategia Responsive Global - PriceHive

Este documento define las reglas de diseño y arquitectura CSS para transformar PriceHive en una aplicación mobile-first y plenamente adaptativa.

## 1. Breakpoints (Tailwind Estándar + Custom)
Utilizaremos la escala de Tailwind con un ajuste para móviles muy pequeños:

- `xs`: 320px (Móviles pequeños - iPhone SE)
- `sm`: 640px (Móviles grandes / Tablets retrato)
- `md`: 768px (Tablets paisaje)
- `lg`: 1024px (Laptops)
- `xl`: 1280px (Desktop estándar)
- `2xl`: 1536px (Desktop grande)

## 2. Sistema de Layout Adaptativo

### Eliminación de Estilos Inline
**Regla de Oro:** Se prohíbe el uso de estilos `style={{...}}` para propiedades de layout (position, display, width, margin, padding). Todo debe pasar a clases de Tailwind para permitir el uso de modificadores de breakpoint (`md:flex`, `lg:block`, etc.).

### Contenedores (Wrapper)
- Móvil: `px-2` o `px-3` para maximizar espacio.
- Desktop: `max-w-7xl mx-auto px-6`.

### Grids Adaptativos
- Stats/Tarjetas: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.
- Filtros: En móvil se usarán **Drawers** o **Acordeones colapsables** por defecto para no desplazar el contenido principal.

## 3. Componentes Críticos: Transformación UX

### Tablas (Admin / Analytics)
- Las tablas en Admin se transformarán en **Cards** en pantallas < md.
- Cada fila de la tabla será una tarjeta con labels claros.
- Las acciones (Editar/Borrar) estarán siempre visibles o bajo un menú de 3 puntos, evitando el hover.

### Navegación (Layout.js)
- Desktop: Sidebar lateral o Nav superior completa.
- Móvil: Mantener el **Drawer** actual pero asegurar que el "Safe Area" de iOS/Android sea respetado.
- Añadir una **Bottom Navigation Bar** opcional para las acciones principales si el Drawer se siente pesado.

### Formularios y Modales
- En móvil, los modales ocuparán el **100% de la pantalla** (`h-full` o `inset-0`) para evitar scrolls dobles.
- Los inputs deben tener un tamaño mínimo de `44px` de altura para ser "touch-friendly".
- Los botones de acción en modales deben estar fijos en la parte inferior (sticky footer).

## 4. Tipografía y Espaciado
- Utilizar `clamp()` para títulos si es posible, o escala de Tailwind: `text-2xl sm:text-3xl lg:text-5xl`.
- Reducir `gap` en móviles: de `gap-6` en desktop a `gap-3` en móvil.

## 5. UX Táctil
- Eliminar dependencias de `hover`. Las acciones ocultas deben mostrarse mediante:
    - Click en el item.
    - Botón de opciones (Lucide MoreVertical).
    - Desplazamiento lateral (swipe) si fuera necesario (avanzado).
- Spacing: Mínimo `8px` entre elementos interactivos para evitar errores de toque.
