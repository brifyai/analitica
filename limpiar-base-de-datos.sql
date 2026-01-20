-- ============================================
-- SCRIPT DE LIMPIEZA DE BASE DE DATOS
-- iMetrics - Supabase Database
-- ============================================

-- ADVERTENCIA: Este script eliminará TODAS las tablas,
-- funciones, triggers y políticas relacionadas con iMetrics.
-- Úsalo solo si quieres empezar desde cero.

-- ============================================
-- 1. ELIMINAR VISTAS
-- ============================================
DROP VIEW IF EXISTS user_analytics_summary CASCADE;

-- ============================================
-- 2. ELIMINAR TABLAS (en orden inverso de dependencias)
-- ============================================
DROP TABLE IF EXISTS analytics_cache CASCADE;
DROP TABLE IF EXISTS ga4_properties CASCADE;
DROP TABLE IF EXISTS ga4_accounts CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 3. ELIMINAR FUNCIONES
-- ============================================
DROP FUNCTION IF EXISTS clean_expired_cache() CASCADE;
DROP FUNCTION IF EXISTS hash_password(TEXT) CASCADE;
DROP FUNCTION IF EXISTS verify_password(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_user_password(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================
-- 4. VERIFICAR LIMPIEZA
-- ============================================
-- Ver tablas restantes
SELECT 
    'Tablas restantes' AS tipo,
    table_name AS nombre
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache');

-- Ver funciones restantes
SELECT 
    'Funciones restantes' AS tipo,
    routine_name AS nombre
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'clean_expired_cache',
    'hash_password',
    'verify_password',
    'update_user_password',
    'update_updated_at_column'
);

-- Ver vistas restantes
SELECT 
    'Vistas restantes' AS tipo,
    table_name AS nombre
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name = 'user_analytics_summary';

-- ============================================
-- MENSAJE FINAL
-- ============================================
SELECT 
    '✅ Limpieza completada' AS estado,
    'Ahora puedes ejecutar database-schema.sql' AS siguiente_paso;

-- ============================================
-- FIN DE LA LIMPIEZA
-- ============================================
