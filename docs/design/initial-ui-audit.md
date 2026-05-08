# Auditoría de UI Inicial - PriceHive

**Fecha:** 24 de Mayo de 2024
**Auditor:** Lead Product Designer & Frontend Architect

## 1. Resumen Ejecutivo
La plataforma PriceHive presenta una base técnica sólida con React 19 y Shadcn UI, pero carece de una identidad visual cohesiva. Existe una disparidad significativa entre la arquitectura de componentes y la implementación de estilos, con una presencia excesiva de estilos "hardcoded" e inconsistencias cromáticas.

## 2. Análisis del Stack Visual Actual
- **Framework:** React 19
- **Estilos:** Tailwind CSS + CSS Variables (HSL)
- **Librería UI:** Shadcn UI (Radix)
- **Tipografía:**
  - Headings: Manrope (Sans-serif geométrica)
  - Body: Inter (Sans-serif humanista)
  - Mono: JetBrains Mono
- **Iconografía:** Lucide React

## 3. Problemas Detectados

### A. Inconsistencia de Marca
- **Confusión Cromática:** El sistema de diseño define un verde esmeralda (`--primary`) como color principal, mientras que la documentación interna (Memory) y el concepto de marca "Hive" sugieren tonos ámbar/miel.
- **Identidad Débil:** El logo actual es un componente genérico (`Tag` icon) que no transmite la sofisticación de un SaaS moderno.

### B. Deuda Técnica de Estilos (Crítico)
- **Inline Styles:** El `Dashboard.js` contiene una cantidad alarmante de estilos inline (`style={{...}}`), lo que rompe la escalabilidad, dificulta el mantenimiento del modo oscuro y anula las ventajas de Tailwind.
- **Hardcoded Colors:** Se utilizan clases como `bg-emerald-500` o `text-sky-600` directamente en los componentes en lugar de usar tokens semánticos como `bg-primary` o `text-accent`.

### C. UX & Jerarquía Visual
- **Densidad de Información:** El Dashboard intenta mostrar demasiados elementos sin una separación clara de capas visuales (Surface elevation).
- **Consistencia de Componentes:** Las "Cards" en diferentes páginas tienen radios de borde y sombras inconsistentes (algunas usan clases de Tailwind, otras sombras personalizadas en `index.css`).
- **Estados de Interacción:** Falta de feedback visual consistente en estados `hover`, `active` y `disabled` en componentes personalizados.

### D. Layout & Responsive
- **Sidebar vs Topnav:** El `Layout.js` implementa un Top Navigation que se satura rápidamente. La navegación móvil es funcional pero visualmente pobre comparada con la experiencia de escritorio.
- **Safe Areas:** Aunque se menciona soporte para safe areas, la implementación en componentes de terceros es desigual.

## 4. Oportunidades de Mejora
1.  **Unificación de Tokens:** Migrar todos los colores hardcoded a variables CSS en `index.css` siguiendo una lógica semántica.
2.  **Identidad "Honey-Tech":** Adoptar el esquema Ámbar/Slate para alinear el nombre PriceHive con su estética, usando el Ámbar como color de acento "energético" y Slate para la estructura profesional.
3.  **Refactorización de Componentes:** Eliminar todos los estilos inline en favor de clases de Tailwind configuradas en el theme.
4.  **Elevación y Profundidad:** Implementar un sistema de sombras y capas más refinado para mejorar la lectura de la jerarquía (inspiración: Linear/Vercel).

## 5. Conclusión
PriceHive tiene el potencial de verse como un producto premium, pero actualmente se percibe como una plantilla de Shadcn modificada apresuradamente. La Fase 2 debe centrarse en definir los tokens que den "alma" al producto.
