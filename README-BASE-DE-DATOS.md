# 🗄️ Base de Datos iMetrics - Documentación Completa

## 📚 Índice de Documentación

Este repositorio contiene toda la documentación y scripts necesarios para configurar la base de datos de iMetrics en Supabase.

### 📄 Archivos Disponibles

1. **`database-schema.sql`** - Schema completo de la base de datos
   - Todas las tablas con sus campos
   - Índices optimizados
   - Políticas RLS (Row Level Security)
   - Funciones y triggers
   - Listo para ejecutar en Supabase

2. **`INSTRUCCIONES-BASE-DE-DATOS.md`** - Guía de implementación paso a paso
   - Instrucciones detalladas de instalación
   - Configuración de Storage para avatares
   - Verificación post-instalación
   - Solución de problemas comunes

3. **`DIAGRAMA-BASE-DE-DATOS.md`** - Diagramas visuales
   - Estructura de tablas con todos los campos
   - Relaciones entre tablas
   - Flujo de datos
   - Políticas de seguridad

4. **`verificar-base-de-datos.sql`** - Script de verificación
   - Verifica que todo esté correctamente instalado
   - Genera reporte completo del estado
   - Útil para debugging

## 🚀 Inicio Rápido

### Paso 1: Ejecutar el Schema

```bash
# Opción A: Desde el panel de Supabase
1. Abre el SQL Editor en Supabase
2. Copia el contenido de database-schema.sql
3. Ejecuta el script

# Opción B: Desde línea de comandos
psql "tu-connection-string" -f database-schema.sql
```

### Paso 2: Verificar la Instalación

```bash
# Ejecutar script de verificación
psql "tu-connection-string" -f verificar-base-de-datos.sql
```

### Paso 3: Configurar Storage (Opcional)

Si necesitas subir avatares de usuario:
1. Crea un bucket llamado `avatars` en Supabase Storage
2. Configura las políticas de acceso (ver INSTRUCCIONES-BASE-DE-DATOS.md)

## 📊 Estructura de la Base de Datos

### Tablas Principales (5)

| Tabla | Descripción | Registros Estimados |
|-------|-------------|---------------------|
| **users** | Usuarios registrados | ~1,000/año |
| **user_settings** | Configuraciones de usuario | ~1,000/año |
| **ga4_accounts** | Cuentas de Google Analytics | ~5,000/año |
| **ga4_properties** | Propiedades de GA4 | ~10,000/año |
| **analytics_cache** | Caché de datos | ~100,000/mes |

### Relaciones

```
auth.users (Supabase)
    ↓
users (1:1)
    ↓
    ├─→ user_settings (1:1)
    ├─→ ga4_accounts (1:N)
    ├─→ ga4_properties (1:N)
    └─→ analytics_cache (1:N)
```

## 🔒 Seguridad

### Row Level Security (RLS)

✅ **Todas las tablas tienen RLS habilitado**

Políticas implementadas:
- Los usuarios solo pueden ver sus propios datos
- Los usuarios solo pueden modificar sus propios datos
- Protección automática contra accesos no autorizados

### Funciones de Seguridad

- `hash_password()` - Hash seguro de contraseñas (bcrypt)
- `verify_password()` - Verificación de contraseñas
- `update_user_password()` - Actualización segura de contraseñas

## ⚡ Optimizaciones

### Índices Estratégicos

- **10+ índices** optimizados para consultas frecuentes
- Índice compuesto en `analytics_cache` para búsquedas rápidas
- Índices en foreign keys para joins eficientes

### Caché Automático

- Sistema de caché con expiración automática (1 hora)
- Función `clean_expired_cache()` para limpieza
- Reduce llamadas a Google Analytics API

### Triggers Automáticos

- Actualización automática de `updated_at` en todas las tablas
- Mantiene integridad temporal de los datos

## 🛠️ Funciones Útiles

### Limpieza de Caché

```sql
-- Limpiar caché expirado manualmente
SELECT clean_expired_cache();

-- Retorna: cantidad de registros eliminados
```

### Gestión de Contraseñas

```sql
-- Generar hash de contraseña
SELECT hash_password('mi_contraseña');

-- Verificar contraseña
SELECT verify_password('mi_contraseña', 'hash_almacenado');

-- Actualizar contraseña de usuario
SELECT update_user_password('user-uuid', 'nueva_contraseña');
```

### Vista de Resumen

```sql
-- Ver resumen de analytics por usuario
SELECT * FROM user_analytics_summary;
```

## 📈 Monitoreo

### Verificar Estado de la Base de Datos

