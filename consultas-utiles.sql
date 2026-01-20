-- ============================================
-- CONSULTAS ÚTILES PARA IMETRICS
-- Ejemplos de consultas comunes para administración
-- ============================================

-- ============================================
-- SECCIÓN 1: CONSULTAS DE USUARIOS
-- ============================================

-- 1.1 Ver todos los usuarios registrados
SELECT 
    id,
    email,
    full_name,
    created_at,
    CASE 
        WHEN google_access_token IS NOT NULL THEN '✅ Conectado'
        ELSE '❌ No conectado'
    END AS google_analytics_status
FROM users
ORDER BY created_at DESC;

-- 1.2 Ver usuarios con Google Analytics conectado
SELECT 
    id,
    email,
    full_name,
    google_token_expires_at,
    CASE 
        WHEN google_token_expires_at > NOW() THEN '✅ Token válido'
        ELSE '⚠️ Token expirado'
    END AS token_status
FROM users
WHERE google_access_token IS NOT NULL
ORDER BY google_token_expires_at DESC;

-- 1.3 Ver usuarios con tokens expirados
SELECT 
    id,
    email,
    full_name,
    google_token_expires_at,
    NOW() - google_token_expires_at AS tiempo_expirado
FROM users
WHERE google_access_token IS NOT NULL
AND google_token_expires_at < NOW()
ORDER BY google_token_expires_at DESC;

-- 1.4 Estadísticas de usuarios
SELECT 
    COUNT(*) AS total_usuarios,
    COUNT(CASE WHEN google_access_token IS NOT NULL THEN 1 END) AS usuarios_con_ga,
    COUNT(CASE WHEN google_access_token IS NOT NULL AND google_token_expires_at > NOW() THEN 1 END) AS usuarios_ga_activos,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) AS usuarios_ultimos_30_dias
FROM users;

-- ============================================
-- SECCIÓN 2: CONSULTAS DE CUENTAS Y PROPIEDADES
-- ============================================

-- 2.1 Ver todas las cuentas de GA4 por usuario
SELECT 
    u.email,
    u.full_name,
    ga.account_id,
    ga.account_name,
    ga.created_at
FROM users u
JOIN ga4_accounts ga ON u.id = ga.user_id
ORDER BY u.email, ga.account_name;

-- 2.2 Ver todas las propiedades de GA4 por usuario
SELECT 
    u.email,
    u.full_name,
    gp.property_id,
    gp.property_name,
    gp.property_type,
    gp.created_at
FROM users u
JOIN ga4_properties gp ON u.id = gp.user_id
ORDER BY u.email, gp.property_name;

-- 2.3 Resumen de cuentas y propiedades por usuario
SELECT 
    u.email,
    u.full_name,
    COUNT(DISTINCT ga.account_id) AS total_cuentas,
    COUNT(DISTINCT gp.property_id) AS total_propiedades
FROM users u
LEFT JOIN ga4_accounts ga ON u.id = ga.user_id
LEFT JOIN ga4_properties gp ON u.id = gp.user_id
GROUP BY u.id, u.email, u.full_name
ORDER BY total_propiedades DESC;

-- 2.4 Propiedades por cuenta
SELECT 
    ga.account_name,
    COUNT(gp.property_id) AS total_propiedades,
    STRING_AGG(gp.property_name, ', ') AS propiedades
FROM ga4_accounts ga
LEFT JOIN ga4_properties gp ON ga.account_id = gp.account_id AND ga.user_id = gp.user_id
GROUP BY ga.account_id, ga.account_name
ORDER BY total_propiedades DESC;

-- 2.5 Usuarios sin cuentas de GA4
SELECT 
    u.email,
    u.full_name,
    u.created_at,
    CASE 
        WHEN u.google_access_token IS NOT NULL THEN 'Token existe pero sin cuentas'
        ELSE 'No conectado a GA'
    END AS estado
FROM users u
LEFT JOIN ga4_accounts ga ON u.id = ga.user_id
WHERE ga.id IS NULL
ORDER BY u.created_at DESC;

-- ============================================
-- SECCIÓN 3: CONSULTAS DE CACHÉ
-- ============================================

-- 3.1 Ver estado del caché
SELECT 
    COUNT(*) AS total_registros,
    COUNT(CASE WHEN expires_at > NOW() THEN 1 END) AS registros_validos,
    COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) AS registros_expirados,
    pg_size_pretty(pg_total_relation_size('analytics_cache')) AS tamano_tabla
FROM analytics_cache;

-- 3.2 Ver caché por usuario
SELECT 
    u.email,
    COUNT(ac.id) AS total_cache_entries,
    COUNT(CASE WHEN ac.expires_at > NOW() THEN 1 END) AS cache_valido,
    MIN(ac.created_at) AS primer_cache,
    MAX(ac.created_at) AS ultimo_cache
FROM users u
LEFT JOIN analytics_cache ac ON u.id = ac.user_id
GROUP BY u.id, u.email
ORDER BY total_cache_entries DESC;

