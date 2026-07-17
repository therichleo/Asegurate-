-- =============================================
-- Asegúrate! MVP — Schema Supabase (PostgreSQL)
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

-- Tabla de perfiles de usuarios (extiende auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear el perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tabla de solicitudes de servicio
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('seguridad', 'aseo')),
    company_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_hours INT NOT NULL CHECK (total_hours > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
    encrypted_rut TEXT NOT NULL,
    amount NUMERIC(12, 2),
    transbank_token TEXT,
    pdf_storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_service_requests_updated_at
    BEFORE UPDATE ON public.service_requests
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Usuarios ven solo su propio perfil"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

-- Políticas para service_requests
CREATE POLICY "Clientes ven sus propias solicitudes"
    ON public.service_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Clientes pueden crear solicitudes"
    ON public.service_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins tienen acceso total (usa el service_role key desde el backend)
-- El backend Node.js usa SUPABASE_SERVICE_ROLE_KEY que bypasea RLS,
-- por lo que las rutas de admin no necesitan políticas adicionales.

-- =============================================
-- Supabase Storage: bucket para contratos PDF
-- =============================================
-- Ejecutar esto en Storage > New Bucket en el dashboard de Supabase:
-- Nombre: contracts
-- Privado: SÍ (no público)

-- =============================================
-- Usuario administrador inicial
-- Después de registrarte, ejecuta esto con tu UUID:
-- UPDATE public.users SET role = 'admin' WHERE email = 'tu_email@ejemplo.com';
-- =============================================
