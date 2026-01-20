-- ============================================
-- SCHEMA DE BASE DE DATOS PARA IMETRICS
-- Versión SEGURA - No sobrescribe lo existente
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLA: users
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    password_hash TEXT,
    
    -- Tokens de Google Analytics (legacy)
    google_access_token TEXT,
    google_refresh_token TEXT,
    google_token_expires_at TIMESTAMPTZ,
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- RLS para users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLA: user_settings
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Configuraciones de perfil
    full_name TEXT,
    phone TEXT,
    company TEXT,
    bio TEXT,
    avatar_url TEXT,
    
    -- Configuraciones de notificaciones
    notifications_email BOOLEAN DEFAULT true,
    notifications_push BOOLEAN DEFAULT false,
    notifications_analytics BOOLEAN DEFAULT true,
    notifications_reports BOOLEAN DEFAULT true,
    notifications_maintenance BOOLEAN DEFAULT true,
    
    -- Configuraciones de apariencia
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'es' CHECK (language IN ('es', 'en', 'pt')),
    timezone TEXT DEFAULT 'America/Santiago',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    currency TEXT DEFAULT 'CLP',
    
    -- Configuraciones de privacidad
    profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private')),
    analytics_sharing BOOLEAN DEFAULT false,
    data_retention TEXT DEFAULT '1year' CHECK (data_retention IN ('1month', '3months', '6months', '1year', 'forever')),
    two_factor_auth BOOLEAN DEFAULT false,
    
    -- Configuraciones de datos
    auto_backup BOOLEAN DEFAULT true,
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para user_settings
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- RLS para user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLA: ga4_accounts
-- ============================================
CREATE TABLE IF NOT EXISTS public.ga4_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    account_id TEXT NOT NULL,
    account_name TEXT NOT NULL,
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint único por usuario y cuenta
    CONSTRAINT unique_user_account UNIQUE (user_id, account_id)
);

-- Índices para ga4_accounts
CREATE INDEX IF NOT EXISTS idx_ga4_accounts_user_id ON public.ga4_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_ga4_accounts_account_id ON public.ga4_accounts(account_id);

-- RLS para ga4_accounts
ALTER TABLE public.ga4_accounts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLA: ga4_properties
-- ============================================
CREATE TABLE IF NOT EXISTS public.ga4_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    account_id TEXT NOT NULL,
    property_id TEXT NOT NULL,
    property_name TEXT NOT NULL,
    property_type TEXT DEFAULT 'WEB' CHECK (property_type IN ('WEB', 'APP', 'WEB_AND_APP')),
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint único por usuario y propiedad
    CONSTRAINT unique_user_property UNIQUE (user_id, property_id)
);

-- Índices para ga4_properties
CREATE INDEX IF NOT EXISTS idx_ga4_properties_user_id ON public.ga4_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_ga4_properties_account_id ON public.ga4_properties(account_id);
CREATE INDEX IF NOT EXISTS idx_ga4_properties_property_id ON public.ga4_properties(property_id);

-- RLS para ga4_properties
ALTER TABLE public.ga4_properties ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLA: analytics_cache
-- ============================================
CREATE TABLE IF NOT EXISTS public.analytics_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    property_id TEXT NOT NULL,
    
    -- Parámetros de consulta
    metrics JSONB,
    dimensions JSONB,
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    
    -- Datos cacheados
    cached_data JSONB NOT NULL,
    
    -- Control de caché
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para analytics_cache
CREATE INDEX IF NOT EXISTS idx_analytics_cache_user_id ON public.analytics_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_property_id ON public.analytics_cache(property_id);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires_at ON public.analytics_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_date_range ON public.analytics_cache(date_range_start, date_range_end);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_lookup ON public.analytics_cache(
    user_id, 
    property_id, 
    date_range_start, 
    date_range_end, 
    expires_at
);

-- RLS para analytics_cache
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS (con verificación de existencia)
-- ============================================

