-- ============================================
-- SCRIPT DE VERIFICACIÓN DE BASE DE DATOS
-- iMetrics - Supabase Database
-- Versión compatible con Supabase SQL Editor
-- ============================================

-- Este script verifica que todas las tablas, índices,
-- funciones y políticas RLS estén correctamente configuradas

-- ============================================
-- 1. VERIFICAR EXTENSIONES
-- ============================================
SELECT 
    '1. EXTENSIONES' AS seccion,
    extname AS extension,
    extversion AS version
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto')
ORDER BY extname;

-- ============================================
-- 2. VERIFICAR TABLAS
-- ============================================
SELECT 
    '2. TABLAS PRINCIPALES' AS seccion,
    table_name AS tabla,
    CASE 
        WHEN table_name IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache') 
        THEN '✅ Existe'
        ELSE '❌ No encontrada'
    END AS estado
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
ORDER BY table_name;

-- ============================================
-- 3. VERIFICAR COLUMNAS DE TABLA USERS
-- ============================================
SELECT 
    '3. ESTRUCTURA: users' AS seccion,
    column_name AS columna,
    data_type AS tipo,
    is_nullable AS nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users'
ORDER BY ordinal_position;

-- ============================================
-- 4. VERIFICAR ÍNDICES
-- ============================================
SELECT 
    '4. ÍNDICES' AS seccion,
    tablename AS tabla,
    indexname AS indice
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
ORDER BY tablename, indexname;

-- Contar índices por tabla
SELECT 
    '4b. CANTIDAD DE ÍNDICES' AS seccion,
    tablename AS tabla,
    COUNT(*) AS cantidad_indices
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 5. VERIFICAR ROW LEVEL SECURITY (RLS)
-- ============================================
SELECT 
    '5. ROW LEVEL SECURITY' AS seccion,
    tablename AS tabla,
    CASE 
        WHEN rowsecurity THEN '✅ Habilitado'
        ELSE '❌ Deshabilitado'
    END AS rls_estado
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
ORDER BY tablename;

-- ============================================
-- 6. VERIFICAR POLÍTICAS RLS
-- ============================================
SELECT 
    '6. POLÍTICAS RLS' AS seccion,
    tablename AS tabla,
    policyname AS politica,
    cmd AS comando
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Contar políticas por tabla
SELECT 
    '6b. CANTIDAD DE POLÍTICAS' AS seccion,
    tablename AS tabla,
    COUNT(*) AS cantidad_politicas
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 7. VERIFICAR CONSTRAINTS
-- ============================================
SELECT 
    '7. CONSTRAINTS' AS seccion,
    tc.table_name AS tabla,
    tc.constraint_name AS constraint,
    tc.constraint_type AS tipo
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- ============================================
-- 8. VERIFICAR FOREIGN KEYS
-- ============================================
SELECT 
    '8. FOREIGN KEYS' AS seccion,
    tc.table_name AS tabla,
    kcu.column_name AS columna,
    ccu.table_name AS tabla_referenciada,
    ccu.column_name AS columna_referenciada
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

-- ============================================
-- 9. VERIFICAR FUNCIONES
-- ============================================
SELECT 
    '9. FUNCIONES PERSONALIZADAS' AS seccion,
    routine_name AS funcion,
    routine_type AS tipo,
    data_type AS retorna
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

-- ============================================
-- 10. VERIFICAR TRIGGERS
-- ============================================
SELECT 
    '10. TRIGGERS' AS seccion,
    trigger_name AS trigger,
    event_object_table AS tabla,
    action_timing AS timing,
    event_manipulation AS evento
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
ORDER BY event_object_table, trigger_name;

-- Contar triggers por tabla
SELECT 
    '10b. CANTIDAD DE TRIGGERS' AS seccion,
    event_object_table AS tabla,
    COUNT(*) AS cantidad_triggers
FROM information_schema.triggers
WHERE trigger_schema = 'public'
GROUP BY event_object_table
ORDER BY event_object_table;

