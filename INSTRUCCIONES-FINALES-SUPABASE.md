# ✅ CONFIGURACIÓN LISTA - Supabase para iMetrics

## 🎉 TODO ESTÁ LISTO

El archivo `SUPABASE-LISTO-PARA-COPIAR.txt` contiene TODAS las variables configuradas y listas para usar.

---

## ⚠️ SOLO FALTA CONFIGURAR SMTP (2 valores)

Si quieres que funcione el registro por email, cambia estos 2 valores:

```
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password-gmail
```

**Si no configuras SMTP:**
- ✅ Google OAuth funcionará perfectamente
- ❌ Registro por email NO funcionará
- ❌ Recuperación de contraseña NO funcionará

**Para configurar SMTP con Gmail:**
1. Ve a https://myaccount.google.com/apppasswords
2. Genera una "App Password"
3. Reemplaza `tu-email@gmail.com` con tu email
4. Reemplaza `tu-app-password-gmail` con la App Password generada

---

## 🚀 PASOS PARA APLICAR

### 1. Abrir el archivo
Abre: `SUPABASE-LISTO-PARA-COPIAR.txt`

### 2. (Opcional) Configurar SMTP
Si quieres email, edita las líneas 31 y 32:
```
SMTP_USER=tu-email-real@gmail.com
SMTP_PASS=tu-app-password-real
```

### 3. Copiar TODO
- Selecciona TODO el contenido (Ctrl+A)
- Copia (Ctrl+C)

### 4. Pegar en Easypanel
1. Ve a Easypanel
2. Selecciona tu servicio de Supabase
3. Ve a "Environment Variables"
4. Pega TODO el contenido (Ctrl+V)
5. Guarda

### 5. Configurar Google Cloud Console
Agrega esta URI en Google Cloud Console > Credenciales:

```
https://imetrics-supabase-imetrics.dsb9vm.easypanel.host/auth/v1/callback
```

**Pasos detallados:**
1. Ve a https://console.cloud.google.com/apis/credentials
2. Clic en tu OAuth Client ID (el que configuraste para iMetrics)
3. En "URIs de redireccionamiento autorizados", agrega:
   ```
   https://imetrics-supabase-imetrics.dsb9vm.easypanel.host/auth/v1/callback
   ```
4. Guarda

### 6. Reiniciar Supabase
1. En Easypanel, reinicia el servicio de Supabase
2. Espera 2-3 minutos

---

## ✅ VERIFICACIÓN

### Verificar Dashboard de Supabase

1. Abre: https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
2. Login con:
   - Usuario: `admin_imetrics`
   - Password: `iMetrics2026!Secure`

### Verificar Google OAuth

1. En el dashboard, ve a "Authentication" > "Providers"
2. Deberías ver "Google" habilitado
3. Verifica que el Client ID esté configurado correctamente

### Probar desde tu App

1. Abre tu app iMetrics
2. Intenta login con Google
3. Debería funcionar perfectamente

---

## 📊 CREDENCIALES GENERADAS

### Dashboard de Supabase
```
URL: https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
Usuario: admin_imetrics
Password: iMetrics2026!Secure
```

### Secrets Generados (ya están en el archivo)
```
POSTGRES_PASSWORD: pF97/E2anWQwtWJxhKB7T3IbSBT3ooQspIT5CU1ww/VY=
JWT_SECRET: cQ1DS+mMAmYZI2/wlZ2LXYUkT1spBZZJc/uyw3Fl8e4=
SECRET_KEY_BASE: YpjemlPZIH1VsZT28T12mFutOz7BQC0Yzw7ymeH7c11Q=
VAULT_ENC_KEY: aCZ7CbxxsKR4iTpq5DWHMzSkMAQdcYwFvTU4EabsScI=
PG_META_CRYPTO_KEY: eSeTeDmgsaUvp7y96ywsQ84DB0COI14QB8HgnhZZlQ3g=
```

### Google OAuth (ya configurado)
```
Client ID: [TU_GOOGLE_CLIENT_ID]
Client Secret: [TU_GOOGLE_CLIENT_SECRET]
```

**Nota:** Los valores reales están en el archivo `SUPABASE-LISTO-PARA-COPIAR.txt` (no incluido en Git por seguridad)

---

## 🎯 RESUMEN

✅ Secrets seguros generados  
✅ Google OAuth configurado  
✅ URLs de iMetrics configuradas  
✅ Dashboard password configurado  
⚠️ SMTP pendiente (opcional)  

**Tiempo total: 5 minutos**

---

## 🆘 Si algo no funciona

### Error al acceder al dashboard
- Verifica que esperaste 2-3 minutos después de reiniciar
- Verifica que el password sea: `iMetrics2026!Secure`

### Error en Google OAuth
- Verifica que agregaste la redirect URI en Google Cloud Console
- Espera 5 minutos después de agregar la URI
- Verifica que la URI sea exactamente: `https://imetrics-supabase-imetrics.dsb9vm.easypanel.host/auth/v1/callback`

### Email no funciona
- Configura SMTP con Gmail App Password
- O cambia `ENABLE_EMAIL_AUTOCONFIRM=true` para desarrollo

---

**¡Listo para usar!** 🚀
