# PriceHive - PRD (Product Requirements Document)

## Fecha de actualización: 7 de Febrero, 2026

## Problema Original
Crear una app/web colaborativa donde los usuarios puedan registrar precios de productos de supermercado para evitar estafas con falsas ofertas o subidas de precios.

## User Personas
1. **Usuario Comprador**: Busca comparar precios y planificar compras inteligentes
2. **Usuario Contribuidor**: Comparte precios que encuentra en supermercados
3. **Administrador**: Gestiona los datos base (productos, marcas, supermercados)

## Requisitos Core (Estáticos)
- ✅ Autenticación Google OAuth (Emergent Auth) + Legacy JWT
- ✅ Landing page explicativa
- ✅ Muro social con posts, reacciones y comentarios
- ✅ Lista de compra con selector de supermercado
- ✅ Registro colaborativo de precios
- ✅ Análisis de datos con gráficos y búsqueda
- ✅ Panel de administración CRUD protegido
- ✅ Sistema de alertas de precios
- ✅ Sistema de gamificación
- ✅ Notificaciones

## Lo Implementado ✅

### Backend (FastAPI + MongoDB)
- **Auth**: Google OAuth (Emergent) + JWT legacy
- **Sesiones**: Cookie-based sessions con expiración 7 días
- **CRUD**: Categorías, marcas, supermercados, unidades, productos
- **Precios**: Registro colaborativo con detección de cambios
- **Listas de compra**: Con estimación de costes
- **Social**: Posts, comentarios, reacciones
- **Alertas**: Sistema de alertas personalizadas por producto/supermercado
- **Notificaciones**: Sistema de notificaciones con contador de no leídas
- **Gamificación**: Sistema de puntos con leaderboard
- **Analytics**: Evolución de precios, comparativas entre supermercados
- **Búsqueda**: Productos con filtros por categoría/marca

### Frontend (React + Tailwind + Shadcn)
- **Landing page**: Con Google OAuth CTA
- **Auth**: Google OAuth + email/password fallback
- **Dashboard**: Estadísticas + puntos del usuario
- **Muro social**: Posts con reacciones y comentarios
- **Lista de compra**: Con predicción de costes
- **Análisis**: Gráficos + búsqueda/filtros
- **Alertas**: CRUD de alertas de precio
- **Perfil**: Puntos, leaderboard, historial, notificaciones
- **Admin**: Panel CRUD completo con tabs
- **Navegación**: Contador de notificaciones no leídas

### Sistema de Gamificación
| Acción | Puntos |
|--------|--------|
| Registro | +50 |
| Registrar precio | +10 |
| Crear publicación | +5 |
| Comentar | +2 |
| Subir precios desde lista | +10 por precio |

### Datos Base Seedeados
- Supermercados: Mercadona, Carrefour, Lidl, Aldi
- Categorías: Lácteos, Frutas y Verduras, Carnes, Bebidas
- Marcas: Hacendado, Carrefour, Danone, Coca-Cola
- Unidades: Unidad, Kilogramo, Litro, Gramo
- Productos: Leche Entera, Leche Desnatada, Yogur Natural

### Credenciales de Prueba
- Admin: admin@pricehive.com / admin123
- O usar Google OAuth (recomendado)

## Backlog Priorizado

### P0 (Crítico - Completado)
- ✅ Autenticación (Google OAuth + JWT)
- ✅ CRUD Admin
- ✅ Lista de compra
- ✅ Registro de precios
- ✅ Alertas de precios
- ✅ Gamificación
- ✅ Notificaciones
- ✅ Búsqueda/filtros

### P1 (Importante)
- [ ] Filtrado por fechas en analytics
- [ ] Push notifications (PWA)
- [ ] Exportar lista de compra a PDF

### P2 (Mejoras)
- [ ] Modo oscuro
- [ ] PWA completa (instalable)
- [ ] Escaneo de código de barras
- [ ] Badges y logros
- [ ] Compartir listas de compra

## Próximos Pasos
1. Implementar filtros por fechas en análisis
2. Añadir badges/logros al sistema de gamificación
3. PWA con push notifications
4. Exportación de datos

## Stack Tecnológico
- **Backend**: FastAPI, MongoDB (Motor), JWT, bcrypt, httpx
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Recharts
- **Auth**: Emergent Google OAuth + JWT fallback
- **Infraestructura**: Kubernetes (Emergent)
