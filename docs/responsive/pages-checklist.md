# Checklist de Validación Responsive - PriceHive

Este documento sirve como guía final para verificar que cada página cumple con los estándares profesionales de diseño adaptativo.

## 1. Global / Layout
- [x] El Sidebar se convierte en Drawer en móvil.
- [x] No hay desbordamiento horizontal en ninguna resolución.
- [x] El contenido respeta el Safe Area (especialmente en el footer).
- [x] El logo y perfil de usuario son legibles en móviles pequeños.

## 2. Landing Page
- [x] Título Hero no desborda en móviles de 320px.
- [x] Las "Feature Cards" se apilan correctamente.
- [x] El Feed simulado es visible y legible en móvil.
- [x] Los botones de CTA son de tamaño adecuado para touch.

## 3. Dashboard
- [x] Stats grid colapsa de 4 a 2 o 1 columna según el ancho.
- [x] No hay estilos inline que fuercen posiciones fijas en móvil.
- [x] El feed de posts aprovecha todo el ancho disponible en móviles.
- [x] Los sidebars se ocultan o se mueven debajo/encima del feed principal.

## 4. Lista de Compra
- [x] Los controles de cantidad y precio son fáciles de tocar (mínimo 44px de altura/área).
- [x] El sticky header no oculta contenido importante.
- [x] Los modales de "Añadir Producto" permiten scroll cuando el teclado está abierto.
- [x] El modo compra es fluido y no requiere zoom.

## 5. Analytics
- [x] Los filtros se agrupan en móviles para no empujar el gráfico demasiado abajo.
- [x] El gráfico de Recharts es responsive y legible.
- [x] Las tablas comparativas se desplazan horizontalmente o se convierten en cards.
- [x] La sección de "Recomendaciones" tiene padding adecuado.

## 6. Panel de Admin
- [x] Todas las tablas maestras (Categorías, Atributos, etc.) se ven como Cards en móvil.
- [x] Los Tabs de navegación no se desbordan y permiten scroll horizontal si es necesario.
- [x] Los botones de acción (Editar/Borrar) son accesibles sin hover.
- [x] La interfaz de importación/exportación es clara en pantallas pequeñas.

## 7. Auth (Login/Register)
- [x] Los formularios están centrados y tienen anchos responsivos.
- [x] Los errores de validación no rompen el layout.
- [x] El botón de Login con Google es prominente en todas las pantallas.
