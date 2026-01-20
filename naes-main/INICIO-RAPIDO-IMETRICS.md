# ⚡ Inicio Rápido - Supabase para iMetrics

## 🎯 En 3 Comandos

```bash
# 1. Dar permisos de ejecución
chmod +x start-imetrics.sh setup-database.sh

# 2. Iniciar Supabase
./start-imetrics.sh

# 3. Configurar base de datos
./setup-database.sh
```

**¡Listo!** Supabase está corriendo con la base de datos de iMetrics configurada.

---

## 🌐 Acceder

### Supabase Studio
- **URL:** http://localhost:3000
- **Usuario:** `admin_imetrics`
- **Password:** `iMetrics2026!Secure`

### API
- **URL:** http://localhost:8000

---

## 🔄 Actualizar iMetrics

Actualiza estas variables en tu aplicación iMetrics:

```bash
REACT_APP_SUPABASE_URL=http://localhost:8000
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
```

---

## 🛠️ Comandos Útiles

```bash
# Ver logs
docker compose logs -f

# Reiniciar
docker compose restart

# Detener
docker compose down

# Ver estado
docker compose ps
```

---

## 📚 Más Información

Lee `SETUP-IMETRICS.md` para configuración avanzada y deployment en producción.

