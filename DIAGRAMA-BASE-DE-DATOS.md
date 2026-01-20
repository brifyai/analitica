# 📊 Diagrama de Base de Datos - iMetrics

## 🗂️ Estructura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        SISTEMA IMETRICS                          │
│                   Base de Datos Supabase                         │
└─────────────────────────────────────────────────────────────────┘
```

## 🔗 Relaciones entre Tablas

```
                    ┌──────────────────┐
                    │   auth.users     │
                    │  (Supabase Auth) │
                    └────────┬─────────┘
                             │
                             │ id (UUID)
                             │
                    ┌────────▼─────────┐
                    │      users       │◄──────────────┐
                    │                  │               │
                    │ • id (PK)        │               │
                    │ • email          │               │
                    │ • full_name      │               │
                    │ • avatar_url     │               │
                    │ • google_tokens  │               │
                    └────────┬─────────┘               │
                             │                         │
                             │ user_id                 │
                             │                         │
        ┌────────────────────┼────────────────────┐    │
        │                    │                    │    │
        │                    │                    │    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│ user_settings  │  │  ga4_accounts   │  │ ga4_properties │
│                │  │                 │  │                │
│ • id (PK)      │  │ • id (PK)       │  │ • id (PK)      │
│ • user_id (FK) │  │ • user_id (FK)  │  │ • user_id (FK) │
│ • theme        │  │ • account_id    │  │ • account_id   │
│ • language     │  │ • account_name  │  │ • property_id  │
│ • notifications│  └─────────────────┘  │ • property_name│
│ • privacy      │                       │ • property_type│
└────────────────┘                       └────────┬───────┘
                                                  │
                                                  │ property_id
                                                  │
                                         ┌────────▼────────┐
                                         │ analytics_cache │
                                         │                 │
                                         │ • id (PK)       │
                                         │ • user_id (FK)  │
                                         │ • property_id   │
                                         │ • cached_data   │
                                         │ • expires_at    │
                                         └─────────────────┘
