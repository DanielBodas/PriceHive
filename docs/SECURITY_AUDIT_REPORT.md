# Reporte de Auditoría de Seguridad - PriceHive

Este documento detalla los hallazgos de la auditoría de seguridad realizada sobre el proyecto PriceHive.

## 1. Hallazgos de Seguridad

### 1.1 Inyección de Expresiones Regulares (Regex Injection)
*   **Tipo de vulnerabilidad**: Inyección de RegEx / Denegación de Servicio (ReDoS)
*   **Nivel de riesgo**: Alto
*   **Archivo**: `backend/app/routers/search.py`, línea 18 (aprox.)
*   **Explicación técnica**: El parámetro de búsqueda `q` se pasaba directamente a un operador `$regex` de MongoDB sin sanitización.
*   **Cómo podría explotarse**: Un atacante podría enviar caracteres especiales de RegEx (como `.*.*.*.*.*!`) para causar un "Catastrophic Backtracking" en el motor de expresiones regulares, consumiendo CPU excesiva y provocando un DoS.
*   **Estado**: **CORREGIDO**
*   **Ejemplo de código corregido**:
    ```python
    import re
    # ...
    if q:
        safe_q = re.escape(q)
        query["name"] = {"$regex": safe_q, "$options": "i"}
    ```

### 1.2 Gestión Insegura de Secretos (Hardcoded Secret)
*   **Tipo de vulnerabilidad**: Exposición de Secretos
*   **Nivel de riesgo**: Crítico
*   **Archivo**: `backend/app/core/config.py`
*   **Explicación técnica**: El `JWT_SECRET` tenía un valor por defecto en el código. Si no se configura una variable de entorno, el sistema usa una clave conocida.
*   **Cómo podría explotarse**: Si un atacante conoce el secreto (ya que está en el código), puede forjar tokens JWT válidos para cualquier usuario, incluyendo administradores, logrando acceso total.
*   **Estado**: **CORREGIDO** (Se eliminó el valor por defecto).
*   **Ejemplo de código corregido**:
    ```python
    JWT_SECRET: str = os.environ.get("JWT_SECRET") # Sin valor por defecto inseguro
    ```

### 1.3 Almacenamiento de Tokens en LocalStorage
*   **Tipo de vulnerabilidad**: Inseguridad en el lado del cliente (XSS Risk)
*   **Nivel de riesgo**: Medio
*   **Archivo**: `frontend/src/contexts/AuthContext.js`
*   **Explicación técnica**: El token JWT se almacena en `localStorage`. A diferencia de las cookies `HttpOnly`, `localStorage` es accesible mediante JavaScript.
*   **Cómo podría explotarse**: Si la aplicación sufre una vulnerabilidad XSS en cualquier parte, el atacante puede robar el token de acceso del usuario fácilmente.
*   **Cómo solucionarlo**: Utilizar Cookies con atributos `HttpOnly`, `Secure` y `SameSite=Strict`.

### 1.4 Exposición de Session ID en Fragmento de URL (OAuth)
*   **Tipo de vulnerabilidad**: Fuga de Información Sensible
*   **Nivel de riesgo**: Medio
*   **Archivo**: `backend/app/routers/auth.py` y `frontend/src/components/AuthCallback.js`
*   **Explicación técnica**: El `session_id` se pasa del backend al frontend mediante un fragmento de URL (`#session_id=...`).
*   **Cómo podría explotarse**: Aunque los fragmentos no se envían al servidor en las peticiones HTTP, quedan en el historial del navegador y podrían ser capturados por scripts maliciosos o extensiones antes de ser limpiados.
*   **Cómo solucionarlo**: Intercambiar el código de autorización de OAuth directamente por una cookie de sesión segura desde el backend.

### 1.5 Configuración de CORS Permisiva
*   **Tipo de vulnerabilidad**: Configuración de Seguridad Incorrecta
*   **Nivel de riesgo**: Bajo/Medio
*   **Archivo**: `backend/app/main.py`
*   **Explicación técnica**: Se permite explícitamente `localhost:3000` y se aceptan todos los headers.
*   **Cómo podría explotarse**: Facilita ataques de CSRF o acceso no autorizado desde entornos de desarrollo maliciosos si el usuario tiene una pestaña abierta en un sitio atacante.
*   **Cómo solucionarlo**: Definir orígenes exactos y restringir headers en producción.

---

## 2. Buenas prácticas que faltan
1.  **Seguridad en Cookies**: Uso de `HttpOnly` y `Secure` para tokens de sesión.
2.  **Headers de Seguridad (HSTS, CSP, X-Frame-Options)**: Faltan middlewares para aplicar headers de seguridad recomendados (OWASP).
3.  **Rate Limiting**: No hay protección contra fuerza bruta en endpoints de login o spam en creación de posts.
4.  **Sanitización de Salida**: Aunque React ayuda, no hay una política explícita de Content Security Policy (CSP).

---

## 3. Riesgos Arquitectónicos
*   **Dependencia de un único secreto**: La seguridad de toda la plataforma depende exclusivamente de `JWT_SECRET`. Se recomienda rotación de claves.
*   **Falta de validación de esquemas estricta en DB**: Al usar MongoDB sin una capa de validación fuerte en la DB (JSON Schema), cambios en los modelos de Pydantic podrían dejar datos inconsistentes o inyecciones parciales.

---

## 4. Checklist para Producción
- [ ] Cambiar `JWT_SECRET` a un valor aleatorio de 64 caracteres.
- [x] Desactivar el Swagger UI (`docs_url=None`) en producción (Implementado mediante variable `ENVIRONMENT`).
- [ ] Configurar el flag `secure=True` en todas las cookies.
- [ ] Implementar Rate Limiting (ej. `slowapi`).
- [ ] Configurar un firewall de aplicaciones web (WAF).

---

## 5. Recomendaciones de Hardening
*   **Backend**: Usar `Helmet` equivalent en FastAPI (como `secure-fastapi`) para headers.
*   **Database**: Habilitar autenticación en MongoDB y usar TLS para la conexión.
*   **Auth**: Implementar Refresh Tokens con rotación para minimizar el impacto de un robo de token de acceso.
