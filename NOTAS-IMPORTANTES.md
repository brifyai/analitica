# ⚠️ Notas Importantes - Base de Datos iMetrics

## 🎯 Archivos para Supabase vs psql

### ✅ Para Supabase SQL Editor (Recomendado)

Tienes 3 opciones según tu situación:

#### Opción 1: Base de Datos Nueva (Recomendado)
```
Archivo: database-schema.sql
Situación: Primera vez instalando
```

#### Opción 2: Ya Tienes Algunas Tablas (Seguro)
```
Archivo: database-schema-seguro.sql ⭐
Situación: Ya ejecutaste el schema antes o tienes tablas existentes
Ventaja: No da errores si algo ya existe
```

#### Opción 3: Empezar desde Cero
```
1. Primero: limpiar-base-de-datos.sql
2. Luego: database-schema.sql
Situación: Quieres eliminar todo y empezar limpio
⚠️ ADVERTENCIA: Elimina TODOS los datos
```

### 🖥️ Para psql (Línea de Comandos)

Usa estos archivos solo si trabajas desde terminal:

1. **database-schema.sql**
   - Funciona en ambos

2. **verificar-base-de-datos.sql**
   - Solo para psql
   - Tiene comandos `\echo` que no funcionan en Supabase

---

## 🚨 Errores Comunes

### Error 1: `syntax error at or near "\"`

**Error completo**:
```
ERROR: 42601: syntax error at or near "\"
LINE 9: \echo '============================================'
```

**Solución**:
- ❌ NO uses: `verificar-base-de-datos.sql` en Supabase
- ✅ USA: `verificar-base-de-datos-supabase.sql` en Supabase

---

### Error 2: `policy "..." already exists`

**Error completo**:
```
ERROR: 42710: policy "Users can view own profile" for table "users" already exists
```

**Causa**: Ya ejecutaste el schema antes o tienes tablas/políticas existentes

**Soluciones**:

#### Solución A: Usar Schema Seguro (Recomendado) ⭐
```sql
-- Ejecuta este archivo en su lugar:
database-schema-seguro.sql
```
Este archivo verifica si las políticas existen antes de crearlas.

#### Solución B: Limpiar y Empezar de Nuevo
```sql
-- 1. Primero ejecuta:
limpiar-base-de-datos.sql

-- 2. Luego ejecuta:
database-schema.sql
```
⚠️ **ADVERTENCIA**: Esto eliminará TODOS los datos existentes.

#### Solución C: Eliminar Solo las Políticas Conflictivas
```sql
-- Eliminar políticas específicas
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Luego ejecutar database-schema.sql nuevamente
```

---

## 📋 Guía Rápida de Archivos

### Archivos SQL

| Archivo | Dónde Usar | Propósito |
|---------|-----------|-----------|
| `database-schema.sql` | ✅ Supabase<br>✅ psql | Schema completo |
| `verificar-base-de-datos-supabase.sql` | ✅ Supabase | Verificación |
| `verificar-base-de-datos.sql` | ❌ Supabase<br>✅ psql | Verificación con formato |
| `consultas-utiles.sql` | ✅ Supabase<br>✅ psql | Consultas útiles |

### Archivos de Documentación

Todos los archivos `.md` son para lectura:
- `INICIO-RAPIDO.md` - Empieza aquí
- `README-BASE-DE-DATOS.md` - Documentación principal
- `INSTRUCCIONES-BASE-DE-DATOS.md` - Guía detallada
- `DIAGRAMA-BASE-DE-DATOS.md` - Diagramas visuales
- `RESUMEN-IMPLEMENTACION-BD.md` - Resumen ejecutivo
- `INDICE-DOCUMENTACION-BD.md` - Índice de navegación

---

## ✅ Pasos Correctos para Supabase

### 1. Ejecutar Schema
```
Archivo: database-schema.sql
Dónde: Supabase SQL Editor
Acción: Copiar y pegar todo, luego ejecutar
```

