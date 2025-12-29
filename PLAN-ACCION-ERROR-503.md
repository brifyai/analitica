# 🚨 PLAN DE ACCIÓN - ERROR 503

## 📊 **SITUACIÓN ACTUAL:**
```
GET https://imetrics.cl/ 503 (Service Unavailable)
GET https://imetrics.cl/favicon.ico 503 (Service Unavailable)
```

## 🎯 **OBJETIVO:**
Resolver el error 503 y hacer que la aplicación funcione correctamente en producción.

## 📋 **PASOS INMEDIATOS:**

### **PASO 1: VERIFICAR ESTADO EN COOLIFY** ⚡
1. **Ir a Coolify Dashboard**
2. **Seleccionar aplicación TV-radio**
3. **Verificar estado del contenedor:**
   - ✅ **Running** = OK
   - 🔄 **Restarting** = PROBLEMA
   - ❌ **Stopped** = PROBLEMA

### **PASO 2: REVISAR LOGS DEL CONTENEDOR** 🔍
1. **Click en "Logs" en Coolify**
2. **Buscar errores específicos:**
   ```
   ❌ "Cannot find module 'express'"
   ❌ "Port already in use"
   ❌ "npm run build failed"
   ❌ "Segmentation fault"
   ❌ "Out of memory"
   ```

### **PASO 3: VERIFICAR VARIABLES DE ENTORNO** ⚙️
**En Coolify → Settings → Environment Variables:**
```bash
PORT=3001                    ✅ REQUERIDO
NODE_ENV=production          ✅ REQUERIDO
REACT_APP_PUBLIC_URL=https://imetrics.cl  ✅ REQUERIDO
NPM_CONFIG_PRODUCTION=false  ✅ PARA BUILD
```

### **PASO 4: REINICIAR APLICACIÓN** 🔄
1. **Click "Restart" en Coolify**
2. **Esperar 2-3 minutos**
3. **Monitorear logs durante el reinicio**
4. **Verificar que el contenedor stay "Running"**

### **PASO 5: VERIFICAR CONECTIVIDAD** 🌐
```bash
# Health check manual
curl -v https://imetrics.cl/api/health

# Verificar que responde
curl -I https://imetrics.cl/
```

## 🔧 **SOLUCIONES POR TIPO DE ERROR:**

### **SI EL CONTENEDOR SE REINICIA CONSTANTEMENTE:**
**Causa**: Error en el proceso de inicio
**Solución**:
1. Verificar que `server.js` existe y es válido
2. Verificar que todas las dependencias están instaladas
3. Verificar permisos de archivos

### **SI EL BUILD FALLÓ:**
**Causa**: `npm run build` no se completó
**Solución**:
1. Verificar que `react-scripts` está en dependencies
2. Verificar que no hay errores de TypeScript/ESLint
3. Reconstruir manualmente: `npm ci && npm run build`

### **SI HAY ERRORES DE MÓDULOS:**
**Causa**: Dependencias no instaladas correctamente
**Solución**:
1. Verificar Dockerfile
2. Asegurar que `npm ci` se ejecuta
3. Verificar que `express` está en dependencies

### **SI EL PUERTO NO RESPONDE:**
**Causa**: Servidor no escucha en el puerto correcto
**Solución**:
1. Verificar `EXPOSE 3001` en Dockerfile
2. Verificar `PORT=3001` en variables de entorno
3. Verificar `app.listen(PORT, '0.0.0.0')` en server.js

## 📊 **CHECKLIST DE VERIFICACIÓN:**

- [ ] ✅ Contenedor está "Running" (no "Restarting")
- [ ] ✅ Logs no muestran errores críticos
- [ ] ✅ Variables de entorno configuradas correctamente
- [ ] ✅ Puerto 3001 mapeado correctamente
- [ ] ✅ Health check responde: `curl https://imetrics.cl/api/health`
- [ ] ✅ Aplicación carga: `curl https://imetrics.cl/`

## 🎯 **RESULTADO ESPERADO:**

**Después de aplicar las soluciones:**
```
✅ GET https://imetrics.cl/ 200 (OK)
✅ GET https://imetrics.cl/api/health 200 (OK)
✅ Aplicación React carga correctamente
✅ OAuth funciona sin errores
```

## 📞 **ESCALACIÓN:**

**Si después de 30 minutos el problema persiste:**
1. **Contactar soporte de Coolify**
2. **Proporcionar logs completos del contenedor**
3. **Mencionar que es una aplicación Node.js + React**
4. **Incluir configuración de Dockerfile**

---
**Fecha**: 2025-12-27  
**Estado**: 🚨 EJECUTANDO PLAN DE ACCIÓN
**Prioridad**: CRÍTICA - Aplicación no disponible