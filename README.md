# Asegúrate! — MVP

Plataforma digital para contratar personal de seguridad y auxiliares de aseo sin intermediarios.

---

## Arquitectura

```
frontend-next/    → Next.js 15 App Router   (puerto 3000)
api-node/         → Node.js Express          (puerto 4000)
supabase/schema.sql → Schema de base de datos
```

> El PDF se genera dentro de `api-node` usando Puppeteer (Chrome headless integrado), sin necesidad de servicio Python.

---

## 1. Configuración inicial (una sola vez)

### Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`
3. Ve a **Storage → New Bucket**: nombre `contracts`, acceso **privado**
4. Copia tus credenciales desde **Settings → API**

### Variables de entorno

**`api-node/.env`** — crea este archivo (copia de `.env.example`):
```
PORT=4000
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
ENCRYPTION_KEY=TuClaveDeExactamente32Caracteres!
RESEND_API_KEY=re_TU_API_KEY
RESEND_FROM=Asegurate <noreply@tudominio.com>
TRANSBANK_COMMERCE_CODE=597055555532
TRANSBANK_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
FRONTEND_URL=http://localhost:3000
```

> **ENCRYPTION_KEY** debe tener **exactamente 32 caracteres** (AES-256).  
> Las credenciales de Transbank ya están para el entorno de **integración/testing**.

**`frontend-next/.env.local`** — crea este archivo:
```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 2. Instalación de dependencias

Abre **2 terminales**:

**Terminal 1 — API Node:**
```bash
cd api-node
npm install
```
> Primera vez descarga Chrome (~170 MB para Puppeteer). Solo ocurre una vez.

**Terminal 2 — Frontend Next.js:**
```bash
cd frontend-next
npm install
```

---

## 3. Levantar los servicios

**Terminal 1:**
```bash
cd api-node
npm run dev
# → http://localhost:4000/health  debe responder {"status":"ok"}
```

**Terminal 2:**
```bash
cd frontend-next
npm run dev
# → http://localhost:3000
```

---

## 4. Crear el usuario administrador

1. Ve a `http://localhost:3000/register` y crea tu cuenta
2. En el **SQL Editor** de Supabase ejecuta:

```sql
UPDATE public.users SET role = 'admin' WHERE email = 'tu_email@ejemplo.com';
```

3. Cierra sesión y vuelve a entrar → llegas automáticamente al panel de admin (`/admin`)

---

## 5. Happy Path completo

| Paso | Quién | Acción |
|------|-------|--------|
| 1 | Cliente | Registro en `/register` |
| 2 | Cliente | Login → llega a `/dashboard` |
| 3 | Cliente | "Nueva solicitud" → llena el formulario |
| 4 | Admin   | Login con cuenta admin → panel en `/admin` |
| 5 | Admin   | Clic en **Aprobar** en la solicitud |
| 6 | Cliente | Refresca `/dashboard` → aparece botón **Pagar con Webpay** |
| 7 | Cliente | Paga con tarjeta de prueba Transbank |
| 8 | Sistema | PDF generado y almacenado en Supabase Storage |
| 9 | Cliente | Descarga el contrato PDF desde el dashboard |

### Tarjeta de prueba Transbank (integración)
```
Número: 4051 8856 0044 6623
CVV:    123
Exp:    cualquier fecha futura
RUT:    11.111.111-1
```

---

## 6. Verificar servicios

```bash
curl http://localhost:4000/health
```

---

## Estructura de directorios

```
Asegurate!/
├── frontend-next/
│   ├── app/
│   │   ├── page.js                        # Landing
│   │   ├── (auth)/login/page.js           # Login
│   │   ├── (auth)/register/page.js        # Registro
│   │   ├── (dashboard)/dashboard/page.js  # Panel cliente
│   │   ├── (dashboard)/solicitud/page.js  # Formulario solicitud
│   │   ├── (dashboard)/pago/resultado/    # Resultado Webpay
│   │   └── admin/page.js                  # Panel admin
│   └── lib/
│       ├── supabase.js    # Cliente Supabase
│       ├── api.js         # Cliente API Node
│       └── rut.js         # Validación RUT chileno
├── api-node/
│   └── src/
│       ├── index.js
│       ├── routes/        # services.routes, webpay.routes
│       ├── controllers/   # services.controller, webpay.controller
│       ├── middleware/    # auth.js (JWT Supabase)
│       ├── templates/     # contrato.hbs (plantilla PDF)
│       └── utils/
│           ├── crypto.js  # AES-256-GCM
│           ├── rut.js     # Validación RUT
│           ├── pdf.js     # Puppeteer → PDF
│           └── supabase.js
└── supabase/schema.sql
```
