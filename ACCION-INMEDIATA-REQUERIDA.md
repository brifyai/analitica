# ⚠️ ACCIÓN INMEDIATA REQUERIDA

## 🔴 PROBLEMA ACTUAL
El servidor en producción está crasheando con este error:
```
PathError [TypeError]: Missing parameter name at index 21: /api/analytics-proxy*
```

## ✅ SOLUCIÓN YA APLICADA EN GIT
- Commit `281dd13`: Fix del error aplicado
- Commit `51033f5`: Trigger para rebuild
- El código en GitHub está CORRECTO

## 🚨 LO QUE NECESITAS HACER AHORA

### PASO 1: Ir a tu Panel de Hosting
Ve a donde tienes desplegado iMetrics (Coolify o Easypanel)

### PASO 2: Hacer Rebuild/Redeploy
Busca el botón que diga:
- "Redeploy" o
- "Rebuild" o
- "Restart with new build" o
- "Deploy latest"

### PASO 3: Esperar
El rebuild tomará 2-5 minutos. Verás algo como:
```
Building...
Installing dependencies...
Building React app...
Starting server...
✓ Server running on port 3000
```

### PASO 4: Verificar
El servidor debe iniciar SIN el error de PathError.

---

## 📍 UBICACIONES COMUNES DEL BOTÓN

### En Coolify:
1. Dashboard → Projects
2. Selecciona "iMetrics" o "analitica"
3. Botón "Redeploy" (arriba a la derecha)

### En Easypanel:
1. Services → iMetrics
2. Tab "Deploy"
3. Botón "Rebuild" o "Deploy"

---

## ⏱️ TIEMPO ESTIMADO
- Rebuild: 2-5 minutos
- Verificación: 1 minuto
- **Total: ~5 minutos**

---

## ✅ DESPUÉS DEL REBUILD

El servidor debe:
1. ✅ Iniciar sin errores
2. ✅ No mostrar PathError
3. ✅ Responder en el puerto 3000/3001
4. ✅ La ruta `/api/analytics-proxy/*` debe funcionar

---

## 🆘 SI EL ERROR PERSISTE

1. Verifica que el rebuild se completó (100%)
2. Revisa los logs del servidor
3. Intenta "Clean Build Cache" antes de rebuild
4. Verifica que está usando la rama `main` de Git

---

## 📝 RESUMEN TÉCNICO

**Problema:** Sintaxis incorrecta de wildcard en Express
**Causa:** `/api/analytics-proxy*` no es válido en path-to-regexp
**Solución:** Cambiar a `/api/analytics-proxy/*`
**Estado:** ✅ Código corregido | ⏳ Pendiente rebuild en producción