```

## 📋 Detalle de Tablas

### 1️⃣ users (Tabla Principal)

```
┌─────────────────────────────────────────────────────────┐
│                        USERS                             │
├─────────────────────────────────────────────────────────┤
│ 🔑 id                    UUID (PK, FK → auth.users)     │
│ 📧 email                 TEXT (UNIQUE, NOT NULL)        │
│ 👤 full_name             TEXT                           │
│ 🖼️  avatar_url            TEXT                           │
│ 🔐 password_hash         TEXT                           │
│                                                          │
│ 🔗 Google Analytics Tokens:                             │
│    • google_access_token      TEXT                      │
│    • google_refresh_token     TEXT                      │
│    • google_token_expires_at  TIMESTAMPTZ               │
│                                                          │
│ 📅 created_at            TIMESTAMPTZ (DEFAULT NOW())    │
│ 📅 updated_at            TIMESTAMPTZ (DEFAULT NOW())    │
└─────────────────────────────────────────────────────────┘
```

**Índices:**
- `idx_users_email` en `email`
- `idx_users_created_at` en `created_at`

**RLS:** ✅ Habilitado
- Los usuarios solo pueden ver/editar su propia información

---

### 2️⃣ user_settings (Configuraciones)

```
┌─────────────────────────────────────────────────────────┐
│                    USER_SETTINGS                         │
├─────────────────────────────────────────────────────────┤
│ 🔑 id                    UUID (PK)                      │
│ 🔗 user_id               UUID (FK → users, UNIQUE)      │
│                                                          │
│ 👤 PERFIL:                                               │
│    • full_name               TEXT                       │
│    • phone                   TEXT                       │
│    • company                 TEXT                       │
│    • bio                     TEXT                       │
│    • avatar_url              TEXT                       │
│                                                          │
│ 🔔 NOTIFICACIONES:                                       │
│    • notifications_email     BOOLEAN (DEFAULT true)     │
│    • notifications_push      BOOLEAN (DEFAULT false)    │
│    • notifications_analytics BOOLEAN (DEFAULT true)     │
│    • notifications_reports   BOOLEAN (DEFAULT true)     │
│    • notifications_maintenance BOOLEAN (DEFAULT true)   │
│                                                          │
│ 🎨 APARIENCIA:                                           │
│    • theme                   TEXT (light/dark/system)   │
│    • language                TEXT (es/en/pt)            │
│    • timezone                TEXT                       │
│    • date_format             TEXT                       │
│    • currency                TEXT                       │
│                                                          │
│ 🔒 PRIVACIDAD:                                           │
│    • profile_visibility      TEXT (public/private)      │
│    • analytics_sharing       BOOLEAN (DEFAULT false)    │
│    • data_retention          TEXT (1month-forever)      │
│    • two_factor_auth         BOOLEAN (DEFAULT false)    │
│                                                          │
│ 💾 DATOS:                                                │
│    • auto_backup             BOOLEAN (DEFAULT true)     │
│                                                          │
│ 📅 created_at            TIMESTAMPTZ (DEFAULT NOW())    │
│ 📅 updated_at            TIMESTAMPTZ (DEFAULT NOW())    │
└─────────────────────────────────────────────────────────┘
```

**Índices:**
- `idx_user_settings_user_id` en `user_id`

**RLS:** ✅ Habilitado

---

### 3️⃣ ga4_accounts (Cuentas de Google Analytics)

```
┌─────────────────────────────────────────────────────────┐
│                    GA4_ACCOUNTS                          │
├─────────────────────────────────────────────────────────┤
│ 🔑 id                    UUID (PK)                      │
│ 🔗 user_id               UUID (FK → users, NOT NULL)    │
│ 🏢 account_id            TEXT (NOT NULL)                │
│ 📝 account_name          TEXT (NOT NULL)                │
│                                                          │
│ 📅 created_at            TIMESTAMPTZ (DEFAULT NOW())    │
│ 📅 updated_at            TIMESTAMPTZ (DEFAULT NOW())    │
│                                                          │
│ 🔒 CONSTRAINT: UNIQUE (user_id, account_id)             │
└─────────────────────────────────────────────────────────┘
```

**Índices:**
- `idx_ga4_accounts_user_id` en `user_id`
- `idx_ga4_accounts_account_id` en `account_id`

**RLS:** ✅ Habilitado

---

### 4️⃣ ga4_properties (Propiedades de GA4)

```
┌─────────────────────────────────────────────────────────┐
│                   GA4_PROPERTIES                         │
├─────────────────────────────────────────────────────────┤
│ 🔑 id                    UUID (PK)                      │
│ 🔗 user_id               UUID (FK → users, NOT NULL)    │
│ 🏢 account_id            TEXT (NOT NULL)                │
│ 🏷️  property_id           TEXT (NOT NULL)                │
│ 📝 property_name         TEXT (NOT NULL)                │
│ 🌐 property_type         TEXT (WEB/APP/WEB_AND_APP)     │
│                                                          │
│ 📅 created_at            TIMESTAMPTZ (DEFAULT NOW())    │
│ 📅 updated_at            TIMESTAMPTZ (DEFAULT NOW())    │
│                                                          │
│ 🔒 CONSTRAINT: UNIQUE (user_id, property_id)            │
└─────────────────────────────────────────────────────────┘
```

**Índices:**
- `idx_ga4_properties_user_id` en `user_id`
- `idx_ga4_properties_account_id` en `account_id`
- `idx_ga4_properties_property_id` en `property_id`

**RLS:** ✅ Habilitado

---

### 5️⃣ analytics_cache (Caché de Datos)

```
┌─────────────────────────────────────────────────────────┐
│                  ANALYTICS_CACHE                         │
├─────────────────────────────────────────────────────────┤
│ 🔑 id                    UUID (PK)                      │
│ 🔗 user_id               UUID (FK → users, NOT NULL)    │
│ 🏷️  property_id           TEXT (NOT NULL)                │
│                                                          │
│ 📊 PARÁMETROS DE CONSULTA:                              │
│    • metrics                 JSONB                      │
│    • dimensions              JSONB                      │
│    • date_range_start        DATE (NOT NULL)            │
│    • date_range_end          DATE (NOT NULL)            │
│                                                          │
│ 💾 DATOS:                                                │
│    • cached_data             JSONB (NOT NULL)           │
│                                                          │
│ ⏰ CONTROL:                                              │
│    • expires_at              TIMESTAMPTZ (NOT NULL)     │
│                                                          │
│ 📅 created_at            TIMESTAMPTZ (DEFAULT NOW())    │
│ 📅 updated_at            TIMESTAMPTZ (DEFAULT NOW())    │
└─────────────────────────────────────────────────────────┘
```

**Índices:**
- `idx_analytics_cache_user_id` en `user_id`
- `idx_analytics_cache_property_id` en `property_id`
- `idx_analytics_cache_expires_at` en `expires_at`
- `idx_analytics_cache_date_range` en `(date_range_start, date_range_end)`
- `idx_analytics_cache_lookup` (compuesto) en `(user_id, property_id, date_range_start, date_range_end, expires_at)`

**RLS:** ✅ Habilitado

---

## 🔧 Funciones y Triggers

### Funciones Disponibles

```
┌─────────────────────────────────────────────────────────┐
│                      FUNCIONES                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 🧹 clean_expired_cache()                                │
│    → Limpia caché expirado                              │
│    → Retorna: INTEGER (cantidad eliminada)              │
│                                                          │
│ 🔐 hash_password(password_text TEXT)                    │
│    → Genera hash seguro de contraseña                   │
│    → Retorna: TEXT (hash)                               │
│                                                          │
│ ✅ verify_password(password_text TEXT, hash_text TEXT)  │
│    → Verifica contraseña contra hash                    │
│    → Retorna: BOOLEAN                                   │
│                                                          │
│ 🔄 update_user_password(user_id UUID, new_password TEXT)│
│    → Actualiza contraseña de usuario                    │
│    → Retorna: VOID                                      │
│                                                          │
│ ⏰ update_updated_at_column()                           │
│    → Trigger function para actualizar updated_at        │
│    → Se ejecuta automáticamente en UPDATE               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Triggers Activos

