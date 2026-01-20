-- ============================================
-- SCRIPT DE VERIFICACIÓN DE BASE DE DATOS
-- iMetrics - Supabase Database
-- ============================================

-- Este script verifica que todas las tablas, índices,
-- funciones y políticas RLS estén correctamente configuradas

\echo '============================================'
\echo 'VERIFICACIÓN DE BASE DE DATOS - IMETRICS'
\echo '============================================'
\echo ''

-- ============================================
-- 1. VERIFICAR EXTENSIONES
-- ============================================
\echo '1. Verificando extensiones...'
\echo ''

SELECT 
    extname AS "Extensión",
    extversion AS "Versión"
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto')
ORDER BY extname;

\echo ''

-- ============================================
-- 2. VERIFICAR TABLAS
-- ============================================
\echo '2. Verificando tablas principales...'
\echo ''

SELECT 
    table_name AS "Tabla",
    CASE 
        WHEN table_name IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache') 
        THEN '✅ Existe'
        ELSE '❌ No encontrada'
    END AS "Estado"
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
ORDER BY table_name;

\echo ''

-- Contar total de tablas
SELECT COUNT(*) AS "Total de tablas en public"
FROM information_schema.tables
WHERE table_schema = 'public';

\echo ''

-- ============================================
-- 3. VERIFICAR COLUMNAS POR TABLA
-- ============================================
\echo '3. Verificando estructura de tablas...'
\echo ''

\echo '   Tabla: users'
SELECT 
    column_name AS "Columna",
    data_type AS "Tipo",
    is_nullable AS "Nullable"
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users'
ORDER BY ordinal_position;

\echo ''
\echo '   Tabla: user_settings'
SELECT 
    column_name AS "Columna",
    data_type AS "Tipo",
    is_nullable AS "Nullable"
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_settings'
ORDER BY ordinal_position
LIMIT 10;

\echo ''
\echo '   Tabla: ga4_accounts'
SELECT 
    column_name AS "Columna",
    data_type AS "Tipo",
    is_nullable AS "Nullable"
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'ga4_accounts'
ORDER BY ordinal_position;

\echo ''
\echo '   Tabla: ga4_properties'
SELECT 
    column_name AS "Columna",
    data_type AS "Tipo",
    is_nullable AS "Nullable"
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'ga4_properties'
ORDER BY ordinal_position;

\echo ''
\echo '   Tabla: analytics_cache'
SELECT 
    column_name AS "Columna",
    data_type AS "Tipo",
    is_nullable AS "Nullable"
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'analytics_cache'
ORDER BY ordinal_position;

\echo ''

-- ============================================
-- 4. VERIFICAR ÍNDICES
-- ============================================
\echo '4. Verificando índices...'
\echo ''

SELECT 
    tablename AS "Tabla",
    indexname AS "Índice",
    indexdef AS "Definición"
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
ORDER BY tablename, indexname;

\echo ''

-- Contar índices por tabla
SELECT 
    tablename AS "Tabla",
    COUNT(*) AS "Cantidad de Índices"
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
GROUP BY tablename
ORDER BY tablename;

\echo ''

-- ============================================
-- 5. VERIFICAR ROW LEVEL SECURITY (RLS)
-- ============================================
\echo '5. Verificando Row Level Security (RLS)...'
\echo ''

SELECT 
    tablename AS "Tabla",
    CASE 
        WHEN rowsecurity THEN '✅ Habilitado'
        ELSE '❌ Deshabilitado'
    END AS "RLS Estado"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
ORDER BY tablename;

\echo ''

-- ============================================
-- 6. VERIFICAR POLÍTICAS RLS
-- ============================================
\echo '6. Verificando políticas RLS...'
\echo ''

SELECT 
    schemaname AS "Schema",
    tablename AS "Tabla",
    policyname AS "Política",
    cmd AS "Comando"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

\echo ''

-- Contar políticas por tabla
SELECT 
    tablename AS "Tabla",
    COUNT(*) AS "Cantidad de Políticas"
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

\echo ''

-- ============================================
-- 7. VERIFICAR CONSTRAINTS
-- ============================================
\echo '7. Verificando constraints...'
\echo ''

SELECT 
    tc.table_name AS "Tabla",
    tc.constraint_name AS "Constraint",
    tc.constraint_type AS "Tipo"
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

\echo ''

-- ============================================
-- 8. VERIFICAR FOREIGN KEYS
-- ============================================
\echo '8. Verificando foreign keys...'
\echo ''

SELECT 
    tc.table_name AS "Tabla",
    kcu.column_name AS "Columna",
    ccu.table_name AS "Tabla Referenciada",
    ccu.column_name AS "Columna Referenciada"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
ORDER BY tc.table_name;

\echo ''

-- ============================================
-- 9. VERIFICAR FUNCIONES
-- ============================================
\echo '9. Verificando funciones personalizadas...'
\echo ''

