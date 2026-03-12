# Plan de Adaptación Móvil - PriceHive

Este documento detalla el análisis del proyecto actual y la estrategia propuesta para su adaptación a una aplicación móvil.

## 1. Análisis de la Arquitectura Actual

### Lenguajes Usados
- **Frontend:** JavaScript (ES6+), HTML5, CSS3.
- **Backend:** Python 3.11.

### Frameworks y Librerías
- **Frontend:** React 19, Tailwind CSS (estilos), Shadcn/UI (componentes), Lucide React (iconos), Axios (API), React Router DOM (navegación).
- **Backend:** FastAPI, Motor (MongoDB async), Pydantic.

### Estructura del Proyecto
El proyecto sigue una estructura de monorepositorio:
- `frontend/`: Aplicación Single Page (SPA) en React.
- `backend/`: API RESTful en FastAPI.
- `docs/`: Documentación técnica.

### Dependencias del Entorno Web
- **Almacenamiento:** Uso de `localStorage` para persistencia de tokens JWT.
- **Navegación:** Dependencia de `window.location` (hash, href) y `window.history` para flujos de OAuth y navegación interna.
- **Interacción:** Uso de `window.confirm` para diálogos de confirmación.
- **DOM:** Renderizado en un elemento raíz (`document.getElementById("root")`).
- **Layout:** Diseñado con Tailwind CSS, optimizado para desktop y móvil mediante Media Queries.

---

## 2. Identificación de Partes Críticas para Móvil

Las siguientes partes dependen del navegador y deben ser modificadas o abstraídas:

1.  **Gestión de Tokens (`AuthContext.js`):** `localStorage` no siempre es la mejor opción en apps nativas (por persistencia y seguridad).
2.  **OAuth de Google:** El flujo actual usa redirecciones de ventana completa (`window.location.href`). En móvil, esto debe manejarse mediante Custom Tabs o un flujo nativo para evitar que el usuario salga de la app.
3.  **Confirmaciones Nativas:** `window.confirm` tiene una apariencia pobre en móvil y bloquea el hilo principal.
4.  **Safe Areas:** El layout web no tiene en cuenta los "notches" o barras de estado de los dispositivos modernos (iOS/Android).

---

## 3. Estrategia de Adaptación Propuesta

### Opción Recomendada: **App Híbrida con Capacitor**

**Por qué:**
- **Reutilización:** Permite mantener el 95% del código actual (React + Tailwind).
- **Acceso Nativo:** Proporciona un puente para usar APIs nativas (Cámara, Geolocalización, Notificaciones Push).
- **Mantenimiento:** Un solo codebase para Web, iOS y Android.
- **Velocidad:** Es la forma más rápida de llegar al mercado aprovechando que la UI ya es responsive.

---

## 4. Cambios y Nuevos Archivos

### Archivos que deben cambiar:
- `frontend/src/contexts/AuthContext.js`: Abstraer el almacenamiento de tokens.
- `frontend/src/components/Layout.js`: Ajustar padding para "Safe Areas" y mejorar la barra de navegación inferior.
- `frontend/src/pages/*`: Reemplazar `window.confirm` por componentes de diálogo de Shadcn/UI.

### Nuevos archivos a crear:
- `frontend/src/lib/storage.js`: Un servicio unificado de persistencia.
- `frontend/capacitor.config.json`: Configuración del entorno híbrido.
- `frontend/src/hooks/useNativeHardware.js`: Hook para manejar funciones del dispositivo.

---

## 5. Ejemplos de Código Adaptado

### A. Abstracción de Almacenamiento (`src/lib/storage.js`)

```javascript
// Servicio para manejar persistencia en Web y Nativo
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const isNative = Capacitor.isNativePlatform();

export const storage = {
  async set(key, value) {
    if (isNative) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  },
  async get(key) {
    if (isNative) {
      const { value } = await Preferences.get({ key });
      return value;
    }
    return localStorage.getItem(key);
  },
  async remove(key) {
    if (isNative) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  }
};
```

### B. Adaptación de AuthContext (`src/contexts/AuthContext.js`)

```javascript
// Antes: localStorage.getItem('token')
// Después:
import { storage } from '../lib/storage';

// Dentro del Provider
useEffect(() => {
    const initializeAuth = async () => {
        const token = await storage.get('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            await fetchUser();
        }
        setLoading(false);
    };
    initializeAuth();
}, []);
```

### C. Layout con Safe Areas (Tailwind)

En `Layout.js`, añadir soporte para el área física del dispositivo:

```jsx
// En el contenedor principal
<div className="min-h-screen bg-slate-50 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
    {/* ... */}
</div>
```

---

## 6. Comparativa de Soluciones

| Característica | PWA | Hybrid (Capacitor) | React Native |
| :--- | :--- | :--- | :--- |
| **Esfuerzo** | Muy Bajo | Bajo | Alto (Reescritura UI) |
| **Performance** | Media | Media-Alta | Muy Alta |
| **Acceso Nativo** | Limitado | Completo | Completo |
| **Tiendas (AppStore/PlayStore)** | No (fácilmente) | Sí | Sí |

**Recomendación Final:** Usar **Capacitor** es la solución más sencilla de mantener y la que mejor aprovecha la inversión actual en React/Tailwind, permitiendo una experiencia de usuario casi nativa con un coste de desarrollo mínimo.