```
┌─────────────────────────────────────────────────────────┐
│                       TRIGGERS                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ⚡ update_users_updated_at                              │
│    → Tabla: users                                       │
│    → Evento: BEFORE UPDATE                              │
│                                                          │
│ ⚡ update_user_settings_updated_at                      │
│    → Tabla: user_settings                               │
│    → Evento: BEFORE UPDATE                              │
│                                                          │
│ ⚡ update_ga4_accounts_updated_at                       │
│    → Tabla: ga4_accounts                                │
│    → Evento: BEFORE UPDATE                              │
│                                                          │
│ ⚡ update_ga4_properties_updated_at                     │
│    → Tabla: ga4_properties                              │
│    → Evento: BEFORE UPDATE                              │
│                                                          │
│ ⚡ update_analytics_cache_updated_at                    │
│    → Tabla: analytics_cache                             │
│    → Evento: BEFORE UPDATE                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Vistas

### user_analytics_summary

```
┌─────────────────────────────────────────────────────────┐
│              USER_ANALYTICS_SUMMARY (Vista)              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Resumen de cuentas y propiedades por usuario            │
│                                                          │
│ Campos:                                                  │
│ • user_id                UUID                           │
│ • email                  TEXT                           │
│ • full_name              TEXT                           │
│ • total_accounts         INTEGER (COUNT)                │
│ • total_properties       INTEGER (COUNT)                │
│ • google_token_expires_at TIMESTAMPTZ                   │
│ • token_valid            BOOLEAN (calculado)            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 Seguridad (Row Level Security)

### Políticas RLS por Tabla

