# PriceHive - PRD (Product Requirements Document)

## Fecha de creación: 7 de Febrero, 2026

## Problema Original
Crear una app/web colaborativa donde los usuarios puedan registrar precios de productos de supermercado para evitar estafas con falsas ofertas o subidas de precios.

## User Personas
1. **Usuario Comprador**: Busca comparar precios y planificar compras inteligentes
2. **Usuario Contribuidor**: Comparte precios que encuentra en supermercados
3. **Administrador**: Gestiona los datos base (productos, marcas, supermercados)

## Requisitos Core (Estáticos)
- Autenticación JWT (email/contraseña)
- Landing page explicativa
- Muro social con posts, reacciones y comentarios
- Lista de compra con selector de supermercado
- Registro colaborativo de precios
- Análisis de datos con gráficos
- Panel de administración CRUD protegido

## Lo Implementado ✅

### Backend (FastAPI + MongoDB)
- Sistema de autenticación JWT completo
- CRUD para categorías, marcas, supermercados, unidades, productos
- Gestión de precios colaborativa
- Listas de compra con estimación de costes
- Sistema social (posts, comentarios, reacciones)
- Endpoints de análisis de precios
- Protección de rutas admin

### Frontend (React + Tailwind + Shadcn)
- Landing page con diseño PriceHive (Fresh Emerald theme)
- Páginas de Login/Register
- Dashboard con estadísticas
- Muro social funcional
- Lista de compra con predicción de costes
- Página de análisis con gráficos (Recharts)
- Panel de administración completo con tabs

### Datos Base Seedeados
- Supermercados: Mercadona, Carrefour, Lidl, Aldi
- Categorías: Lácteos, Frutas y Verduras, Carnes, Bebidas
- Marcas: Hacendado, Carrefour, Danone, Coca-Cola
- Unidades: Unidad, Kilogramo, Litro, Gramo
- Productos de ejemplo: Leche Entera, Leche Desnatada, Yogur Natural

### Credenciales de Prueba
- Admin: admin@pricehive.com / admin123
- Usuario: test@test.com / test123

## Backlog Priorizado

### P0 (Crítico - MVP completado)
- ✅ Autenticación
- ✅ CRUD Admin
- ✅ Lista de compra
- ✅ Registro de precios

### P1 (Importante)
- [ ] Búsqueda de productos
- [ ] Filtrado en análisis por fechas
- [ ] Notificaciones de cambios de precios
- [ ] Exportar lista de compra

### P2 (Mejoras)
- [ ] Modo oscuro
- [ ] PWA (instalable)
- [ ] Escaneo de código de barras
- [ ] Sistema de gamificación (puntos por contribuir)
- [ ] Alertas de precios personalizadas

## Próximos Pasos
1. Añadir búsqueda y filtros avanzados en productos
2. Implementar sistema de notificaciones
3. Mejorar análisis con más métricas (tendencias, predicciones)
4. Añadir opción de compartir listas de compra

## Stack Tecnológico
- **Backend**: FastAPI, MongoDB (Motor), JWT, bcrypt
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Recharts
- **Infraestructura**: Kubernetes (Emergent)
