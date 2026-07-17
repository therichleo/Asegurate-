# 🛡️ Asegúrate! MVP

Plataforma web premium para la contratación de personal de seguridad y auxiliares de aseo sin intermediarios físicos. Este proyecto es un MVP (Producto Mínimo Viable) diseñado con una arquitectura moderna de microservicios locales, enfocado en servir como demostración tecnológica para clientes corporativos.

## 🚀 Arquitectura y Tecnologías

El proyecto se divide en dos servicios principales:

*   **Frontend (`/frontend-next`):** Next.js 15 (App Router, Turbopack), SSR, Tailwind CSS. Se ejecuta en el puerto `3000`.
*   **Backend (`/api-node`):** Node.js, Express, Puppeteer (para generación dinámica de contratos PDF). Se ejecuta en el puerto `4000`.
*   **Base de Datos & Auth:** Supabase (PostgreSQL, autenticación con JWT, Storage privado).
*   **Pasarela de Pagos:** Transbank Webpay Plus (Entorno de Integración).
*   **Emails:** Resend (Transaccionales).

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <tu-url-del-repositorio>
cd Asegurate
```

### 2. Variables de Entorno

Debes crear los archivos `.env` correspondientes en cada carpeta.

**En `api-node/.env`:**
```env
PORT=4000
SUPABASE_URL=tu_supabase_url
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
ENCRYPTION_KEY=tu_clave_de_32_caracteres_exactos
RESEND_API_KEY=tu_resend_api_key
RESEND_FROM=Asegurate <noreply@tudominio.com>
TRANSBANK_COMMERCE_CODE=597055555532
TRANSBANK_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
FRONTEND_URL=http://localhost:3000
```

**En `frontend-next/.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Levantar los servicios

Abre dos terminales para ejecutar el entorno local.

**Terminal 1 (Backend):**
```bash
cd api-node
npm install
npm run dev
# La API estará corriendo en http://localhost:4000
```

**Terminal 2 (Frontend):**
```bash
cd frontend-next
npm install
npm run dev --turbopack
# La aplicación estará lista en http://localhost:3000
```

## 🧪 Guía de Pruebas (Happy Path)

Para realizar una demostración completa del flujo de la aplicación:

1.  **Registro/Login:** Ingresa a `localhost:3000` y regístrate como cliente.
2.  **Solicitud:** En el dashboard, crea una nueva solicitud definiendo el tipo de servicio (Seguridad o Aseo), horas y fechas.
3.  **Aprobación (Admin):** Inicia sesión con una cuenta de administrador (serás redirigido a `/admin`), revisa la solicitud pendiente y presiona **Aprobar**.
4.  **Pago:** Vuelve al dashboard del cliente, actualiza y presiona **Pagar con Webpay**.
5.  **Contrato:** Tras el pago exitoso, el sistema generará automáticamente el contrato en PDF y lo subirá a Supabase, permitiendo su descarga inmediata.

### 💳 Tarjeta de Prueba Webpay (Transbank)

Para probar la pasarela de pagos en el entorno de integración, utiliza los siguientes datos:

*   **Número de tarjeta:** `4051 8856 0044 6623`
*   **CVV:** `123`
*   **Fecha de expiración:** Cualquier fecha futura (ej. `12/30`)
*   **RUT:** `11.111.111-1`

## 🔒 Seguridad Implementada

*   **Protección de Datos Sensibles:** Los RUTs de los clientes se almacenan en la base de datos encriptados utilizando el algoritmo **AES-256-GCM**.
*   **Validación de RUT:** Implementación del algoritmo de módulo 11 tanto en frontend como en backend.
*   **Protección de Documentos:** Los contratos generados en PDF se almacenan en un bucket privado de Supabase Storage. El acceso se otorga únicamente mediante URLs firmadas con una expiración de 5 minutos.
*   **Autenticación:** Gestión de sesiones mediante JSON Web Tokens (JWT) validados en cada petición al backend.
