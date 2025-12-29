# 🔍 VERIFICACIÓN EN NETLIFY

## 📋 CÓMO VERIFICAR SI LAS VARIABLES ESTÁN CONFIGURADAS

### **Paso 1: Acceder a Netlify**
1. Ir a https://app.netlify.com/
2. Seleccionar tu proyecto
3. Ir a **Site settings** → **Environment variables**

### **Paso 2: Verificar Variables Existentes**
Deberías ver estas variables configuradas:

#### ✅ **Variables que DEBEN estar:**
```
REACT_APP_CHUTES_API_KEY=cpk_f07741417dab421f995b63e2b9869206.272f8a269e1b5ec092ba273b83403b1d.u5no8AouQcBglfhegVrjdcU98kPSCkYt
REACT_APP_GROQ_API_KEY=gsk_tu_api_key_de_groq (si la obtuviste)
REACT_APP_AI_FALLBACK_ENABLED=true
REACT_APP_VIDEO_ANALYSIS_TIMEOUT=30000
```

### **Paso 3: Si NO están configuradas**
1. **Click "Add a variable"**
2. **Key**: `REACT_APP_CHUTES_API_KEY`
3. **Value**: `cpk_f07741417dab421f995b63e2b9869206.272f8a269e1b5ec092ba273b83403b1d.u5no8AouQcBglfhegVrjdcU98kPSCkYt`
4. **Environment**: `Production, Deploy preview, Development`
5. **Click "Create variable"**

Repetir para cada variable.

### **Paso 4: Verificar Deploy**
1. Ir a **"Deploys"**
2. **Click "Trigger deploy"** → **"Deploy site"**
3. **Esperar** a que termine el build
4. **Verificar** que no hay errores en los logs

## 🧪 TESTING EN LA APLICACIÓN

### **Cómo probar que funciona:**
1. **Ir a la aplicación** en Netlify
2. **Ir a "Análisis de Spots TV"**
3. **Subir un video** de spot
4. **Click "Analizar Video con IA"**
5. **Verificar** que aparece el progreso sin errores 503

### **Señales de que funciona:**
- ✅ **Progreso visible**: 10% → 20% → 40% → 50% → 90% → 100%
- ✅ **Test de conectividad**: "Probando conectividad con Chutes AI..."
- ✅ **Análisis exitoso**: Resultados del análisis de video
- ✅ **Sin errores 503**: No aparece "Service Unavailable"

### **Señales de que NO funciona:**
- ❌ **Error inmediato**: "API key no configurada"
- ❌ **Error 503**: "Service Unavailable" repetitivo
- ❌ **Timeout**: El análisis se queda cargando indefinidamente

## 🔧 TROUBLESHOOTING

### **Si aparece "API key no configurada":**
- Verificar que la variable está en Netlify
- Verificar que empieza con `REACT_APP_`
- Hacer rebuild de la aplicación

### **Si aparecen errores 503:**
- Chutes AI puede estar sobrecargado
- El sistema debería usar fallback automáticamente
- Intentar más tarde

### **Si el build falla:**
- Verificar sintaxis de las variables
- No usar comillas en los valores
- Verificar que no hay espacios extra

## 📊 ESTADOS POSIBLES

### 🟢 **ÓPTIMO (ambas APIs configuradas):**
- Análisis de video: Chutes AI
- Análisis de texto: Groq
- Fallback: Disponible

### 🟡 **BUENO (solo Chutes AI):**
- Análisis de video: Chutes AI
- Análisis de texto: Chutes AI (más lento)
- Fallback: Disponible

### 🔴 **FALLBACK ONLY (sin APIs):**
- Análisis de video: Fallback
- Análisis de texto: Fallback
- Fallback: ✅ Basado en datos reales de Google Analytics

## ✅ CONFIRMACIÓN FINAL

**Para confirmar que está funcionando:**
1. ✅ Variables configuradas en Netlify
2. ✅ Deploy exitoso sin errores
3. ✅ Test de conectividad exitoso en la app
4. ✅ Análisis de video funciona sin errores 503

**Si todo esto está OK, entonces SÍ están configuradas correctamente en Netlify.**