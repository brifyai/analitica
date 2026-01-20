# ⚡ Inicio Rápido - Base de Datos iMetrics

## 🎯 3 Pasos para Implementar

### ⏱️ Tiempo estimado: 10 minutos

---

## 📋 Paso 1: Ejecutar el Schema (5 min)

### Opción A: Panel de Supabase (Recomendado) ⭐

1. **Abre tu Supabase**
   ```
   https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
   ```

2. **Ve al SQL Editor**
   - Busca "SQL Editor" en el menú lateral
   - Haz clic en "New Query"

3. **Copia y Ejecuta**
   - Abre el archivo: `database-schema.sql`
   - Copia TODO el contenido (Ctrl+A, Ctrl+C)
   - Pégalo en el editor (Ctrl+V)
   - Haz clic en "Run" o presiona Ctrl+Enter

4. **Espera la confirmación**
   - Deberías ver: "Success. No rows returned"
   - Esto es normal y significa que todo se creó correctamente

**IMPORTANTE**: Usa `database-schema.sql` (sin comandos \echo)

### Opción B: Línea de Comandos

```bash
psql "tu-connection-string" -f database-schema.sql
```

---

## ✅ Paso 2: Verificar (2 min)

### Verificación Rápida

1. **Ve a "Table Editor"** en Supabase

2. **Verifica que existen estas 5 tablas:**
   - ✅ users
   - ✅ user_settings
   - ✅ ga4_accounts
   - ✅ ga4_properties
   - ✅ analytics_cache

3. **Verificación Completa (Opcional)**
   - Abre el SQL Editor
   - Copia y ejecuta: `verificar-base-de-datos-supabase.sql`
   - Revisa el reporte generado
   
   **NOTA**: Usa `verificar-base-de-datos-supabase.sql` (compatible con Supabase)  
   El archivo `verificar-base-de-datos.sql` es solo para psql en línea de comandos

---

## 🔧 Paso 3: Configurar Mantenimiento (3 min)

### Crear Cron Job para Limpieza Automática

1. **Ve a Database → Cron Jobs** en Supabase

2. **Crea un nuevo job:**
   - **Nombre**: `clean_expired_cache`
   - **Schedule**: `0 */6 * * *`
   - **SQL**: `SELECT clean_expired_cache();`

3. **Guarda**

### Configurar Storage (Opcional)

Si necesitas avatares de usuario:

1. **Ve a Storage** en Supabase
2. **Crea bucket:**
   - Nombre: `avatars`
   - Público: ✅ Sí
3. **Listo!**

---

## 🎉 ¡Terminado!

Tu base de datos está lista. Ahora puedes:

### ✅ Usar la aplicación
```bash
# La app ya está corriendo en:
http://localhost:3000
```

### ✅ Verificar la conexión
1. Abre la app en el navegador
2. Registra un usuario de prueba
3. Conecta Google Analytics
4. Verifica que los datos se guardan

---

## 📚 ¿Necesitas más información?

### Documentación Completa

| Archivo | Para qué sirve |
|---------|----------------|
| **README-BASE-DE-DATOS.md** | 📖 Documentación principal |
| **INSTRUCCIONES-BASE-DE-DATOS.md** | 📝 Guía detallada paso a paso |
| **DIAGRAMA-BASE-DE-DATOS.md** | 📊 Diagramas visuales |
| **consultas-utiles.sql** | 🔍 50+ consultas útiles |
| **RESUMEN-IMPLEMENTACION-BD.md** | 📋 Resumen ejecutivo |

---

## 🆘 Problemas Comunes

### ❌ Error: "relation already exists"

**Solución**: Algunas tablas ya existen
```sql
-- Eliminar tablas existentes primero
DROP TABLE IF EXISTS analytics_cache CASCADE;
DROP TABLE IF EXISTS ga4_properties CASCADE;
DROP TABLE IF EXISTS ga4_accounts CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Luego ejecutar database-schema.sql nuevamente
```

### ❌ Error: "permission denied"

**Solución**: Verificar permisos
```sql
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
```

### ❌ Error: "extension does not exist"

**Solución**: Habilitar extensiones
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## 🎯 Checklist Rápido

- [ ] Ejecuté `database-schema.sql`
- [ ] Veo 5 tablas en Table Editor
- [ ] Configuré cron job de limpieza
- [ ] La app se conecta correctamente
- [ ] Puedo registrar usuarios
- [ ] Puedo conectar Google Analytics

**Si marcaste todo ✅ = ¡Éxito!**

---

## 📊 ¿Qué se creó?

```
✅ 5 Tablas principales
✅ 10+ Índices optimizados
✅ 15+ Políticas de seguridad (RLS)
✅ 5 Funciones útiles
✅ 5 Triggers automáticos
✅ 1 Vista de resumen
✅ Sistema de caché automático
```

---

## 🚀 Siguiente Nivel

### Consultas Útiles

Abre `consultas-utiles.sql` para encontrar:

- Ver todos los usuarios
- Estadísticas de uso
- Limpiar caché
- Reportes de actividad
- Y mucho más...

### Mantenimiento

```sql
-- Ver estado del caché
SELECT COUNT(*) FROM analytics_cache WHERE expires_at > NOW();

-- Limpiar caché expirado
SELECT clean_expired_cache();

-- Ver usuarios activos
SELECT * FROM user_analytics_summary;
```

---

## 💡 Tips

1. **Backup**: Configura backups automáticos en Supabase
2. **Monitoreo**: Revisa el tamaño de las tablas semanalmente
3. **Limpieza**: El cron job limpia el caché automáticamente
4. **Seguridad**: RLS está habilitado, tus datos están protegidos

---

## 🎊 ¡Felicidades!

Tienes una base de datos profesional, segura y optimizada para iMetrics.

**¿Dudas?** Revisa la documentación completa en los archivos incluidos.

---

**Creado**: Enero 2026  
**Versión**: 1.0  
**Tiempo de implementación**: ~10 minutos
