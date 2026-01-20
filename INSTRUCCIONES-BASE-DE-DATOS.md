# 📊 Instrucciones para Configurar la Base de Datos de iMetrics

## 🎯 Resumen

Este documento contiene las instrucciones completas para configurar la base de datos Supabase necesaria para el funcionamiento óptimo de la aplicación iMetrics.

## 📋 Tablas Principales

### 1. **users** - Usuarios del Sistema
Almacena información de usuarios registrados y sus tokens de Google Analytics.

**Campos principales:**
- `id` (UUID) - ID del usuario (referencia a auth.users)
- `email` (TEXT) - Email único del usuario
- `full_name` (TEXT) - Nombre completo
- `avatar_url` (TEXT) - URL del avatar
- `google_access_token` (TEXT) - Token de acceso a Google Analytics
- `google_refresh_token` (TEXT) - Token de refresco
- `google_token_expires_at` (TIMESTAMPTZ) - Fecha de expiración del token

### 2. **user_settings** - Configuraciones de Usuario
Configuraciones personalizadas para cada usuario.

**Categorías de configuración:**
- **Perfil**: nombre, teléfono, empresa, biografía, avatar
- **Notificaciones**: email, push, analytics, reportes, mantenimiento
- **Apariencia**: tema (light/dark/system), idioma (es/en/pt), zona horaria, formato de fecha, moneda
- **Privacidad**: visibilidad del perfil, compartir analytics, retención de datos, 2FA
- **Datos**: backup automático

### 3. **ga4_accounts** - Cuentas de Google Analytics 4
Almacena las cuentas de GA4 vinculadas a cada usuario.

**Campos principales:**
- `user_id` (UUID) - ID del usuario propietario
- `account_id` (TEXT) - ID de la cuenta de GA4
- `account_name` (TEXT) - Nombre de la cuenta

### 4. **ga4_properties** - Propiedades de Google Analytics 4
Propiedades de GA4 asociadas a las cuentas.

**Campos principales:**
- `user_id` (UUID) - ID del usuario propietario
- `account_id` (TEXT) - ID de la cuenta padre
- `property_id` (TEXT) - ID de la propiedad
- `property_name` (TEXT) - Nombre de la propiedad
- `property_type` (TEXT) - Tipo: WEB, APP, o WEB_AND_APP

### 5. **analytics_cache** - Caché de Datos de Analytics
Caché para optimizar consultas a Google Analytics.

**Campos principales:**
- `user_id` (UUID) - ID del usuario
- `property_id` (TEXT) - ID de la propiedad
- `metrics` (JSONB) - Métricas consultadas
- `dimensions` (JSONB) - Dimensiones consultadas
- `date_range_start` (DATE) - Fecha inicio del rango
- `date_range_end` (DATE) - Fecha fin del rango
- `cached_data` (JSONB) - Datos cacheados
- `expires_at` (TIMESTAMPTZ) - Fecha de expiración del caché

## 🚀 Pasos de Implementación

### Opción 1: Usando el Panel de Supabase (Recomendado)

1. **Acceder a tu proyecto Supabase**
   - Ve a: https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
   - O accede a tu panel de Easypanel

2. **Abrir el Editor SQL**
   - En el menú lateral, busca "SQL Editor" o "Editor SQL"
   - Haz clic en "New Query" o "Nueva Consulta"

3. **Copiar y Ejecutar el Schema**
   - Abre el archivo `database-schema.sql`
   - Copia TODO el contenido
   - Pégalo en el editor SQL
   - Haz clic en "Run" o "Ejecutar"

4. **Verificar la Creación**
   - Ve a "Table Editor" o "Editor de Tablas"
   - Deberías ver las 5 tablas creadas:
     - users
     - user_settings
     - ga4_accounts
     - ga4_properties
     - analytics_cache

### Opción 2: Usando psql (Línea de Comandos)

```bash
# Conectar a tu base de datos
psql "postgresql://usuario:contraseña@host:puerto/database"

# Ejecutar el archivo SQL
\i database-schema.sql

# Verificar tablas creadas
\dt
```

### Opción 3: Ejecutar por Secciones

Si prefieres ejecutar el schema por partes:

1. **Primero**: Extensiones y tabla users
2. **Segundo**: Tabla user_settings
3. **Tercero**: Tablas ga4_accounts y ga4_properties
4. **Cuarto**: Tabla analytics_cache
5. **Quinto**: Funciones y triggers
6. **Sexto**: Políticas RLS