```
┌─────────────────────────────────────────────────────────┐
│                    POLÍTICAS RLS                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 📋 users:                                                │
│    ✅ SELECT: Ver propio perfil                         │
│    ✅ UPDATE: Actualizar propio perfil                  │
│    ✅ INSERT: Insertar propio perfil                    │
│                                                          │
│ 📋 user_settings:                                        │
│    ✅ SELECT: Ver propias configuraciones               │
│    ✅ UPDATE: Actualizar propias configuraciones        │
│    ✅ INSERT: Insertar propias configuraciones          │
│                                                          │
│ 📋 ga4_accounts:                                         │
│    ✅ SELECT: Ver propias cuentas                       │
│    ✅ INSERT: Insertar propias cuentas                  │
│    ✅ UPDATE: Actualizar propias cuentas                │
│    ✅ DELETE: Eliminar propias cuentas                  │
│                                                          │
│ 📋 ga4_properties:                                       │
│    ✅ SELECT: Ver propias propiedades                   │
│    ✅ INSERT: Insertar propias propiedades              │
│    ✅ UPDATE: Actualizar propias propiedades            │
│    ✅ DELETE: Eliminar propias propiedades              │
│                                                          │
│ 📋 analytics_cache:                                      │
│    ✅ SELECT: Ver propio caché                          │
│    ✅ INSERT: Insertar propio caché                     │
│    ✅ UPDATE: Actualizar propio caché                   │
│    ✅ DELETE: Eliminar propio caché                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Regla General:** Todas las políticas verifican que `auth.uid() = user_id`

---

## 💾 Storage (Supabase Storage)

### Bucket: avatars

```
┌─────────────────────────────────────────────────────────┐
│                   STORAGE: avatars                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 🗂️  Bucket ID: avatars                                  │
│ 🌐 Público: Sí                                           │
│                                                          │
│ Políticas:                                               │
│ ✅ SELECT: Lectura pública                              │
│ ✅ INSERT: Usuarios pueden subir su avatar              │
│ ✅ UPDATE: Usuarios pueden actualizar su avatar         │
│ ✅ DELETE: Usuarios pueden eliminar su avatar           │
│                                                          │
│ Estructura de carpetas:                                  │
│ /avatars/{user_id}/{filename}                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📈 Flujo de Datos

### Autenticación y Configuración

```
1. Usuario se registra
   ↓
2. Se crea registro en auth.users (Supabase Auth)
   ↓
3. Se crea registro en users (trigger automático)
   ↓
4. Se crean configuraciones por defecto en user_settings
   ↓
5. Usuario conecta Google Analytics
   ↓
6. Se almacenan tokens en users.google_*
   ↓
7. Se cargan cuentas → ga4_accounts
   ↓
8. Se cargan propiedades → ga4_properties
```

### Consulta de Analytics

```
1. Usuario solicita datos de Analytics
   ↓
2. Se verifica caché en analytics_cache
   ↓
3a. Si existe y no expiró → Retornar datos cacheados
   ↓
3b. Si no existe o expiró:
    ↓
    4. Consultar Google Analytics API
    ↓
    5. Almacenar en analytics_cache
    ↓
    6. Retornar datos
```

---

## 🎯 Optimizaciones

### Índices Estratégicos

1. **Búsquedas por usuario**: Todas las tablas tienen índice en `user_id`
2. **Búsquedas de caché**: Índice compuesto para lookup rápido
3. **Expiración de caché**: Índice en `expires_at` para limpieza eficiente
4. **Rangos de fecha**: Índice en `(date_range_start, date_range_end)`

### Constraints Únicos

1. `users.email` - Evita duplicados de email
2. `user_settings.user_id` - Un usuario, una configuración
3. `(user_id, account_id)` en ga4_accounts - Evita duplicados
4. `(user_id, property_id)` en ga4_properties - Evita duplicados

---

## 📊 Estadísticas Estimadas

```
┌─────────────────────────────────────────────────────────┐
│              ESTIMACIÓN DE CRECIMIENTO                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 👥 users:              ~1,000 registros/año             │
│ ⚙️  user_settings:      ~1,000 registros/año             │
│ 🏢 ga4_accounts:        ~5,000 registros/año             │
│ 🏷️  ga4_properties:     ~10,000 registros/año            │
│ 💾 analytics_cache:     ~100,000 registros/mes          │
│                        (con limpieza automática)         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

**Última actualización**: Enero 2026  
**Versión**: 1.0