-- ============================================
-- 11. VERIFICAR VISTAS
-- ============================================
SELECT 
    '11. VISTAS' AS seccion,
    table_name AS vista
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name = 'user_analytics_summary';

-- ============================================
-- 12. VERIFICAR DATOS EXISTENTES
-- ============================================
SELECT 
    '12. DATOS EXISTENTES' AS seccion,
    'users' AS tabla,
    COUNT(*) AS cantidad_registros
FROM public.users
UNION ALL
SELECT 
    '12. DATOS EXISTENTES' AS seccion,
    'user_settings' AS tabla,
    COUNT(*) AS cantidad_registros
FROM public.user_settings
UNION ALL
SELECT 
    '12. DATOS EXISTENTES' AS seccion,
    'ga4_accounts' AS tabla,
    COUNT(*) AS cantidad_registros
FROM public.ga4_accounts
UNION ALL
SELECT 
    '12. DATOS EXISTENTES' AS seccion,
    'ga4_properties' AS tabla,
    COUNT(*) AS cantidad_registros
FROM public.ga4_properties
UNION ALL
SELECT 
    '12. DATOS EXISTENTES' AS seccion,
    'analytics_cache' AS tabla,
    COUNT(*) AS cantidad_registros
FROM public.analytics_cache;

-- ============================================
-- 13. VERIFICAR PERMISOS
-- ============================================
SELECT 
    '13. PERMISOS' AS seccion,
    grantee AS usuario_rol,
    table_name AS tabla,
    privilege_type AS privilegio
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
AND grantee = 'authenticated'
ORDER BY table_name, privilege_type;

-- ============================================
-- 14. VERIFICAR TAMAÑO DE TABLAS
-- ============================================
SELECT 
    '14. TAMAÑO DE TABLAS' AS seccion,
    tablename AS tabla,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS tamano_total,
    pg_size_pretty(pg_relation_size('public.'||tablename)) AS tamano_tabla,
    pg_size_pretty(pg_total_relation_size('public.'||tablename) - pg_relation_size('public.'||tablename)) AS tamano_indices
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

-- ============================================
-- 15. RESUMEN FINAL
-- ============================================
WITH verification AS (
    SELECT 
        'Extensiones' AS componente,
        COUNT(*) AS cantidad,
        2 AS esperado
    FROM pg_extension
    WHERE extname IN ('uuid-ossp', 'pgcrypto')
    
    UNION ALL
    
    SELECT 
        'Tablas' AS componente,
        COUNT(*) AS cantidad,
        5 AS esperado
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
    
    UNION ALL
    
    SELECT 
        'Índices' AS componente,
        COUNT(*) AS cantidad,
        10 AS esperado
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
    
    UNION ALL
    
    SELECT 
        'Políticas RLS' AS componente,
        COUNT(*) AS cantidad,
        15 AS esperado
    FROM pg_policies
    WHERE schemaname = 'public'
    
    UNION ALL
    
    SELECT 
        'Funciones' AS componente,
        COUNT(*) AS cantidad,
        5 AS esperado
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
        'Triggers' AS componente,
        COUNT(*) AS cantidad,
        5 AS esperado
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND event_object_table IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache')
    
    UNION ALL
    
    SELECT 
        'Vistas' AS componente,
        COUNT(*) AS cantidad,
        1 AS esperado
    FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name = 'user_analytics_summary'
)
SELECT 
    '15. RESUMEN FINAL' AS seccion,
    componente,
    cantidad AS cantidad_actual,
    esperado AS cantidad_esperada,
    CASE 
        WHEN cantidad >= esperado THEN '✅ OK'
        ELSE '❌ Falta'
    END AS estado
FROM verification;

-- ============================================
-- FIN DE LA VERIFICACIÓN
-- ============================================

-- NOTA: Si todos los componentes muestran ✅ OK,
-- la base de datos está correctamente configurada.
