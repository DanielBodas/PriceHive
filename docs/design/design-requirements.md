# Requisitos de Diseño - PriceHive

Este documento traduce las decisiones de marca en requisitos técnicos para el equipo de desarrollo.

## 1. Requisitos UI (Interfaz de Usuario)

### Centralización de Estilos
- **Prohibición de Inline Styles:** Todos los estilos deben ser aplicados vía Tailwind classes o CSS centralizado. Cualquier uso de `style={{...}}` debe ser justificado y limitado a valores dinámicos (ej: posiciones de parallax o progresos variables).
- **Consistencia de Bordes:** Todos los componentes de tipo "Card" o contenedores deben usar el radio de borde estándar `--radius` (0.75rem).

### Visual Identifiers
- **Iconografía:** Se usará exclusivamente `lucide-react`. El icono de marca es `Tag` o `Hexagon` con color Ámbar.
- **Gráficos:** Los colores de los gráficos deben derivar de los tokens `chart-1` a `chart-5`.

## 2. Requisitos UX (Experiencia de Usuario)

### Feedback y Estados
- **Hover States:** Todo elemento interactivo debe tener un estado hover definido (típicamente `hover:bg-accent` o `hover:opacity-90`).
- **Loading:** Implementar `skeleton screens` para el Dashboard y la Lista de Compra para evitar el "content layout shift".
- **Empty States:** Las tablas o listas vacías deben incluir un icono, un mensaje claro y un botón de acción (CTA).

### Responsive Design
- **Mobile First:** El diseño debe ser funcional en 320px.
- **Touch Targets:** Los botones en móvil deben tener una altura mínima de 44px.
- **Safe Areas:** El layout principal debe respetar `padding-bottom: env(safe-area-inset-bottom)` para dispositivos móviles modernos.

## 3. Constraints Visuales

- **Máximo de Colores:** No añadir colores nuevos fuera de la paleta definida en `tailwind.config.js`.
- **Tipografía:** No usar más de 3 pesos de fuente (400, 600, 800) para mantener la ligereza del CSS.
- **Sombras:** Usar exclusivamente las sombras predefinidas en el sistema de diseño.

## 4. Animaciones y Transiciones
- **Duración Estándar:** 150ms para interacciones simples (hover).
- **Curva de Velocidad:** `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Entradas:** Los modales y paneles laterales deben usar transiciones de opacidad y escala sutiles.