SELECT 
    routine_name AS "Función",
    routine_type AS "Tipo",
    data_type AS "Retorna"
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'clean_expired_cache',
    'hash_password',
    'verify_password',
    'update_user_password',
    'update_updated_at_column'
)
ORDER BY routine_name;

\echo ''

-- ============================================
-- 10. VERIFICAR TRIGGERS
-- ============================================
\echo '10. Verificando triggers...'
\echo ''

SELECT 
    trigger_name AS "Trigger",
    event_object_table AS "Tabla",
    action_timing AS "Timing",
    event_manipulation AS "Evento"
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
ORDER BY event_object_table, trigger_name;

\echo ''

-- Contar triggers por tabla
SELECT 
    event_object_table AS "Tabla",
    COUNT(*) AS "Cantidad de Triggers"
FROM information_schema.triggers
WHERE trigger_schema = 'public'
GROUP BY event_object_table
ORDER BY event_object_table;

\echo ''

-- ============================================
-- 11. VERIFICAR VISTAS
-- ============================================
\echo '11. Verificando vistas...'
\echo ''

SELECT 
    table_name AS "Vista",
    view_definition AS "Definición"
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name = 'user_analytics_summary';

\echo ''

-- ============================================
-- 12. VERIFICAR DATOS DE PRUEBA
-- ============================================
\echo '12. Verificando datos existentes...'
\echo ''

SELECT 
    'users' AS "Tabla",
    COUNT(*) AS "Cantidad de Registros"
FROM public.users
UNION ALL
SELECT 
    'user_settings' AS "Tabla",
    COUNT(*) AS "Cantidad de Registros"
FROM public.user_settings
UNION ALL
SELECT 
    'ga4_accounts' AS "Tabla",
    COUNT(*) AS "Cantidad de Registros"
FROM public.ga4_accounts
UNION ALL
SELECT 
    'ga4_properties' AS "Tabla",
    COUNT(*) AS "Cantidad de Registros"
FROM public.ga4_properties
UNION ALL
SELECT 
    'analytics_cache' AS "Tabla",
    COUNT(*) AS "Cantidad de Registros"
FROM public.analytics_cache;

\echo ''

-- ============================================
-- 13. VERIFICAR PERMISOS
-- ============================================
\echo '13. Verificando permisos...'
\echo ''

SELECT 
    grantee AS "Usuario/Rol",
    table_schema AS "Schema",
    table_name AS "Tabla",
    privilege_type AS "Privilegio"
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
AND grantee = 'authenticated'
ORDER BY table_name, privilege_type;

\echo ''

-- ============================================
-- 14. VERIFICAR TAMAÑO DE TABLAS
-- ============================================
\echo '14. Verificando tamaño de tablas...'
\echo ''

SELECT 
    schemaname AS "Schema",
    tablename AS "Tabla",
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS "Tamaño Total",
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS "Tamaño Tabla",
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS "Tamaño Índices"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

\echo ''

-- ============================================
-- 15. RESUMEN FINAL
-- ============================================
\echo '15. Resumen de verificación...'
\echo ''

WITH verification AS (
    SELECT 
        'Extensiones' AS "Componente",
        COUNT(*) AS "Cantidad"
    FROM pg_extension
    WHERE extname IN ('uuid-ossp', 'pgcrypto')
    
    UNION ALL
    
    SELECT 
        'Tablas' AS "Componente",
        COUNT(*) AS "Cantidad"
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
    
    UNION ALL
    
    SELECT 
        'Índices' AS "Componente",
        COUNT(*) AS "Cantidad"
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
    
    UNION ALL
    
    SELECT 
        'Políticas RLS' AS "Componente",
        COUNT(*) AS "Cantidad"
    FROM pg_policies
    WHERE schemaname = 'public'
    
    UNION ALL
    
    SELECT 
        'Funciones' AS "Componente",
        COUNT(*) AS "Cantidad"
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name IN (
        'clean_expired_cache',
        'hash_password',
        'verify_password',
        'update_user_password',
        'update_updated_at_column'
    )
    
    UNION ALL
    
    SELECT 
        'Triggers' AS "Componente",
        COUNT(*) AS "Cantidad"
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND event_object_table IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
    
    UNION ALL
    
    SELECT 
        'Vistas' AS "Componente",
        COUNT(*) AS "Cantidad"
    FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name = 'user_analytics_summary'
)
SELECT * FROM verification;

\echo ''
\echo '============================================'
\echo 'VERIFICACIÓN COMPLETADA'
\echo '============================================'
\echo ''
\echo 'Valores esperados:'
\echo '  - Extensiones: 2'
\echo '  - Tablas: 5'
\echo '  - Índices: 10+'
\echo '  - Políticas RLS: 15+'
\echo '  - Funciones: 5'
\echo '  - Triggers: 5'
\echo '  - Vistas: 1'
\echo ''
\echo 'Si todos los valores coinciden, la base de datos'
\echo 'está correctamente configurada.'
\echo ''
