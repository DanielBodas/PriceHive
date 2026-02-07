# PriceHive - Documentación Técnica para Desarrolladores

## Índice
1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Backend (API)](#backend-api)
5. [Frontend](#frontend)
6. [Base de Datos](#base-de-datos)
7. [Autenticación](#autenticación)
8. [Guía de Deployment](#guía-de-deployment)
9. [Variables de Entorno](#variables-de-entorno)
10. [API Reference](#api-reference)

---

## Visión General

**PriceHive** es una aplicación web colaborativa que permite a los usuarios compartir y consultar precios de productos de supermercado. El objetivo es crear transparencia en los precios y ayudar a los consumidores a detectar falsas ofertas.

### Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Backend | Python 3.11 + FastAPI |
| Frontend | React 19 + Tailwind CSS |
| Base de Datos | MongoDB |
| Autenticación | Google OAuth + JWT |
| UI Components | Shadcn/UI |
| Gráficos | Recharts |

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    React Frontend                         │   │
│  │  - Landing Page    - Dashboard      - Feed               │   │
│  │  - Shopping List   - Analytics      - Alerts             │   │
│  │  - Profile         - Admin Panel                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (REST API)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY / INGRESS                       │
│  - /api/* → Backend (port 8001)                                 │
│  - /* → Frontend (port 3000)                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │    Auth     │  │    CRUD     │  │  Analytics  │             │
│  │  - Google   │  │  - Products │  │  - Prices   │             │
│  │  - JWT      │  │  - Brands   │  │  - Compare  │             │
│  │  - Sessions │  │  - Units    │  │  - Stats    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Social    │  │   Alerts    │  │ Gamification│             │
│  │  - Posts    │  │  - Create   │  │  - Points   │             │
│  │  - Comments │  │  - Trigger  │  │  - Leaders  │             │
│  │  - Reactions│  │  - Notify   │  │  - History  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MongoDB                                   │
│  Collections: users, products, brands, categories, units,       │
│  supermarkets, prices, shopping_lists, posts, comments,         │
│  alerts, notifications, user_sessions, point_history            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SERVICIOS EXTERNOS                             │
│  - Google OAuth API                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estructura del Proyecto

```
/app
├── backend/
│   ├── server.py           # Aplicación FastAPI principal
│   ├── requirements.txt    # Dependencias Python
│   └── .env               # Variables de entorno backend
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/        # Componentes Shadcn/UI
│   │   │   ├── Layout.js  # Layout principal con navegación
│   │   │   └── AuthCallback.js  # Manejo OAuth callback
│   │   │
│   │   ├── contexts/
│   │   │   └── AuthContext.js   # Estado de autenticación
│   │   │
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── Dashboard.js
│   │   │   ├── FeedPage.js
│   │   │   ├── ShoppingListPage.js
│   │   │   ├── AnalyticsPage.js
│   │   │   ├── AlertsPage.js
│   │   │   ├── ProfilePage.js
│   │   │   └── AdminPage.js
│   │   │
│   │   ├── App.js          # Router y providers
│   │   ├── App.css         # Estilos custom
│   │   └── index.css       # Estilos globales + Tailwind
│   │
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env                # Variables de entorno frontend
│
├── docs/                   # Documentación
├── memory/
│   └── PRD.md             # Product Requirements Document
└── README.md
```

---

## Backend (API)

### Descripción General

El backend está construido con **FastAPI** y sigue una arquitectura monolítica modular. Todos los endpoints están bajo el prefijo `/api`.

### Dependencias Principales

```txt
fastapi==0.115.12
uvicorn==0.34.2
motor==3.7.0          # MongoDB async driver
pymongo==4.12.1
pydantic==2.12.1
python-dotenv==1.1.0
PyJWT==2.10.1
bcrypt==4.3.0
httpx==0.28.1         # Para llamadas HTTP async
```

### Módulos del Backend

#### 1. Autenticación (`/api/auth/*`)
- Google OAuth
- JWT para autenticación legacy
- Gestión de sesiones con cookies

#### 2. Admin CRUD (`/api/admin/*`)
- Categorías, Marcas, Supermercados, Unidades, Productos
- Protegido con rol `admin`

#### 3. Precios (`/api/prices/*`)
- Registro colaborativo de precios
- Detección automática de cambios
- Trigger de alertas

#### 4. Listas de Compra (`/api/shopping-lists/*`)
- CRUD de listas
- Estimación de costes
- Subida masiva de precios

#### 5. Social (`/api/posts/*`)
- Posts con tipos (update, price_alert, tip)
- Comentarios y reacciones

#### 6. Alertas (`/api/alerts/*`)
- Alertas personalizadas por producto
- Tipos: below, above, any_change

#### 7. Notificaciones (`/api/notifications/*`)
- Sistema de notificaciones
- Contador de no leídas

#### 8. Gamificación (`/api/leaderboard`, `/api/my-points`)
- Sistema de puntos
- Ranking de contribuidores

#### 9. Analytics (`/api/analytics/*`)
- Evolución de precios
- Comparativas entre supermercados

### Ejecución Local

```bash
cd /app/backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

---

## Frontend

### Descripción General

El frontend está construido con **React 19** usando **Vite** como bundler y **Tailwind CSS** para estilos.

### Dependencias Principales

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^7.1.1",
  "axios": "^1.7.9",
  "recharts": "^2.15.0",
  "tailwindcss": "^3.4.17",
  "lucide-react": "^0.469.0"
}
```

### Componentes UI (Shadcn)

Los componentes de Shadcn están en `/frontend/src/components/ui/`:
- Button, Card, Input, Label
- Select, Dialog, Tabs
- Table, Avatar, Badge
- Dropdown Menu, Checkbox
- Separator, Textarea, Sonner (toasts)

### Rutas de la Aplicación

| Ruta | Componente | Acceso |
|------|------------|--------|
| `/` | LandingPage | Público |
| `/login` | LoginPage | Público |
| `/register` | RegisterPage | Público |
| `/dashboard` | Dashboard | Autenticado |
| `/feed` | FeedPage | Autenticado |
| `/shopping-list` | ShoppingListPage | Autenticado |
| `/analytics` | AnalyticsPage | Autenticado |
| `/alerts` | AlertsPage | Autenticado |
| `/profile` | ProfilePage | Autenticado |
| `/admin` | AdminPage | Admin only |

### Ejecución Local

```bash
cd /app/frontend
yarn install
yarn start
```

---

## Base de Datos

### MongoDB Collections

#### `users`
```javascript
{
  "id": "uuid",
  "email": "string",
  "password": "string (hashed, optional for Google users)",
  "name": "string",
  "picture": "string (URL, optional)",
  "role": "user | admin",
  "points": "number",
  "created_at": "ISO date string"
}
```

#### `products`
```javascript
{
  "id": "uuid",
  "name": "string",
  "brand_id": "uuid (ref: brands)",
  "category_id": "uuid (ref: categories)",
  "unit_id": "uuid (ref: units)",
  "barcode": "string (optional)",
  "image_url": "string (optional)"
}
```

#### `prices`
```javascript
{
  "id": "uuid",
  "product_id": "uuid (ref: products)",
  "supermarket_id": "uuid (ref: supermarkets)",
  "price": "number",
  "quantity": "number",
  "user_id": "uuid (ref: users)",
  "created_at": "ISO date string"
}
```

#### `alerts`
```javascript
{
  "id": "uuid",
  "user_id": "uuid (ref: users)",
  "product_id": "uuid (ref: products)",
  "supermarket_id": "uuid (optional, ref: supermarkets)",
  "target_price": "number",
  "alert_type": "below | above | any_change",
  "triggered": "boolean",
  "created_at": "ISO date string"
}
```

#### `notifications`
```javascript
{
  "id": "uuid",
  "user_id": "uuid (ref: users)",
  "title": "string",
  "message": "string",
  "notification_type": "string",
  "read": "boolean",
  "created_at": "ISO date string"
}
```

#### `user_sessions`
```javascript
{
  "user_id": "uuid (ref: users)",
  "session_token": "string",
  "expires_at": "ISO date string",
  "created_at": "ISO date string"
}
```

### Índices Recomendados

```javascript
// users
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "points": -1 })

// prices
db.prices.createIndex({ "product_id": 1, "supermarket_id": 1, "created_at": -1 })
db.prices.createIndex({ "user_id": 1 })

// alerts
db.alerts.createIndex({ "user_id": 1 })
db.alerts.createIndex({ "product_id": 1, "triggered": 1 })

// notifications
db.notifications.createIndex({ "user_id": 1, "read": 1, "created_at": -1 })

// user_sessions
db.user_sessions.createIndex({ "session_token": 1 })
db.user_sessions.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 })
```

---

## Autenticación

### Flujo Google OAuth

```
1. Usuario hace click en "Continuar con Google"
   │
2. Redirect a Google OAuth
   │
3. Usuario autoriza con Google
   │
4. Redirect de vuelta con código de autorización
   │
5. Frontend intercambia código por tokens
   │
6. POST /api/auth/google/session { session_id }
   │
7. Backend valida la sesión
   │
8. Backend crea/actualiza usuario y sesión
   │
9. Cookie session_token establecida
```

### Flujo JWT (Legacy)

```
1. POST /api/auth/login { email, password }
   │
2. Backend valida credenciales
   │
3. Genera JWT con: user_id, email, role, exp
   │
4. Retorna: { access_token, user }
   │
5. Frontend guarda token en localStorage
   │
6. Requests con header: Authorization: Bearer {token}
```

### Protección de Rutas

```python
# Cualquier usuario autenticado
@api_router.get("/resource")
async def get_resource(user: dict = Depends(get_current_user)):
    pass

# Solo administradores
@api_router.post("/admin/resource")
async def create_resource(user: dict = Depends(get_admin_user)):
    pass
```

---

## Guía de Deployment

### Requisitos del Sistema

| Requisito | Mínimo | Recomendado |
|-----------|--------|-------------|
| CPU | 1 core | 2+ cores |
| RAM | 1 GB | 2+ GB |
| Disco | 10 GB | 20+ GB |
| Node.js | 18.x | 20.x |
| Python | 3.10 | 3.11 |
| MongoDB | 5.0 | 6.0+ |

### Opción 1: Docker Compose

#### `docker-compose.yml`

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: pricehive-mongo
    restart: unless-stopped
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: pricehive

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: pricehive-backend
    restart: unless-stopped
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=pricehive
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGINS=${CORS_ORIGINS}
    depends_on:
      - mongodb

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: pricehive-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_BACKEND_URL=${BACKEND_URL}
    depends_on:
      - backend

volumes:
  mongodb_data:
```

#### `backend/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

#### `frontend/Dockerfile`

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

#### `frontend/nginx.conf`

```nginx
server {
    listen 3000;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Desplegar con Docker

```bash
# Crear archivo .env
cat > .env << EOF
JWT_SECRET=tu_super_secreto_seguro_aqui
CORS_ORIGINS=http://localhost:3000,https://tudominio.com
BACKEND_URL=http://localhost:8001
EOF

# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down
```

### Opción 2: Deployment Manual (VPS/Cloud)

#### 1. Preparar el servidor

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y python3.11 python3.11-venv nodejs npm nginx

# Instalar MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Instalar yarn
npm install -g yarn
```

#### 2. Clonar y configurar el proyecto

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/pricehive.git
cd pricehive

# Backend
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Crear .env
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=pricehive
JWT_SECRET=tu_super_secreto_seguro_aqui
CORS_ORIGINS=https://tudominio.com
EOF

# Frontend
cd ../frontend
yarn install

# Crear .env
cat > .env << EOF
REACT_APP_BACKEND_URL=https://tudominio.com
EOF

yarn build
```

#### 3. Configurar Nginx

```nginx
# /etc/nginx/sites-available/pricehive
server {
    listen 80;
    server_name tudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudominio.com;

    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    # Frontend (archivos estáticos)
    location / {
        root /var/www/pricehive/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/pricehive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL con Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com
```

#### 4. Configurar Systemd para el Backend

```ini
# /etc/systemd/system/pricehive-backend.service
[Unit]
Description=PriceHive Backend
After=network.target mongod.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/pricehive/backend
Environment="PATH=/var/www/pricehive/backend/venv/bin"
ExecStart=/var/www/pricehive/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start pricehive-backend
sudo systemctl enable pricehive-backend
sudo systemctl status pricehive-backend
```

### Opción 3: Cloud Platforms

#### Heroku

```bash
# Procfile (backend)
web: uvicorn server:app --host 0.0.0.0 --port $PORT

# runtime.txt
python-3.11.0

# Deployment
heroku create pricehive-backend
heroku addons:create mongolab
heroku config:set JWT_SECRET=xxx CORS_ORIGINS=xxx
git push heroku main
```

#### Railway / Render / Fly.io

Estas plataformas soportan deployment directo desde GitHub con detección automática de Dockerfile o buildpacks.

---

## Variables de Entorno

### Backend (`.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MONGO_URL` | URL de conexión a MongoDB | `mongodb://localhost:27017` |
| `DB_NAME` | Nombre de la base de datos | `pricehive` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | `super_secret_key_change_me` |
| `CORS_ORIGINS` | Orígenes permitidos (separados por coma) | `http://localhost:3000,https://app.com` |

### Frontend (`.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `REACT_APP_BACKEND_URL` | URL base del backend | `https://api.tudominio.com` |

---

## API Reference

### Autenticación

#### POST `/api/auth/google/session`
Procesa sesión de Google OAuth.

**Request:**
```json
{ "session_id": "string" }
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "role": "string",
    "picture": "string",
    "points": 0,
    "created_at": "string"
  }
}
```

#### POST `/api/auth/login`
Login con email/password.

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

#### GET `/api/auth/me`
Obtiene usuario actual.

**Headers:** `Authorization: Bearer {token}` o cookie `session_token`

### Precios

#### POST `/api/prices`
Registra un nuevo precio.

**Request:**
```json
{
  "product_id": "uuid",
  "supermarket_id": "uuid",
  "price": 1.99,
  "quantity": 1
}
```

#### GET `/api/prices?product_id=xxx&supermarket_id=xxx&limit=100`
Lista precios con filtros opcionales.

### Alertas

#### POST `/api/alerts`
Crea una alerta de precio.

**Request:**
```json
{
  "product_id": "uuid",
  "supermarket_id": "uuid (opcional)",
  "target_price": 1.50,
  "alert_type": "below | above | any_change"
}
```

### Analytics

#### GET `/api/analytics/product/{product_id}?supermarket_id=xxx`
Evolución de precios de un producto.

#### GET `/api/analytics/compare/{product_id}`
Comparación de precios entre supermercados.

### Búsqueda

#### GET `/api/search/products?q=leche&category_id=xxx&brand_id=xxx`
Busca productos con filtros.

---

## Scripts Útiles

### Crear usuario administrador

```python
# create_admin.py
import bcrypt
import uuid
from datetime import datetime, timezone
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['pricehive']

admin_id = str(uuid.uuid4())
password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

db.users.insert_one({
    'id': admin_id,
    'email': 'admin@pricehive.com',
    'password': password,
    'name': 'Administrador',
    'role': 'admin',
    'points': 0,
    'created_at': datetime.now(timezone.utc).isoformat()
})

print('Admin created: admin@pricehive.com / admin123')
```

### Seed datos iniciales

```python
# seed_data.py
import uuid
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['pricehive']

# Unidades
units = [
    {'id': str(uuid.uuid4()), 'name': 'Unidad', 'abbreviation': 'ud'},
    {'id': str(uuid.uuid4()), 'name': 'Kilogramo', 'abbreviation': 'kg'},
    {'id': str(uuid.uuid4()), 'name': 'Litro', 'abbreviation': 'L'},
    {'id': str(uuid.uuid4()), 'name': 'Gramo', 'abbreviation': 'g'},
]
for u in units:
    if not db.units.find_one({'name': u['name']}):
        db.units.insert_one(u)

# Supermercados
supermarkets = [
    {'id': str(uuid.uuid4()), 'name': 'Mercadona', 'logo_url': None},
    {'id': str(uuid.uuid4()), 'name': 'Carrefour', 'logo_url': None},
    {'id': str(uuid.uuid4()), 'name': 'Lidl', 'logo_url': None},
    {'id': str(uuid.uuid4()), 'name': 'Aldi', 'logo_url': None},
]
for s in supermarkets:
    if not db.supermarkets.find_one({'name': s['name']}):
        db.supermarkets.insert_one(s)

# Categorías
categories = [
    {'id': str(uuid.uuid4()), 'name': 'Lácteos', 'description': 'Leche, yogures, quesos'},
    {'id': str(uuid.uuid4()), 'name': 'Frutas y Verduras', 'description': 'Productos frescos'},
    {'id': str(uuid.uuid4()), 'name': 'Carnes', 'description': 'Pollo, cerdo, ternera'},
    {'id': str(uuid.uuid4()), 'name': 'Bebidas', 'description': 'Refrescos, agua, zumos'},
]
for c in categories:
    if not db.categories.find_one({'name': c['name']}):
        db.categories.insert_one(c)

# Marcas
brands = [
    {'id': str(uuid.uuid4()), 'name': 'Hacendado', 'logo_url': None},
    {'id': str(uuid.uuid4()), 'name': 'Carrefour', 'logo_url': None},
    {'id': str(uuid.uuid4()), 'name': 'Danone', 'logo_url': None},
    {'id': str(uuid.uuid4()), 'name': 'Coca-Cola', 'logo_url': None},
]
for b in brands:
    if not db.brands.find_one({'name': b['name']}):
        db.brands.insert_one(b)

print('Seed data created successfully!')
```

---

## Troubleshooting

### Error: "MongoDB connection refused"
- Verificar que MongoDB está corriendo: `sudo systemctl status mongod`
- Verificar URL de conexión en `.env`

### Error: "CORS policy"
- Añadir dominio del frontend a `CORS_ORIGINS`
- Reiniciar backend

### Error: "Google OAuth redirect"
- Verificar que la URL de callback coincide exactamente

### Error: "Session expired"
- Las sesiones duran 7 días por defecto
- Verificar que las cookies están habilitadas

---

## Contacto y Soporte

Para dudas técnicas o contribuciones, contactar al equipo de desarrollo.
