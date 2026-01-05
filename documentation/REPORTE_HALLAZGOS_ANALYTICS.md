# 📊 Reporte de Investigación: Funcionamiento de Analytics

## 1. Frecuencia de Medición
- **Hallazgo:** La ventana de análisis por defecto es de **30 minutos**.
- **Evidencia:** `minuteByMinuteAnalysisService.js` define `analysisWindow = 30` por defecto.
- **Nota:** Google Analytics no entrega datos minuto a minuto en tiempo real del pasado inmediato; tiene un retraso de procesamiento de 24-48 horas para datos granulares confirmados.

## 2. APIs Utilizadas
El sistema utiliza dos APIs distintas de Google:
1.  **Analytics Admin API:** Para listar cuentas y propiedades.
2.  **Analytics Data API:** Para obtener las métricas y reportes.

## 3. Arquitectura Frontend vs Backend
- **Estado Actual:** Híbrido.
- **Backend (Express):** Actúa como proxy para `/api/accounts`, `/api/properties` y `/api/analytics-proxy`.
- **Frontend:** Algunas llamadas a servicios de IA (Gemini, Chutes, Groq) se hacen directamente desde el cliente.
- **Conclusión:** La parte de Analytics SÍ cumple con estar en el backend, tal como solicitó el jefe.

## 4. Base de Datos de Televisión
- **Hallazgo:** No existe una base de datos de TV integrada.
- **Funcionamiento:** Los datos de spots (programas, canales) provienen exclusivamente de los archivos Excel que carga el usuario manualmente.

## 5. Variables de Pareo (Matching)
Para cruzar los spots con la data de Analytics se utilizan:
- **Requeridas:** `fecha`, `hora_inicio`.
- **Opcionales:** `canal`, `titulo_programa`, `duracion`, `tipo_comercial`.
