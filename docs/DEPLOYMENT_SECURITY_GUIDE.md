# Guía de Seguridad y Despliegue en Producción

Este documento resume las validaciones de seguridad realizadas y el impacto de los cambios técnicos en el proceso de despliegue de PriceHive.

## 1. Seguridad Validada y Corregida

### 🛡️ Protección contra DoS (Regex Injection)
Se ha validado que el motor de búsqueda sea inmune a ataques de "Catastrophic Backtracking".
- **Cambio**: Uso de `re.escape()` en todos los inputs de usuario que alimentan operadores `$regex`.
- **Impacto**: Mayor estabilidad del backend ante búsquedas malintencionadas.

### 🔐 Gestión de Secretos (Zero Default Policy)
Se ha eliminado la clave secreta hardcodeada en el código fuente.
- **Cambio**: `JWT_SECRET` ahora se lee estrictamente de las variables de entorno.
- **Impacto**: Eliminación del riesgo de suplantación de identidad por compromiso del código fuente.

---

## 2. Impacto en el Deployment (Producción)

### ⚠️ Acción Requerida: Configuración de Variables de Entorno
**El backend NO iniciará o fallará al validar tokens si no se configura explícitamente el secreto.**

Para un despliegue exitoso, asegúrese de configurar las siguientes variables en su entorno de producción (ej. Docker, Heroku, AWS, etc.):

| Variable | Descripción | Recomendación |
|----------|-------------|---------------|
| `JWT_SECRET` | Clave para firmar tokens | Generar una cadena aleatoria de al menos 64 caracteres. |
| `MONGO_URL` | Conexión a base de datos | Asegurar que incluya credenciales (User/Pass). |
| `FRONTEND_URL` | URL del cliente React | Debe coincidir exactamente para validar el CORS. |

### 🚀 Recomendaciones de Infraestructura
1.  **Terminación TLS/SSL**: El backend debe servirse exclusivamente bajo HTTPS para proteger los JWT en tránsito (aunque se almacenen en LocalStorage, la protección en tránsito es la primera línea de defensa).
2.  **CORS Estricto**: Asegúrese de que `CORS_ORIGINS` en el entorno incluya solo los dominios oficiales de producción.
3.  **Logs de Seguridad**: Monitorear errores 401/403 recurrentes que podrían indicar intentos de fuerza bruta o escaneo de IDs (IDOR).

---

## 3. Hoja de Ruta de Hardening (Post-Deployment)
1.  **Migración a Cookies HttpOnly**: Planificar el cambio de LocalStorage a Cookies para mitigar riesgos de XSS.
2.  **Implementación de Rate Limiting**: Añadir límites de peticiones por IP en el balanceador de carga o nivel de aplicación.
3.  **Content Security Policy (CSP)**: Configurar headers CSP en el servidor que sirve el frontend para restringir la ejecución de scripts no autorizados.