## 🔐 Configuración de Storage (Avatares)

Para habilitar la carga de avatares:

1. **Crear Bucket en Supabase Storage**
   - Ve a "Storage" en el panel de Supabase
   - Clic en "Create bucket"
   - Nombre: `avatars`
   - Público: ✅ Sí

2. **Configurar Políticas de Storage**
   ```sql
   -- Permitir lectura pública
   CREATE POLICY "Avatar images are publicly accessible"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'avatars');

   -- Permitir que usuarios suban sus propios avatares
   CREATE POLICY "Users can upload their own avatar"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'avatars' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Permitir actualización
   CREATE POLICY "Users can update their own avatar"
   ON storage.objects FOR UPDATE
   USING (
     bucket_id = 'avatars' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Permitir eliminación
   CREATE POLICY "Users can delete their own avatar"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'avatars' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

## 🔧 Funciones Útiles Incluidas

### 1. `clean_expired_cache()`
Limpia automáticamente el caché expirado.

```sql
-- Ejecutar manualmente
SELECT clean_expired_cache();

-- O crear un cron job en Supabase
```

### 2. `hash_password(password_text)`
Genera un hash seguro de contraseña.

```sql
SELECT hash_password('mi_contraseña_segura');
```

### 3. `verify_password(password_text, hash_text)`
Verifica si una contraseña coincide con su hash.

```sql
SELECT verify_password('mi_contraseña', hash_almacenado);
```

### 4. `update_user_password(user_id, new_password)`
Actualiza la contraseña de un usuario.

```sql
SELECT update_user_password('uuid-del-usuario', 'nueva_contraseña');
```

## 📊 Vistas Disponibles

### `user_analytics_summary`
Resumen de cuentas y propiedades por usuario.

```sql
SELECT * FROM user_analytics_summary;
```

Retorna:
- user_id
- email
- full_name
- total_accounts (número de cuentas GA4)
- total_properties (número de propiedades GA4)
- google_token_expires_at
- token_valid (booleano)

## 🔒 Seguridad (Row Level Security)

Todas las tablas tienen RLS habilitado con las siguientes políticas:

- **SELECT**: Los usuarios solo pueden ver sus propios datos
- **INSERT**: Los usuarios solo pueden insertar sus propios datos
- **UPDATE**: Los usuarios solo pueden actualizar sus propios datos
- **DELETE**: Los usuarios solo pueden eliminar sus propios datos

## 🧪 Verificación Post-Instalación

Ejecuta estas consultas para verificar que todo está correcto:

```sql
-- 1. Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_settings', 'ga4_accounts', 'ga4_properties', 'analytics_cache');

-- 2. Verificar que RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 3. Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- 4. Verificar funciones
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';

-- 5. Verificar triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## 🔄 Mantenimiento

### Limpieza Automática de Caché

Configura un cron job en Supabase para limpiar el caché expirado:

1. Ve a "Database" > "Cron Jobs"
2. Crea un nuevo job:
   - Nombre: `clean_expired_cache`
   - Schedule: `0 */6 * * *` (cada 6 horas)
   - SQL: `SELECT clean_expired_cache();`

### Backup Regular

Configura backups automáticos en Supabase:
- Ve a "Settings" > "Backups"
- Habilita backups automáticos diarios

## 📝 Notas Importantes

1. **Extensiones requeridas**: `uuid-ossp` y `pgcrypto` deben estar habilitadas
2. **Permisos**: El usuario `authenticated` debe tener permisos en todas las tablas
3. **Índices**: Los índices están optimizados para las consultas más comunes
4. **Caché**: El caché expira automáticamente después de 1 hora
5. **Tokens**: Los tokens de Google se almacenan de forma segura con RLS

## 🆘 Solución de Problemas

### Error: "relation already exists"
- Algunas tablas ya existen. Puedes:
  - Eliminarlas primero: `DROP TABLE IF EXISTS nombre_tabla CASCADE;`
  - O comentar las secciones ya creadas en el SQL

### Error: "permission denied"
- Verifica que tienes permisos de administrador en la base de datos
- Ejecuta: `GRANT ALL ON SCHEMA public TO authenticated;`

### Error: "extension does not exist"
- Habilita las extensiones manualmente:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  ```

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de Supabase
2. Verifica que todas las extensiones están habilitadas
3. Asegúrate de que RLS está configurado correctamente
4. Consulta la documentación de Supabase: https://supabase.com/docs

---

**Última actualización**: Enero 2026
**Versión del Schema**: 1.0
