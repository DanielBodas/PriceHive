# PriceHive - Manual de Administrador

## Índice
1. [Introducción](#introducción)
2. [Acceso al Panel de Administración](#acceso-al-panel-de-administración)
3. [Gestión de Categorías](#gestión-de-categorías)
4. [Gestión de Marcas](#gestión-de-marcas)
5. [Gestión de Supermercados](#gestión-de-supermercados)
6. [Gestión de Unidades](#gestión-de-unidades)
7. [Gestión de Productos](#gestión-de-productos)
8. [Flujo de Trabajo Recomendado](#flujo-de-trabajo-recomendado)
9. [Mejores Prácticas](#mejores-prácticas)
10. [Troubleshooting](#troubleshooting)

---

## Introducción

Como Administrador de PriceHive, tu rol es mantener la **base de datos de productos** limpia y organizada. Esto es fundamental porque:

- Los usuarios solo pueden seleccionar productos predefinidos
- Una estructura limpia permite comparativas precisas
- Evita duplicados y datos inconsistentes

### Responsabilidades del Administrador

1. **Crear y mantener categorías** de productos
2. **Gestionar marcas** disponibles
3. **Añadir supermercados** de la zona
4. **Definir unidades** de medida
5. **Crear productos** vinculando todo lo anterior

---

## Acceso al Panel de Administración

### Requisitos

- Tener una cuenta con rol `admin`
- Estar logueado en la aplicación

### Cómo Acceder

1. Inicia sesión con tu cuenta de administrador
2. En el menú superior, verás la opción **"Admin"**
3. Haz clic para acceder al panel

> **Nota**: Si no ves la opción "Admin", contacta con el administrador del sistema para que te asigne el rol.

### Crear un Administrador (Base de Datos)

```python
# Script para crear admin
import bcrypt
import uuid
from datetime import datetime, timezone
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['pricehive']

admin_id = str(uuid.uuid4())
password = bcrypt.hashpw('tu_password'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

db.users.insert_one({
    'id': admin_id,
    'email': 'admin@tudominio.com',
    'password': password,
    'name': 'Nombre Admin',
    'role': 'admin',  # ← Importante: role = 'admin'
    'points': 0,
    'created_at': datetime.now(timezone.utc).isoformat()
})
```

---

## Gestión de Categorías

Las categorías agrupan productos similares (ej: Lácteos, Frutas, Bebidas).

### Ver Categorías

1. En el Panel Admin, haz clic en la pestaña **"Categorías"**
2. Verás una tabla con todas las categorías existentes

### Crear Categoría

1. Haz clic en **"Añadir Categoría"**
2. Rellena los campos:
   - **Nombre** (obligatorio): Ej. "Lácteos"
   - **Descripción** (opcional): Ej. "Leche, yogures, quesos, mantequilla"
3. Haz clic en **"Guardar"**

### Editar Categoría

1. Haz clic en el icono de lápiz ✏️ de la categoría
2. Modifica los campos necesarios
3. Haz clic en **"Guardar"**

### Eliminar Categoría

1. Haz clic en el icono de papelera 🗑️
2. Confirma la eliminación

> ⚠️ **Cuidado**: Eliminar una categoría no elimina los productos asociados, pero quedarán sin categoría.

### Categorías Sugeridas

| Categoría | Descripción |
|-----------|-------------|
| Lácteos | Leche, yogures, quesos, mantequilla |
| Frutas y Verduras | Productos frescos |
| Carnes | Pollo, cerdo, ternera, cordero |
| Pescados | Pescado fresco y congelado |
| Panadería | Pan, bollería |
| Bebidas | Refrescos, agua, zumos, café, té |
| Conservas | Latas, botes |
| Congelados | Productos congelados |
| Limpieza | Productos de limpieza del hogar |
| Higiene | Productos de higiene personal |
| Mascotas | Comida y accesorios para mascotas |

---

## Gestión de Marcas

Las marcas identifican al fabricante o distribuidor del producto.

### Ver Marcas

1. En el Panel Admin, haz clic en la pestaña **"Marcas"**
2. Verás una tabla con todas las marcas

### Crear Marca

1. Haz clic en **"Añadir Marca"**
2. Rellena:
   - **Nombre** (obligatorio): Ej. "Hacendado"
3. Haz clic en **"Guardar"**

### Marcas Comunes en España

| Tipo | Marcas |
|------|--------|
| Marca blanca | Hacendado (Mercadona), Carrefour, Lidl, Aldi |
| Lácteos | Danone, Pascual, Puleva, Central Lechera |
| Refrescos | Coca-Cola, Pepsi, Fanta, Kas |
| Conservas | Gvtarra, Orlando, Hero |
| Limpieza | Fairy, Mistol, KH-7 |

---

## Gestión de Supermercados

Los supermercados son los establecimientos donde los usuarios compran.

### Ver Supermercados

1. En el Panel Admin, haz clic en la pestaña **"Supermercados"**
2. Verás una tabla con todos los supermercados

### Crear Supermercado

1. Haz clic en **"Añadir Supermercado"**
2. Rellena:
   - **Nombre** (obligatorio): Ej. "Mercadona"
3. Haz clic en **"Guardar"**

### Supermercados Sugeridos (España)

| Supermercado | Tipo |
|--------------|------|
| Mercadona | Supermercado |
| Carrefour | Hipermercado / Super |
| Lidl | Discount |
| Aldi | Discount |
| Dia | Supermercado |
| Eroski | Supermercado |
| Alcampo | Hipermercado |
| El Corte Inglés | Supermercado premium |
| Consum | Supermercado |
| BonPreu | Supermercado (Cataluña) |

---

## Gestión de Unidades

Las unidades de medida definen cómo se miden los productos.

### Ver Unidades

1. En el Panel Admin, haz clic en la pestaña **"Unidades"**
2. Verás una tabla con todas las unidades

### Crear Unidad

1. Haz clic en **"Añadir Unidad"**
2. Rellena:
   - **Nombre** (obligatorio): Ej. "Kilogramo"
   - **Abreviatura** (obligatorio): Ej. "kg"
3. Haz clic en **"Guardar"**

### Unidades Estándar

| Nombre | Abreviatura | Uso |
|--------|-------------|-----|
| Unidad | ud | Productos individuales |
| Kilogramo | kg | Peso (frutas, carnes) |
| Gramo | g | Peso pequeño (embutidos) |
| Litro | L | Volumen (leche, aceite) |
| Mililitro | ml | Volumen pequeño (salsas) |
| Pack | pack | Packs de varios |
| Docena | doc | 12 unidades (huevos) |
| Botella | bot | Bebidas |
| Lata | lata | Conservas, refrescos |

---

## Gestión de Productos

Los productos son el núcleo de PriceHive. Cada producto está vinculado a una categoría, marca y unidad.

### Ver Productos

1. En el Panel Admin, haz clic en la pestaña **"Productos"**
2. Verás una tabla con todos los productos

### Crear Producto

1. Haz clic en **"Añadir Producto"**
2. Rellena los campos:

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| **Nombre** | ✅ Sí | Nombre descriptivo del producto |
| **Marca** | ✅ Sí | Marca del fabricante |
| **Categoría** | ✅ Sí | Categoría del producto |
| **Unidad** | ✅ Sí | Unidad de medida estándar |
| **Código de barras** | No | EAN-13 del producto |

3. Haz clic en **"Guardar"**

### Convenciones de Nombres

Para mantener consistencia, sigue estas reglas:

#### Formato Recomendado
```
[Producto] [Variante] [Tamaño/Cantidad]
```

#### Ejemplos

| ✅ Correcto | ❌ Incorrecto |
|------------|---------------|
| Leche Entera 1L | Leche |
| Leche Desnatada 1L | leche desnatada |
| Yogur Natural Pack 4 | YOGUR NATURAL |
| Aceite Oliva Virgen Extra 1L | Aceite de oliva |
| Coca-Cola 2L | Coca Cola |
| Pan de Molde Integral | pan molde |

#### Reglas

1. **Primera letra mayúscula** en cada palabra principal
2. **Incluir variante** (Entera, Desnatada, Integral, etc.)
3. **Incluir tamaño** si es relevante (1L, 500g, Pack 6)
4. **No usar abreviaturas** innecesarias
5. **No duplicar la marca** en el nombre (ya está en campo separado)

---

## Flujo de Trabajo Recomendado

### Añadir un Producto Nuevo (Completo)

```
1. CATEGORÍA
   └─ ¿Existe la categoría?
      ├─ SÍ → Continuar
      └─ NO → Crear categoría

2. MARCA
   └─ ¿Existe la marca?
      ├─ SÍ → Continuar
      └─ NO → Crear marca

3. UNIDAD
   └─ ¿Existe la unidad?
      ├─ SÍ → Continuar
      └─ NO → Crear unidad

4. PRODUCTO
   └─ Crear producto con:
      ├─ Nombre descriptivo
      ├─ Marca seleccionada
      ├─ Categoría seleccionada
      └─ Unidad seleccionada
```

### Setup Inicial (Base de Datos Vacía)

1. **Paso 1**: Crear todas las categorías principales
2. **Paso 2**: Crear todas las unidades estándar
3. **Paso 3**: Crear las marcas más comunes
4. **Paso 4**: Crear los supermercados de la zona
5. **Paso 5**: Empezar a crear productos

### Script de Setup Inicial

```python
# seed_complete.py
import uuid
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['pricehive']

# Unidades
units = [
    {'id': str(uuid.uuid4()), 'name': 'Unidad', 'abbreviation': 'ud'},
    {'id': str(uuid.uuid4()), 'name': 'Kilogramo', 'abbreviation': 'kg'},
    {'id': str(uuid.uuid4()), 'name': 'Gramo', 'abbreviation': 'g'},
    {'id': str(uuid.uuid4()), 'name': 'Litro', 'abbreviation': 'L'},
    {'id': str(uuid.uuid4()), 'name': 'Mililitro', 'abbreviation': 'ml'},
    {'id': str(uuid.uuid4()), 'name': 'Pack', 'abbreviation': 'pack'},
]
for u in units:
    if not db.units.find_one({'name': u['name']}):
        db.units.insert_one(u)
        print(f"Unidad creada: {u['name']}")

# Categorías
categories = [
    {'id': str(uuid.uuid4()), 'name': 'Lácteos', 'description': 'Leche, yogures, quesos'},
    {'id': str(uuid.uuid4()), 'name': 'Frutas y Verduras', 'description': 'Productos frescos'},
    {'id': str(uuid.uuid4()), 'name': 'Carnes', 'description': 'Pollo, cerdo, ternera'},
    {'id': str(uuid.uuid4()), 'name': 'Pescados', 'description': 'Pescado fresco y congelado'},
    {'id': str(uuid.uuid4()), 'name': 'Panadería', 'description': 'Pan y bollería'},
    {'id': str(uuid.uuid4()), 'name': 'Bebidas', 'description': 'Refrescos, agua, zumos'},
    {'id': str(uuid.uuid4()), 'name': 'Conservas', 'description': 'Latas y botes'},
    {'id': str(uuid.uuid4()), 'name': 'Limpieza', 'description': 'Productos de limpieza'},
    {'id': str(uuid.uuid4()), 'name': 'Higiene', 'description': 'Higiene personal'},
]
for c in categories:
    if not db.categories.find_one({'name': c['name']}):
        db.categories.insert_one(c)
        print(f"Categoría creada: {c['name']}")

# Supermercados
supermarkets = [
    {'id': str(uuid.uuid4()), 'name': 'Mercadona', 'logo_url': None},
    {'id': str(uuid.uuid4()), 'name': 'Carrefour', 'logo_url': None},
    {'id': str(uuid.uuid4()), 'name': 'Lidl', 'logo_url': None},
    {'id': str(uuid.uuid4()), 'name': 'Aldi', 'logo_url': None},
    {'id': str(uuid.uuid4()), 'name': 'Dia', 'logo_url': None},
    {'id': str(uuid.uuid4()), 'name': 'Eroski', 'logo_url': None},
]
for s in supermarkets:
    if not db.supermarkets.find_one({'name': s['name']}):
        db.supermarkets.insert_one(s)
        print(f"Supermercado creado: {s['name']}")

# Marcas
brands = [
    {'id': str(uuid.uuid4()), 'name': 'Hacendado', 'logo_url': None},
    {'id': str(uuid.uuid4()), 'name': 'Carrefour', 'logo_url': None},
    {'id': str(uuid.uuid4()), 'name': 'Lidl', 'logo_url': None},
    {'id': str(uuid.uuid4()), 'name': 'Danone', 'logo_url': None},
    {'id': str(uuid.uuid4()), 'name': 'Pascual', 'logo_url': None},
    {'id': str(uuid.uuid4()), 'name': 'Coca-Cola', 'logo_url': None},
    {'id': str(uuid.uuid4()), 'name': 'Nestlé', 'logo_url': None},
]
for b in brands:
    if not db.brands.find_one({'name': b['name']}):
        db.brands.insert_one(b)
        print(f"Marca creada: {b['name']}")

print("\n✅ Setup inicial completado!")
```

---

## Mejores Prácticas

### ✅ Hacer

1. **Revisar antes de crear**: Comprueba que no existe ya algo similar
2. **Usar nombres consistentes**: Sigue las convenciones de nombres
3. **Categorizar correctamente**: Un producto mal categorizado confunde
4. **Documentar cambios**: Si eliminas algo, comunícalo al equipo
5. **Backup periódico**: Haz copias de seguridad de la BD

### ❌ No Hacer

1. **No crear duplicados**: "Leche" y "leche" son diferentes
2. **No eliminar en producción sin revisar**: Puede afectar a datos de usuarios
3. **No usar abreviaturas extrañas**: Usa nombres claros
4. **No mezclar idiomas**: Mantén todo en español
5. **No crear productos genéricos**: "Leche Entera 1L" mejor que solo "Leche"

### Cómo Manejar Duplicados

Si detectas duplicados:

1. Identifica cuál es el "correcto" (mejor nombre, más precios asociados)
2. **No elimines directamente** - puede haber datos asociados
3. Contacta con desarrollo para migrar los datos si es necesario
4. Luego elimina el duplicado

---

## Troubleshooting

### No puedo ver el Panel de Admin

**Causa**: Tu cuenta no tiene rol `admin`.

**Solución**:
```javascript
// En MongoDB
db.users.updateOne(
  { email: "tu@email.com" },
  { $set: { role: "admin" } }
)
```

### Error al crear producto: "Brand not found"

**Causa**: Seleccionaste una marca que fue eliminada.

**Solución**: Recarga la página y vuelve a seleccionar.

### Los usuarios no ven un producto nuevo

**Causa**: Puede haber caché en el frontend.

**Solución**: Pide a los usuarios que recarguen la página (Ctrl+F5).

### No puedo eliminar una categoría

**Causa**: Puede haber productos asociados.

**Solución**: Primero mueve los productos a otra categoría, luego elimina.

---

## Comandos Útiles (MongoDB)

### Ver estadísticas
```javascript
// Contar elementos
db.products.countDocuments()
db.categories.countDocuments()
db.brands.countDocuments()
db.supermarkets.countDocuments()
db.units.countDocuments()
db.prices.countDocuments()
```

### Buscar duplicados
```javascript
// Productos con nombre duplicado
db.products.aggregate([
  { $group: { _id: "$name", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])
```

### Exportar datos
```bash
# Exportar colección
mongoexport --db=pricehive --collection=products --out=products.json

# Importar colección
mongoimport --db=pricehive --collection=products --file=products.json
```

---

## Contacto Técnico

Para problemas técnicos que no puedas resolver, contacta con el equipo de desarrollo.

---

**¡Gracias por mantener PriceHive organizado!** 🐝
