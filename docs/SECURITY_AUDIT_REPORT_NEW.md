# Informe de Auditoría de Seguridad - PriceHive

## Resumen Ejecutivo

**Fecha:** Octubre 2024
**Auditor:** Senior Cybersecurity Engineer & Application Security Auditor
**Nivel de Riesgo Global:** **Crítico**

La auditoría de seguridad del repositorio PriceHive ha revelado varias vulnerabilidades críticas y de severidad alta que deben corregirse antes de que la aplicación se despliegue en un entorno de producción. Los problemas más urgentes incluyen una vulnerabilidad de **Inyección de Regex** en la funcionalidad de búsqueda, **secretos sensibles hardcodeados** en la configuración del backend y una gran cantidad de **dependencias de terceros vulnerables** en el frontend.

Aunque la aplicación sigue un patrón arquitectónico moderno (FastAPI + React), la implementación de controles de seguridad en torno a la autenticación, validación de datos y gestión de dependencias es actualmente insuficiente para un sistema de nivel de producción.

---

## Resumen de Hallazgos

| ID | Título | Severidad | Prioridad |
|---|---|---|---|
| SEC-001 | Inyección de Regex en Búsqueda de Productos | Crítica | P0 |
| SEC-002 | Clave Secreta JWT Hardcodeada | Alta | P1 |
| SEC-003 | Dependencias de Frontend Inseguras (42+ CVEs) | Alta | P1 |
| SEC-004 | Almacenamiento de Tokens Inseguro (localStorage) | Media | P2 |
| SEC-005 | Exposición de Datos Sensibles en Fragmentos de URL | Media | P2 |
| SEC-006 | DoS Potencial vía `ast.literal_eval` en Importación Admin | Media | P2 |
| SEC-007 | Falta de Aplicación de Entorno de Producción | Baja | P3 |

---

## Hallazgos

### SEC-001: Inyección de Regex en Búsqueda de Productos
*   **Severidad:** Crítica
*   **Archivo / línea:** `backend/app/routers/search.py`, línea 17
*   **Descripción técnica:** El endpoint `search_products` utiliza la entrada del usuario `q` directamente en una consulta `$regex` de MongoDB sin sanitización. Un atacante puede proporcionar una expresión regular especialmente diseñada (ej. `(a+)+$`) para causar "Backtracking Catastrófico", lo que lleva a una Denegación de Servicio (DoS) de la base de datos y del backend.
*   **Impacto:** Indisponibilidad completa del servicio (DoS). Potencial para exfiltración de datos si se combina con otras técnicas.
*   **Escenario de explotación:** Un atacante envía una solicitud GET a `/api/search/products?q=(a+)+$` con una cadena larga de 'a's, lo que hace que la CPU suba al 100% y bloquee el backend.
*   **Recomendación de remediación:** Escapar siempre la entrada del usuario antes de usarla en una expresión regular.
*   **Ejemplo de código corregido:**
    ```python
    import re
    # ...
    if q:
        query["name"] = {"$regex": re.escape(q), "$options": "i"}
    ```

### SEC-002: Clave Secreta JWT Hardcodeada
*   **Severidad:** Alta
*   **Archivo / línea:** `backend/app/core/config.py`, línea 12
*   **Descripción técnica:** El `JWT_SECRET` tiene un valor predeterminado hardcodeado: `"pricehive_super_secret_key_2024"`. Si esto no se sobrescribe en producción, cualquier atacante que conozca esta clave (está en el código fuente) puede forjar tokens JWT válidos y obtener acceso no autorizado a cualquier cuenta de usuario, incluidas las cuentas de administrador.
*   **Impacto:** Bypass completo de autenticación y acceso administrativo no autorizado.
*   **Escenario de explotación:** Un atacante utiliza la clave hardcodeada para firmar un JWT con `role: "admin"` y acceder a los endpoints protegidos de `/api/admin/*`.
*   **Recomendación de remediación:** Eliminar el valor predeterminado hardcodeado y obligar a que la aplicación falle al iniciar si no se proporciona `JWT_SECRET` en las variables de entorno.
*   **Ejemplo de código corregido:**
    ```python
    JWT_SECRET: str = os.environ.get("JWT_SECRET")
    if not JWT_SECRET:
        raise ValueError("JWT_SECRET environment variable is not set")
    ```

### SEC-003: Dependencias de Frontend Inseguras (42+ CVEs)
*   **Severidad:** Alta
*   **Archivo / línea:** `frontend/package.json` / `package-lock.json`
*   **Descripción técnica:** El proyecto frontend utiliza varias librerías obsoletas con vulnerabilidades conocidas, incluyendo `axios` (SSRF/DoS), `lodash` (RCE/Prototype Pollution) y `react-scripts`. Se detectaron un total de 42 vulnerabilidades, 22 de las cuales son de severidad Alta.
*   **Impacto:** Cross-Site Scripting (XSS), Denegación de Servicio (DoS) y potencial ejecución remota de código (RCE) en el pipeline de build o en los navegadores de los clientes.
*   **Escenario de explotación:** Aprovechar una vulnerabilidad en `axios` para realizar un Server-Side Request Forgery (SSRF) si el frontend realiza solicitudes a recursos internos basadas en datos no sanitizados.
*   **Recomendación de remediación:** Ejecutar `npm audit fix` y actualizar manualmente las versiones mayores de los paquetes vulnerables.

