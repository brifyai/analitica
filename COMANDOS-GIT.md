# 📤 Comandos para Enviar a Git

## ⚠️ IMPORTANTE - Archivos Sensibles

He actualizado `.gitignore` para **NO subir** estos archivos con credenciales:

```
❌ SUPABASE-LISTO-PARA-COPIAR.txt (contiene passwords)
❌ VARIABLES-DEPLOYMENT-IMETRICS.txt (contiene API keys)
❌ supabase-easypanel-imetrics.env (contiene secrets)
❌ .env.production (contiene configuración sensible)
```

Estos archivos quedan **solo en tu computadora local**.

---

## ✅ Archivos que SÍ se subirán

```
✅ Base de datos:
   - database-schema.sql
   - database-schema-seguro.sql
   - limpiar-base-de-datos.sql
   - verificar-base-de-datos-supabase.sql
   - consultas-utiles.sql

✅ Documentación:
   - README-BASE-DE-DATOS.md
   - INSTRUCCIONES-BASE-DE-DATOS.md
   - DIAGRAMA-BASE-DE-DATOS.md
   - GUIA-CONFIGURACION-DEPLOYMENT.md
   - GUIA-DEPLOYMENT-COMPLETA.md
   - GUIA-SUPABASE-EASYPANEL.md
   - APIS-GOOGLE-EXPLICADAS.md
   - Y todas las demás guías .md

✅ Templates (sin credenciales):
   - .env.example
   - .env.production.template

✅ Código fuente:
   - Todo el código de src/
   - package.json
   - Etc.
```

---

## 🚀 Comandos para Enviar a Git

### Opción 1: Comandos Individuales (Recomendado)

```bash
# 1. Ver qué archivos han cambiado
git status

# 2. Agregar todos los archivos (excepto los del .gitignore)
git add .

# 3. Crear commit con mensaje descriptivo
git commit -m "feat: Agregar configuración completa de base de datos y deployment

- Agregar schema completo de Supabase con 5 tablas
- Agregar scripts de verificación y limpieza
- Agregar documentación completa de deployment
- Agregar guías de configuración de Google OAuth
- Actualizar .gitignore para excluir archivos sensibles
- Agregar templates de variables de entorno"

# 4. Enviar a GitHub/GitLab
git push origin main
```

### Opción 2: Comando Todo en Uno

```bash
git add . && git commit -m "feat: Configuración completa de BD y deployment" && git push origin main
```

---

## 🔍 Verificar Antes de Enviar

### 1. Ver qué archivos se van a subir

```bash
git status
```

### 2. Ver qué archivos están siendo ignorados

```bash
git status --ignored
```

Deberías ver en "Ignored files":
- SUPABASE-LISTO-PARA-COPIAR.txt
- VARIABLES-DEPLOYMENT-IMETRICS.txt
- supabase-easypanel-imetrics.env
- .env.production

### 3. Ver el contenido del commit antes de enviarlo

```bash
git diff --cached
```

---

## ⚠️ Si Accidentalmente Subiste Archivos Sensibles

### Eliminar archivo del repositorio (pero mantenerlo local)

```bash
# Eliminar del repositorio pero mantener en local
git rm --cached SUPABASE-LISTO-PARA-COPIAR.txt
git rm --cached VARIABLES-DEPLOYMENT-IMETRICS.txt
git rm --cached supabase-easypanel-imetrics.env

# Commit y push
git commit -m "chore: Eliminar archivos sensibles del repositorio"
git push origin main
```

### Si ya está en el historial de Git

Si ya subiste archivos sensibles y están en el historial:

1. **Cambiar todas las contraseñas y API keys inmediatamente**
2. Usar `git filter-branch` o BFG Repo-Cleaner para limpiar el historial
3. O crear un nuevo repositorio limpio

---

## 📊 Resumen de Archivos

### Total de archivos creados: ~30

**Archivos de Base de Datos (SQL):**
- 5 archivos SQL

**Documentación (MD):**
- 15+ archivos de documentación

**Configuración:**
- 3 archivos de variables (2 sensibles, 1 template)

**Archivos sensibles (NO se suben):**
- 3 archivos con credenciales

---

## ✅ Checklist Pre-Push

Antes de hacer `git push`, verifica:

- [ ] Ejecuté `git status` y revisé los archivos
- [ ] Los archivos sensibles NO aparecen en la lista
- [ ] El .gitignore está actualizado
- [ ] El mensaje de commit es descriptivo
- [ ] Revisé que no haya credenciales en el código

---

## 🎯 Después del Push

1. **Ve a GitHub/GitLab** y verifica que los archivos se subieron correctamente
2. **Verifica que NO estén** los archivos sensibles
3. **Revisa el README.md** para que otros sepan cómo configurar el proyecto

---

## 📝 Mensaje de Commit Sugerido

```
feat: Agregar configuración completa de base de datos y deployment

Cambios principales:
- Schema completo de Supabase con 5 tablas (users, user_settings, ga4_accounts, ga4_properties, analytics_cache)
- Scripts de verificación y limpieza de BD
- Documentación completa de deployment para Coolify/Netlify/Vercel
- Guías de configuración de Google OAuth y APIs
- Templates de variables de entorno
- Actualización de .gitignore para proteger credenciales

Archivos SQL:
- database-schema.sql: Schema completo con RLS
- database-schema-seguro.sql: Versión que no sobrescribe
- limpiar-base-de-datos.sql: Script de limpieza
- verificar-base-de-datos-supabase.sql: Verificación completa
- consultas-utiles.sql: 50+ consultas útiles

Documentación:
- Guías de deployment para múltiples plataformas
- Configuración de Google Cloud Console
- Configuración de Supabase en Easypanel
- Explicación de APIs de Google
- Diagramas de base de datos

Templates:
- .env.production.template: Template sin credenciales
```

---

## 🆘 Problemas Comunes

### Error: "fatal: not a git repository"

**Solución:**
```bash
git init
git remote add origin https://github.com/tu-usuario/tu-repo.git
```

### Error: "Updates were rejected"

**Solución:**
```bash
git pull origin main --rebase
git push origin main
```

### Error: "Permission denied"

**Solución:**
- Verifica que tengas permisos en el repositorio
- Verifica tu autenticación (SSH key o token)

---

**¡Listo para enviar a Git!** 🚀

Ejecuta los comandos y tu código estará en el repositorio (sin las credenciales sensibles).