-- 3.3 Ver caché más antiguo
SELECT 
    u.email,
    ac.property_id,
    ac.date_range_start,
    ac.date_range_end,
    ac.created_at,
    ac.expires_at,
    NOW() - ac.created_at AS antiguedad
FROM analytics_cache ac
JOIN users u ON ac.user_id = u.id
ORDER BY ac.created_at ASC
LIMIT 20;

-- 3.4 Ver caché próximo a expirar
SELECT 
    u.email,
    ac.property_id,
    ac.date_range_start,
    ac.date_range_end,
    ac.expires_at,
    ac.expires_at - NOW() AS tiempo_restante
FROM analytics_cache ac
JOIN users u ON ac.user_id = u.id
WHERE ac.expires_at > NOW()
ORDER BY ac.expires_at ASC
LIMIT 20;

-- 3.5 Limpiar caché expirado (ejecutar manualmente)
-- SELECT clean_expired_cache();

-- ============================================
-- SECCIÓN 4: CONSULTAS DE CONFIGURACIONES
-- ============================================

-- 4.1 Ver configuraciones de usuarios
SELECT 
    u.email,
    us.theme,
    us.language,
    us.timezone,
    us.notifications_email,
    us.notifications_analytics
FROM users u
LEFT JOIN user_settings us ON u.id = us.user_id
ORDER BY u.email;

-- 4.2 Estadísticas de preferencias
SELECT 
    theme,
    COUNT(*) AS usuarios
FROM user_settings
GROUP BY theme
ORDER BY usuarios DESC;

SELECT 
    language,
    COUNT(*) AS usuarios
FROM user_settings
GROUP BY language
ORDER BY usuarios DESC;

-- 4.3 Usuarios sin configuraciones
SELECT 
    u.email,
    u.full_name,
    u.created_at
FROM users u
LEFT JOIN user_settings us ON u.id = us.user_id
WHERE us.id IS NULL
ORDER BY u.created_at DESC;

-- ============================================
-- SECCIÓN 5: CONSULTAS DE AUDITORÍA
-- ============================================

-- 5.1 Actividad reciente (últimas 24 horas)
SELECT 
    'Nuevos usuarios' AS actividad,
    COUNT(*) AS cantidad
FROM users
WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'Nuevas cuentas GA4' AS actividad,
    COUNT(*) AS cantidad
FROM ga4_accounts
WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'Nuevas propiedades GA4' AS actividad,
    COUNT(*) AS cantidad
FROM ga4_properties
WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'Nuevas entradas de caché' AS actividad,
    COUNT(*) AS cantidad
FROM analytics_cache
WHERE created_at > NOW() - INTERVAL '24 hours';

-- 5.2 Usuarios más activos (por caché generado)
SELECT 
    u.email,
    u.full_name,
    COUNT(ac.id) AS consultas_realizadas,
    MAX(ac.created_at) AS ultima_consulta
FROM users u
JOIN analytics_cache ac ON u.id = ac.user_id
WHERE ac.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email, u.full_name
ORDER BY consultas_realizadas DESC
LIMIT 10;

-- 5.3 Propiedades más consultadas
SELECT 
    gp.property_name,
    gp.property_id,
    COUNT(ac.id) AS veces_consultada,
    MAX(ac.created_at) AS ultima_consulta
FROM ga4_properties gp
JOIN analytics_cache ac ON gp.property_id = ac.property_id
WHERE ac.created_at > NOW() - INTERVAL '30 days'
GROUP BY gp.property_id, gp.property_name
ORDER BY veces_consultada DESC
LIMIT 10;

-- 5.4 Rangos de fechas más consultados
SELECT 
    date_range_start,
    date_range_end,
    COUNT(*) AS veces_consultado,
    MAX(created_at) AS ultima_consulta
FROM analytics_cache
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY date_range_start, date_range_end
ORDER BY veces_consultado DESC
LIMIT 10;

-- ============================================
-- SECCIÓN 6: CONSULTAS DE MANTENIMIENTO
-- ============================================

-- 6.1 Ver tamaño de todas las tablas
SELECT 
    schemaname AS schema,
    tablename AS tabla,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamano_total,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS tamano_tabla,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS tamano_indices
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 6.2 Ver índices y su uso
SELECT 
    schemaname AS schema,
    tablename AS tabla,
    indexname AS indice,
    idx_scan AS veces_usado,
    idx_tup_read AS tuplas_leidas,
    idx_tup_fetch AS tuplas_obtenidas,
    pg_size_pretty(pg_relation_size(indexrelid)) AS tamano
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- 6.3 Ver estadísticas de tablas
SELECT 
    schemaname AS schema,
    relname AS tabla,
    n_live_tup AS filas_vivas,
    n_dead_tup AS filas_muertas,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- 6.4 Verificar integridad referencial
SELECT 
    tc.table_name AS tabla,
    kcu.column_name AS columna,
    ccu.table_name AS tabla_referenciada,
    ccu.column_name AS columna_referenciada,
    COUNT(*) AS registros_huerfanos
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
GROUP BY tc.table_name, kcu.column_name, ccu.table_name, ccu.column_name;