-- Políticas para users
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can insert own profile') THEN
        CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Políticas para user_settings
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'Users can view own settings') THEN
        CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'Users can update own settings') THEN
        CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'Users can insert own settings') THEN
        CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Políticas para ga4_accounts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ga4_accounts' AND policyname = 'Users can view own accounts') THEN
        CREATE POLICY "Users can view own accounts" ON public.ga4_accounts FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ga4_accounts' AND policyname = 'Users can insert own accounts') THEN
        CREATE POLICY "Users can insert own accounts" ON public.ga4_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ga4_accounts' AND policyname = 'Users can update own accounts') THEN
        CREATE POLICY "Users can update own accounts" ON public.ga4_accounts FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ga4_accounts' AND policyname = 'Users can delete own accounts') THEN
        CREATE POLICY "Users can delete own accounts" ON public.ga4_accounts FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Políticas para ga4_properties
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ga4_properties' AND policyname = 'Users can view own properties') THEN
        CREATE POLICY "Users can view own properties" ON public.ga4_properties FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ga4_properties' AND policyname = 'Users can insert own properties') THEN
        CREATE POLICY "Users can insert own properties" ON public.ga4_properties FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ga4_properties' AND policyname = 'Users can update own properties') THEN
        CREATE POLICY "Users can update own properties" ON public.ga4_properties FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ga4_properties' AND policyname = 'Users can delete own properties') THEN
        CREATE POLICY "Users can delete own properties" ON public.ga4_properties FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Políticas para analytics_cache
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics_cache' AND policyname = 'Users can view own cache') THEN
        CREATE POLICY "Users can view own cache" ON public.analytics_cache FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics_cache' AND policyname = 'Users can insert own cache') THEN
        CREATE POLICY "Users can insert own cache" ON public.analytics_cache FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics_cache' AND policyname = 'Users can update own cache') THEN
        CREATE POLICY "Users can update own cache" ON public.analytics_cache FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics_cache' AND policyname = 'Users can delete own cache') THEN
        CREATE POLICY "Users can delete own cache" ON public.analytics_cache FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ga4_accounts_updated_at ON public.ga4_accounts;
CREATE TRIGGER update_ga4_accounts_updated_at
    BEFORE UPDATE ON public.ga4_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ga4_properties_updated_at ON public.ga4_properties;
CREATE TRIGGER update_ga4_properties_updated_at
    BEFORE UPDATE ON public.ga4_properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analytics_cache_updated_at ON public.analytics_cache;
CREATE TRIGGER update_analytics_cache_updated_at
    BEFORE UPDATE ON public.analytics_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función de limpieza de caché
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.analytics_cache
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funciones de contraseña
CREATE OR REPLACE FUNCTION hash_password(password_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(password_text, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION verify_password(password_text TEXT, hash_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN hash_text = crypt(password_text, hash_text);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_user_password(user_id UUID, new_password TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users
    SET password_hash = hash_password(new_password),
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VISTAS
-- ============================================
CREATE OR REPLACE VIEW user_analytics_summary AS
SELECT 
    u.id AS user_id,
    u.email,
    u.full_name,
    COUNT(DISTINCT ga.account_id) AS total_accounts,
    COUNT(DISTINCT gp.property_id) AS total_properties,
    u.google_token_expires_at,
    CASE 
        WHEN u.google_token_expires_at > NOW() THEN true
        ELSE false
    END AS token_valid
FROM public.users u
LEFT JOIN public.ga4_accounts ga ON u.id = ga.user_id
LEFT JOIN public.ga4_properties gp ON u.id = gp.user_id
GROUP BY u.id, u.email, u.full_name, u.google_token_expires_at;

-- ============================================
-- PERMISOS
-- ============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================
-- MENSAJE FINAL
-- ============================================
SELECT 
    '✅ Schema aplicado exitosamente' AS estado,
    'Ejecuta verificar-base-de-datos-supabase.sql para verificar' AS siguiente_paso;