```sql
-- Ejecutar script de verificación completo
\i verificar-base-de-datos.sql

-- O consultas individuales:

-- Ver cantidad de registros por tabla
SELECT 'users' AS tabla, COUNT(*) FROM users
UNION ALL
SELECT 'ga4_accounts', COUNT(*) FROM ga4_accounts
UNION ALL
SELECT 'ga4_properties', COUNT(*) FROM ga4_properties
UNION ALL
SELECT 'analytics_cache', COUNT(*) FROM analytics_cache;

-- Ver tamaño de tablas
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;
```

## 🔧 Mantenimiento

### Tareas Recomendadas

#### Diarias
- ✅ Automático: Limpieza de caché expirado (via trigger)

#### Semanales
```sql
-- Verificar integridad de datos
SELECT * FROM user_analytics_summary WHERE token_valid = false;

-- Limpiar caché manualmente si es necesario
SELECT clean_expired_cache();
```

#### Mensuales
```sql
-- Analizar estadísticas de tablas
ANALYZE users, user_settings, ga4_accounts, ga4_properties, analytics_cache;

-- Verificar tamaño de base de datos
SELECT pg_size_pretty(pg_database_size(current_database()));
```

### Configurar Cron Job en Supabase

Para limpieza automática de caché:

1. Ve a Database > Cron Jobs en Supabase
2. Crea nuevo job:
   - **Nombre**: `clean_expired_cache`
   - **Schedule**: `0 */6 * * *` (cada 6 horas)
   - **SQL**: `SELECT clean_expired_cache();`

## 🐛 Solución de Problemas

### Error: "relation already exists"

**Solución**: Algunas tablas ya existen
```sql
-- Opción 1: Eliminar tablas existentes
DROP TABLE IF EXISTS analytics_cache CASCADE;
DROP TABLE IF EXISTS ga4_properties CASCADE;
DROP TABLE IF EXISTS ga4_accounts CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Luego ejecutar database-schema.sql nuevamente
```

### Error: "permission denied"

**Solución**: Verificar permisos
```sql
-- Otorgar permisos necesarios
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
```

### Error: "extension does not exist"

**Solución**: Habilitar extensiones
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Caché no se limpia automáticamente

**Solución**: Verificar función y crear cron job
```sql
-- Verificar que la función existe
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'clean_expired_cache';

-- Ejecutar manualmente
SELECT clean_expired_cache();

-- Configurar cron job en Supabase (ver sección Mantenimiento)
```

## 📞 Soporte y Recursos

### Documentación Relacionada

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

### Archivos de Referencia

- `database-schema.sql` - Schema completo
- `INSTRUCCIONES-BASE-DE-DATOS.md` - Guía detallada
- `DIAGRAMA-BASE-DE-DATOS.md` - Diagramas visuales
- `verificar-base-de-datos.sql` - Script de verificación

## ✅ Checklist de Implementación

- [ ] Ejecutar `database-schema.sql` en Supabase
- [ ] Verificar que las 5 tablas fueron creadas
- [ ] Verificar que RLS está habilitado en todas las tablas
- [ ] Verificar que las funciones fueron creadas
- [ ] Verificar que los triggers están activos
- [ ] Crear bucket `avatars` en Storage (opcional)
- [ ] Configurar políticas de Storage (opcional)
- [ ] Ejecutar `verificar-base-de-datos.sql` para validar
- [ ] Configurar cron job para limpieza de caché
- [ ] Probar conexión desde la aplicación
- [ ] Verificar que los datos se guardan correctamente

## 📊 Métricas de Éxito

Después de la implementación, deberías ver:

✅ **5 tablas** creadas correctamente  
✅ **10+ índices** para optimización  
✅ **15+ políticas RLS** para seguridad  
✅ **5 funciones** personalizadas  
✅ **5 triggers** automáticos  
✅ **1 vista** de resumen  
✅ **0 errores** en verificación  

## 🎯 Próximos Pasos

1. **Implementar el schema** usando `database-schema.sql`
2. **Verificar la instalación** con `verificar-base-de-datos.sql`
3. **Configurar Storage** para avatares (si es necesario)
4. **Configurar cron jobs** para mantenimiento automático
5. **Probar la conexión** desde la aplicación
6. **Monitorear el rendimiento** regularmente

---

## 📝 Notas de Versión

**Versión 1.0** - Enero 2026
- Schema inicial completo
- 5 tablas principales
- Sistema de caché optimizado
- RLS completo en todas las tablas
- Funciones de utilidad
- Triggers automáticos
- Vista de resumen

---

## 🤝 Contribuciones

Para reportar problemas o sugerir mejoras:
1. Documenta el problema claramente
2. Incluye logs de error si aplica
3. Describe el comportamiento esperado
4. Proporciona pasos para reproducir

---

**Última actualización**: Enero 2026  
**Mantenido por**: Equipo iMetrics  
**Versión del Schema**: 1.0