-- ============================================
-- SECCIÓN 7: CONSULTAS DE OPTIMIZACIÓN
-- ============================================

-- 7.1 Identificar consultas lentas (requiere pg_stat_statements)
-- SELECT 
--     query,
--     calls,
--     total_time,
--     mean_time,
--     max_time
-- FROM pg_stat_statements
-- WHERE query LIKE '%analytics_cache%'
-- ORDER BY mean_time DESC
-- LIMIT 10;

-- 7.2 Ver conexiones activas
SELECT 
    pid,
    usename AS usuario,
    application_name AS aplicacion,
    client_addr AS ip_cliente,
    state AS estado,
    query_start AS inicio_consulta,
    state_change AS cambio_estado,
    query AS consulta_actual
FROM pg_stat_activity
WHERE datname = current_database()
AND state != 'idle'
ORDER BY query_start DESC;

-- 7.3 Ver locks activos
SELECT 
    l.pid,
    l.mode AS modo_lock,
    l.granted AS otorgado,
    a.usename AS usuario,
    a.query AS consulta,
    a.query_start AS inicio
FROM pg_locks l
JOIN pg_stat_activity a ON l.pid = a.pid
WHERE a.datname = current_database()
ORDER BY a.query_start DESC;

-- ============================================
-- SECCIÓN 8: CONSULTAS DE BACKUP Y RESTORE
-- ============================================

-- 8.1 Exportar datos de usuario específico (preparar para backup)
-- Reemplazar 'user-uuid-aqui' con el UUID real del usuario
/*
SELECT json_build_object(
    'user', (SELECT row_to_json(u) FROM users u WHERE id = 'user-uuid-aqui'),
    'settings', (SELECT row_to_json(us) FROM user_settings us WHERE user_id = 'user-uuid-aqui'),
    'accounts', (SELECT json_agg(row_to_json(ga)) FROM ga4_accounts ga WHERE user_id = 'user-uuid-aqui'),
    'properties', (SELECT json_agg(row_to_json(gp)) FROM ga4_properties gp WHERE user_id = 'user-uuid-aqui')
) AS user_backup;
*/

-- 8.2 Ver último backup (si está configurado en Supabase)
-- Esta información está disponible en el panel de Supabase

-- ============================================
-- SECCIÓN 9: CONSULTAS DE DESARROLLO/DEBUG
-- ============================================

-- 9.1 Ver estructura de una tabla
SELECT 
    column_name AS columna,
    data_type AS tipo,
    character_maximum_length AS longitud_max,
    is_nullable AS nullable,
    column_default AS valor_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users'
ORDER BY ordinal_position;

-- 9.2 Ver todas las políticas RLS
SELECT 
    schemaname AS schema,
    tablename AS tabla,
    policyname AS politica,
    permissive AS permisivo,
    roles AS roles,
    cmd AS comando,
    qual AS condicion,
    with_check AS verificacion
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 9.3 Ver todos los triggers
SELECT 
    trigger_name AS trigger,
    event_object_table AS tabla,
    action_timing AS timing,
    event_manipulation AS evento,
    action_statement AS accion
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 9.4 Ver todas las funciones personalizadas
SELECT 
    routine_name AS funcion,
    routine_type AS tipo,
    data_type AS retorna,
    routine_definition AS definicion
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
-- SECCIÓN 10: CONSULTAS ÚTILES PARA REPORTES
-- ============================================

-- 10.1 Reporte de crecimiento mensual
SELECT 
    DATE_TRUNC('month', created_at) AS mes,
    COUNT(*) AS nuevos_usuarios
FROM users
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC;

-- 10.2 Reporte de uso de Google Analytics
SELECT 
    DATE_TRUNC('day', ac.created_at) AS dia,
    COUNT(DISTINCT ac.user_id) AS usuarios_activos,
    COUNT(ac.id) AS consultas_realizadas
FROM analytics_cache ac
WHERE ac.created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', ac.created_at)
ORDER BY dia DESC;

-- 10.3 Reporte de retención de usuarios
SELECT 
    DATE_TRUNC('month', u.created_at) AS mes_registro,
    COUNT(DISTINCT u.id) AS usuarios_registrados,
    COUNT(DISTINCT CASE WHEN ac.created_at > NOW() - INTERVAL '30 days' THEN u.id END) AS usuarios_activos_ultimos_30_dias,
    ROUND(
        100.0 * COUNT(DISTINCT CASE WHEN ac.created_at > NOW() - INTERVAL '30 days' THEN u.id END) / 
        NULLIF(COUNT(DISTINCT u.id), 0), 
        2
    ) AS porcentaje_retencion
FROM users u
LEFT JOIN analytics_cache ac ON u.id = ac.user_id
GROUP BY DATE_TRUNC('month', u.created_at)
ORDER BY mes_registro DESC;

-- ============================================
-- FIN DE CONSULTAS ÚTILES
-- ============================================

-- NOTA: Algunas consultas están comentadas porque requieren
-- extensiones adicionales o permisos especiales.
-- Descoméntalas según sea necesario.