### 2. Verificar Instalación
```
Archivo: verificar-base-de-datos-supabase.sql
Dónde: Supabase SQL Editor
Acción: Copiar y pegar todo, luego ejecutar
```

### 3. Explorar Consultas
```
Archivo: consultas-utiles.sql
Dónde: Supabase SQL Editor
Acción: Copiar consultas individuales según necesites
```

---

## 🔧 Diferencias entre Archivos

### verificar-base-de-datos.sql (psql)
```sql
\echo '============================================'
\echo 'VERIFICACIÓN DE BASE DE DATOS'
\echo '============================================'

SELECT ...
```

### verificar-base-de-datos-supabase.sql (Supabase)
```sql
-- ============================================
-- VERIFICACIÓN DE BASE DE DATOS
-- ============================================

SELECT 
    '1. EXTENSIONES' AS seccion,
    ...
```

**Diferencia**: Los comandos `\echo` no funcionan en Supabase, por eso usamos comentarios y columnas de sección.

---

## 📊 Resultados Esperados

### Después de ejecutar database-schema.sql

En Supabase verás:
```
Success. No rows returned
```

Esto es **CORRECTO** ✅

### Después de ejecutar verificar-base-de-datos-supabase.sql

Verás múltiples tablas de resultados mostrando:
- Extensiones instaladas
- Tablas creadas
- Índices
- Políticas RLS
- Funciones
- Triggers
- Resumen final

---

## 🎯 Checklist de Verificación

Después de ejecutar el schema, verifica:

- [ ] 5 tablas creadas (users, user_settings, ga4_accounts, ga4_properties, analytics_cache)
- [ ] 2 extensiones habilitadas (uuid-ossp, pgcrypto)
- [ ] 10+ índices creados
- [ ] 15+ políticas RLS activas
- [ ] 5 funciones creadas
- [ ] 5 triggers activos
- [ ] 1 vista creada (user_analytics_summary)

---

## 🆘 Solución de Problemas

### Problema 1: Error de sintaxis con "\"

**Error completo**:
```
ERROR: 42601: syntax error at or near "\"
LINE 9: \echo '============================================'
```

**Solución**:
- ❌ NO uses: `verificar-base-de-datos.sql` en Supabase
- ✅ USA: `verificar-base-de-datos-supabase.sql` en Supabase

### Problema 2: "relation already exists"

**Solución**:
```sql
-- Eliminar tablas existentes primero
DROP TABLE IF EXISTS analytics_cache CASCADE;
DROP TABLE IF EXISTS ga4_properties CASCADE;
DROP TABLE IF EXISTS ga4_accounts CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Luego ejecutar database-schema.sql nuevamente
```

### Problema 3: "permission denied"

**Solución**:
```sql
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
```

### Problema 4: "extension does not exist"

**Solución**:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## 💡 Tips Importantes

1. **Siempre usa archivos compatibles con Supabase** cuando trabajes en el panel web
2. **Lee los comentarios** en los archivos SQL para entender qué hace cada sección
3. **Ejecuta las consultas de verificación** después de cada cambio importante
4. **Guarda backups** antes de hacer cambios en producción
5. **Revisa los logs** de Supabase si algo falla

---

## 📞 Recursos Adicionales

### Documentación
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview)
- [PostgreSQL Syntax](https://www.postgresql.org/docs/current/sql-syntax.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Archivos de Ayuda
- `INICIO-RAPIDO.md` - Para empezar rápido
- `README-BASE-DE-DATOS.md` - Documentación completa
- `INDICE-DOCUMENTACION-BD.md` - Navegación de archivos

---

## ✅ Resumen

### Para Supabase (Panel Web):
1. Usa: `database-schema.sql`
2. Verifica con: `verificar-base-de-datos-supabase.sql`
3. Explora: `consultas-utiles.sql`

### Para psql (Terminal):
1. Usa: `database-schema.sql`
2. Verifica con: `verificar-base-de-datos.sql`
3. Explora: `consultas-utiles.sql`

---

**Última actualización**: Enero 2026  
**Versión**: 1.0