### SEC-004: Almacenamiento de Tokens Inseguro (localStorage)
*   **Severidad:** Media
*   **Archivo / línea:** `frontend/src/contexts/AuthContext.js`
*   **Descripción técnica:** Los tokens de acceso JWT se almacenan en `localStorage`. A diferencia de las cookies `HttpOnly`, `localStorage` es accesible para cualquier script que se ejecute en la página, lo que hace que los tokens sean vulnerables al robo mediante Cross-Site Scripting (XSS).
*   **Impacto:** Robo de cuenta si la aplicación se ve comprometida por un ataque XSS.
*   **Recomendación de remediación:** Mover el almacenamiento de JWT a cookies `HttpOnly` y `Secure`.

### SEC-005: Exposición de Datos Sensibles en Fragmentos de URL
*   **Severidad:** Media
*   **Archivo / línea:** `backend/app/routers/auth.py`, línea 89
*   **Descripción técnica:** Después de un inicio de sesión exitoso con Google OAuth, el backend redirige al usuario al frontend con un `session_id` en el fragmento de la URL: `/#session_id=...`. Los fragmentos pueden filtrarse en los encabezados `Referer` a dominios de terceros o almacenarse en el historial del navegador.
*   **Impacto:** Potencial secuestro de sesión si la URL se filtra.
*   **Recomendación de remediación:** Utilizar un código de autorización temporal de corta duración o una cookie segura para intercambiar la sesión por un JWT, en lugar de pasarla en la URL.

### SEC-006: DoS Potencial vía `ast.literal_eval` en Importación Admin
*   **Severidad:** Media
*   **Archivo / línea:** `backend/app/routers/admin.py`, línea 814
*   **Descripción técnica:** Durante el proceso de importación de datos del sistema, el backend utiliza `ast.literal_eval` para parsear cadenas que parecen diccionarios o listas. Aunque es más seguro que `eval()`, el procesamiento de estructuras profundamente anidadas o maliciosamente diseñadas puede llevar al agotamiento de la pila (DoS).
*   **Impacto:** Denegación de servicio durante las operaciones administrativas.
*   **Recomendación de remediación:** Utilizar `json.loads()` para parsear datos estructurados y asegurar una validación de esquema estricta utilizando modelos Pydantic.

---

## Security Score: 45/100

**Justificación:**
- **Controles de Seguridad Críticos (-20):** Los secretos hardcodeados y el almacenamiento de tokens inseguro son debilidades significativas.
- **Validación de Entradas (-15):** La presencia de Inyección de Regex indica una falta de programación defensiva en el manejo de datos.
- **Gestión de Dependencias (-15):** 42 vulnerabilidades en el stack de frontend es inaceptable para producción.
- **Arquitectura (+25):** El uso de FastAPI/Pydantic proporciona cierta protección inherente (como la comprobación de tipos) y el flujo de OAuth está implementado, aunque con algunos fallos.
- **Calidad del Código (+10):** El código está generalmente bien estructurado y utiliza librerías modernas.

---

## Prioridad de remediación

### P0 (Inmediato)
1. **Corregir Inyección de Regex:** Sanitizar las entradas de búsqueda en `backend/app/routers/search.py`.
2. **Asegurar Secretos:** Eliminar `JWT_SECRET` hardcodeado y forzar el uso de variables de entorno.

### P1 (Alta)
1. **Actualizar Dependencias:** Ejecutar `npm audit fix --force` y resolver todos los CVEs de severidad Alta/Crítica.
2. **Auditar CORS:** Asegurar que `allow_origins` esté estrictamente limitado a los dominios de producción en `main.py`.

### P2 (Media)
1. **Refactorizar Almacenamiento de Auth:** Transicionar de `localStorage` a cookies `HttpOnly`.
2. **Asegurar Redirección de OAuth:** Cambiar la forma en que el `session_id` se transmite al frontend.
3. **Reforzar Importación Admin:** Reemplazar `ast.literal_eval` con parseo JSON y validación de esquema.

### P3 (Mejora)
1. **Implementar Registro de Eventos de Seguridad:** Registrar intentos de inicio de sesión fallidos y acciones administrativas.
2. **Añadir Encabezados de Seguridad:** Implementar CSP (Content Security Policy) y otros encabezados de seguridad en la respuesta del backend.

---
**Aviso:** Esta auditoría se basa en una revisión estática del código proporcionado. Se recomienda una prueba de penetración completa y un análisis dinámico antes del lanzamiento final a producción.
