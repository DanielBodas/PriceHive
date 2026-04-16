# Informe de Auditoría de Código: Código Obsoleto y Residual - PriceHive
**Fecha:** Mayo 2024
**Auditor:** Jules (Senior Software Architect)

## 1. Resumen Ejecutivo

El código base de PriceHive está generalmente bien estructurado, pero contiene una cantidad significativa de "lastre técnico" en forma de dependencias pesadas no utilizadas y componentes de UI residuales.

*   **Porcentaje estimado de código obsoleto:** ~12% (principalmente debido al exceso de dependencias).
*   **Hallazgos Principales:** Más de 13 librerías de Python sin uso, incluyendo `openai`, `boto3` y `stripe`. Varios componentes de Shadcn UI y un sistema de notificaciones redundante (Toaster vs Sonner).
*   **Recomendación:** Limpieza inmediata de `requirements.txt` y `package.json` para mejorar los tiempos de compilación, reducir el tamaño de las imágenes y minimizar la superficie de ataque.

---

## 2. Hallazgos por Categoría

### 2.1 Backend: Dependencias No Utilizadas (`backend/requirements.txt`)
**Nivel de Confianza: ALTO**

Estas librerías están presentes en el archivo de requerimientos pero NO tienen imports activos en el directorio `backend/app`.

| Librería | Propósito Original | Clasificación |
| :--- | :--- | :--- |
| `stripe` | Pagos | **Seguro para eliminar** |
| `boto3`, `botocore` | AWS SDK | **Seguro para eliminar** |
| `openai`, `litellm` | Integración de IA | **Seguro para eliminar** |
| `google-generativeai`, `google-genai`, `google-ai-generativelanguage` | Google AI | **Seguro para eliminar** |
| `hf-xet`, `huggingface_hub` | Hugging Face | **Seguro para eliminar** |
| `tiktoken`, `tokenizers` | Tokenización | **Seguro para eliminar** |
| `websockets` | Comunicación en tiempo real | **Seguro para eliminar** |

*Nota: `google-auth` y `httpx` SÍ se utilizan para el flujo de Google OAuth y deben permanecer.*

### 2.2 Frontend: Dependencias No Utilizadas (`frontend/package.json`)
**Nivel de Confianza: ALTO**

| Librería | Clasificación | Motivo |
| :--- | :--- | :--- |
| `@hookform/resolvers` | **Seguro para eliminar** | Sin imports encontrados. |
| `zod` | **Seguro para eliminar** | Sin imports encontrados. |
| `date-fns` | **Seguro para eliminar** | Sin imports encontrados. |

### 2.3 Frontend: Componentes y Hooks Residuales
**Nivel de Confianza: MUY ALTO**

La aplicación ha migrado a `sonner` para las notificaciones, dejando obsoleta la implementación original basada en el sistema de `toast` de Radix/Shadcn.

| Archivo | Tipo | Clasificación |
| :--- | :--- | :--- |
| `frontend/src/hooks/use-toast.js` | Hook | **Seguro para eliminar** |
| `frontend/src/components/ui/toaster.jsx` | Componente | **Seguro para eliminar** |
| `frontend/src/components/ui/toast.jsx` | Componente | **Seguro para eliminar** |
| `frontend/src/components/ui/calendar.jsx` | Componente UI | **Seguro para eliminar** |
| `frontend/src/components/ui/command.jsx` | Componente UI | **Seguro para eliminar** |
| `frontend/src/components/ui/drawer.jsx` | Componente UI | **Seguro para eliminar** |
| `frontend/src/components/ui/skeleton.jsx` | Componente UI | **Seguro para eliminar** |

### 2.4 Backend: Código Muerto y Artefactos Legacy
**Nivel de Confianza: MEDIO/ALTO**

| Artefacto | Ítem | Clasificación | Motivo |
| :--- | :--- | :--- | :--- |
| `backend/app/core/database.py` | `get_db` | **Seguro para eliminar** | La app usa el objeto global `db` directamente en los routers. |
| `backend/app/api/` | Directorio | **Seguro para eliminar** | Directorio vacío que solo contiene `__init__.py`. |
| `test_reports/*.json` | Archivos | **Revisar** | Reportes obsoletos de iteraciones previas de desarrollo. |
| `tests/` | Directorio | **No eliminar** | Actualmente vacío, pero es el placeholder estándar para futuras pruebas. |

---

## 3. Riesgo de Eliminación

*   **Impacto en Producción:** Mínimo. La eliminación de dependencias no utilizadas reducirá el tamaño de la imagen Docker y la superficie de vulnerabilidades.
*   **Despliegue (Render):** No se han encontrado referencias a las librerías marcadas en variables de entorno o scripts de construcción.
*   **Referencias Dinámicas:** Se utilizó `grep` para buscar referencias dinámicas por string a componentes y funciones; no se detectó ninguna.

---

## 4. Prioridad de Limpieza (Orden Sugerido)

1.  **Dependencias Backend:** Limpiar `requirements.txt` de librerías pesadas (AI, AWS, Stripe).
2.  **Notificaciones Frontend:** Eliminar `use-toast.js`, `toaster.jsx` y `toast.jsx`.
3.  **Componentes UI:** Eliminar componentes de Shadcn no utilizados (`calendar`, `command`, etc.).
4.  **Artefactos Legacy:** Eliminar el directorio `backend/app/api/`.
5.  **Refactor Menor:** Eliminar `get_db` en `database.py`.

---
*Fin del Reporte.*
