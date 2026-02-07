# 🐝 PriceHive

**Plataforma colaborativa para compartir y consultar precios de supermercado**

![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.11-blue)
![React](https://img.shields.io/badge/react-19-61DAFB)
![MongoDB](https://img.shields.io/badge/mongodb-6.0-47A248)

---

## 🎯 ¿Qué es PriceHive?

PriceHive es una aplicación web donde los usuarios pueden:

- 📝 **Registrar precios** de productos de supermercado
- 📊 **Comparar precios** entre diferentes supermercados
- 🔔 **Recibir alertas** cuando bajan los precios
- 🛒 **Planificar compras** con listas inteligentes
- 🏆 **Ganar puntos** por contribuir a la comunidad

---

## 🚀 Quick Start

### Requisitos

- Python 3.11+
- Node.js 18+
- MongoDB 5.0+
- Yarn

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/pricehive.git
cd pricehive

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configurar .env
cp .env.example .env
# Editar .env con tus valores

# Frontend
cd ../frontend
yarn install

# Configurar .env
cp .env.example .env
# Editar .env con tus valores
```

### Ejecutar

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Terminal 2: Frontend
cd frontend
yarn start
```

### Acceder

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8001/docs

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [Guía de Desarrollador](docs/DEVELOPER_GUIDE.md) | Arquitectura, deployment, API reference |
| [Manual de Usuario](docs/USER_MANUAL.md) | Cómo usar la aplicación |
| [Manual de Administrador](docs/ADMIN_MANUAL.md) | Gestión de datos base |
| [PRD](memory/PRD.md) | Product Requirements Document |

---

## 🏗️ Arquitectura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React     │────▶│   FastAPI   │────▶│   MongoDB   │
│  Frontend   │◀────│   Backend   │◀────│  Database   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│  Tailwind   │     │  Emergent   │
│  Shadcn/UI  │     │  Google Auth│
└─────────────┘     └─────────────┘
```

---

## ✨ Características

### Para Usuarios

- ✅ Login con Google (un click)
- ✅ Dashboard con estadísticas
- ✅ Muro social (posts, reacciones, comentarios)
- ✅ Listas de compra inteligentes
- ✅ Edición rápida de marca/cantidad/precio
- ✅ Análisis de precios con gráficos
- ✅ Alertas personalizadas
- ✅ Sistema de puntos y ranking

### Para Administradores

- ✅ Panel CRUD completo
- ✅ Gestión de categorías, marcas, supermercados
- ✅ Control de productos y unidades
- ✅ Datos estructurados y limpios

---

## 🔧 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 19, Tailwind CSS, Shadcn/UI |
| **Backend** | Python 3.11, FastAPI |
| **Database** | MongoDB 6.0 |
| **Auth** | Google OAuth (Emergent), JWT |
| **Charts** | Recharts |

---

## 📁 Estructura del Proyecto

```
pricehive/
├── backend/
│   ├── server.py          # API FastAPI
│   ├── requirements.txt   # Dependencias Python
│   └── .env              # Variables de entorno
├── frontend/
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── contexts/     # Estado global
│   │   └── pages/        # Páginas
│   ├── package.json
│   └── .env
├── docs/
│   ├── DEVELOPER_GUIDE.md
│   ├── USER_MANUAL.md
│   └── ADMIN_MANUAL.md
└── README.md
```

---

## 🔐 Variables de Entorno

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=pricehive
JWT_SECRET=tu_secreto_aqui
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 🐳 Docker

```bash
# Construir y ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

---

## 🧪 Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
yarn test
```

---

## 📊 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/google/session` | Login con Google |
| POST | `/api/auth/login` | Login email/password |
| GET | `/api/auth/me` | Usuario actual |
| GET | `/api/prices` | Listar precios |
| POST | `/api/prices` | Registrar precio |
| GET | `/api/shopping-lists` | Mis listas |
| POST | `/api/alerts` | Crear alerta |
| GET | `/api/analytics/product/{id}` | Análisis producto |
| GET | `/api/leaderboard` | Ranking usuarios |

Ver [API Reference completa](docs/DEVELOPER_GUIDE.md#api-reference)

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📝 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

---

## 👥 Equipo

Desarrollado con ❤️ por el equipo de PriceHive.

---

**¿Preguntas?** Abre un issue o contacta con el equipo.
