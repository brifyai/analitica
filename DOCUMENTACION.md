# 📊 Documentación Técnica: iMetrics

**Dashboard de Analítica para TV/Radio**

---

## 📝 Descripción General

iMetrics es una plataforma de análisis que conecta **datos de Google Analytics** con el rendimiento de **spots publicitarios de TV/Radio**. Permite medir el impacto real de campañas televisivas en el tráfico web.

---

## 🏗️ Arquitectura del Sistema

```mermaid
flowchart TB
    subgraph Frontend["🖥️ Frontend (React)"]
        App[App.js]
        Auth[AuthContext]
        GA[GoogleAnalyticsContext]
        
        subgraph Pages["Páginas"]
            Dashboard[Dashboard]
            Analytics[Analytics]
            SpotAnalysis[SpotAnalysis]
            FrasesRadio[FrasesRadio]
            Settings[Settings]
        end
    end
    
    subgraph Backend["⚙️ Backend (Express)"]
        Server[server/index.js]
        API_Accounts["/api/accounts"]
        API_Properties["/api/properties"]
        API_Proxy["/api/analytics-proxy"]
    end
    
    subgraph External["🌐 Servicios Externos"]
        Supabase[(Supabase DB)]
        GoogleGA[Google Analytics API]
        GoogleAuth[Google OAuth]
        GeminiAI[Google Gemini AI]
        YouTube[YouTube API]
        ChutesAI[Chutes AI]
    end
    
    App --> Auth
    App --> GA
    Auth --> Supabase
    Auth --> GoogleAuth
    GA --> Server
    Server --> GoogleGA
    SpotAnalysis --> GeminiAI
    SpotAnalysis --> ChutesAI
    SpotAnalysis --> YouTube
```

---

## 🔐 Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant App as React App
    participant Auth as AuthContext
    participant Supabase as Supabase Auth
    participant Google as Google OAuth
    
    U->>App: Accede a la aplicación
    App->>Auth: Verifica sesión
    Auth->>Supabase: getSession()
    
    alt No hay sesión
        Supabase-->>Auth: null
        Auth-->>App: Redirect a Login
        U->>App: Click "Iniciar con Google"
        App->>Google: OAuth2 Request
        Google-->>App: Código de autorización
        App->>Supabase: signInWithOAuth()
        Supabase-->>App: Sesión creada
    else Hay sesión válida
        Supabase-->>Auth: Session data
        Auth-->>App: Usuario autenticado
        App-->>U: Mostrar Dashboard
    end
```

---

## 📊 Flujo de Análisis de Spots

```mermaid
flowchart LR
    subgraph Input["📥 Entrada"]
        Excel[Archivo Excel<br/>con spots]
        Video[Video del Spot]
        YouTube[URL YouTube]
    end
    
    subgraph Process["⚙️ Procesamiento"]
        Parse[Parsear Excel]
        SelectSpots[Seleccionar Spots]
        GetGA[Obtener datos GA<br/>por minuto]
        AnalyzeVideo[Analizar Video<br/>con IA]
    end
    
    subgraph Analysis["🧠 Análisis"]
        Correlation[Correlación<br/>TV-Web]
        Impact[Calcular<br/>Impacto]
        Recommendations[Generar<br/>Recomendaciones]
    end
    
    subgraph Output["📤 Salida"]
        Timeline[Timeline<br/>Minuto a Minuto]
        Summary[Resumen<br/>Ejecutivo]
        PPTX[Exportar<br/>PowerPoint]
    end
    
    Excel --> Parse --> SelectSpots
    Video --> AnalyzeVideo
    YouTube --> AnalyzeVideo
    SelectSpots --> GetGA --> Correlation
    AnalyzeVideo --> Correlation
    Correlation --> Impact --> Recommendations
    Impact --> Timeline
    Recommendations --> Summary
    Timeline --> PPTX
    Summary --> PPTX
```

---

## 🗂️ Estructura de Componentes

```mermaid
graph TD
    subgraph Core["Core"]
        App[App.js]
        Layout[Layout]
        ErrorBoundary[ErrorBoundary]
    end
    
    subgraph Contexts["Contexts"]
        AuthCtx[AuthContext]
        GACtx[GoogleAnalyticsContext]
    end
    
    subgraph Pages["Páginas Principales"]
        Dashboard[Dashboard]
        Analytics[Analytics]
        SpotAnalysis[SpotAnalysisMinuteByMinute]
        FrasesRadio[FrasesRadio]
        Settings[Settings]
        Accounts[Accounts]
    end
    
    subgraph SpotComponents["Componentes SpotAnalysis"]
        YouTubeInput[YouTubeVideoInput]
        Timeline[MinuteByMinuteTimeline]
        ImpactSummary[ImpactSummary]
        Insights[Insights]
    end
    
    subgraph Services["Servicios"]
        GAService[googleAnalyticsService]
        AIService[aiAnalysisService]
        ChutesService[chutesVideoAnalysisService]
        PPTXService[pptxExportService]
    end
    
    App --> Core
    App --> Contexts
    Layout --> Pages
    SpotAnalysis --> SpotComponents
    Pages --> Services
```

---

## 📁 Estructura de Carpetas

```
src/
├── components/           # Componentes React
│   ├── Auth/            # Login, Register, Callbacks
│   ├── Dashboard/       # Panel principal
│   ├── Analytics/       # Visualización de métricas
│   ├── SpotAnalysis/    # 🌟 Módulo principal
│   │   ├── SpotAnalysisMinuteByMinute.js
│   │   └── components/  # 20 subcomponentes
│   ├── FrasesRadio/     # Análisis de frases
│   ├── Settings/        # Configuración
│   └── UI/              # Componentes reutilizables
│
├── contexts/            # Estado global
│   ├── AuthContext.js   # Autenticación
│   └── GoogleAnalyticsContext.js
│
├── services/            # Lógica de negocio
│   ├── googleAnalyticsService.js
│   ├── aiAnalysisService.js
│   ├── chutesVideoAnalysisService.js
│   ├── minuteByMinuteAnalysisService.js
│   └── pptxExportService.js
│
├── config/              # Configuración
├── hooks/               # Custom hooks
└── utils/               # Utilidades

server/
└── index.js             # API Express (proxy a GA)
```

---

## 🔧 Servicios Principales

| Servicio | Descripción |
|----------|-------------|
| `googleAnalyticsService` | Conexión con Google Analytics Data API |
| `aiAnalysisService` | Análisis con Google Gemini AI |
| `chutesVideoAnalysisService` | Análisis de video con IA multimodal |
| `minuteByMinuteAnalysisService` | Análisis temporal de spots |
| `pptxExportService` | Generación de reportes PowerPoint |
| `youtubeService` | Integración con YouTube API |

---

## 🌊 Flujo de Datos: Analytics

```mermaid
flowchart LR
    subgraph User["Usuario"]
        Select[Selecciona Propiedad]
        Filters[Aplica Filtros]
    end
    
    subgraph Context["GoogleAnalyticsContext"]
        GetData[getAnalyticsData]
        Transform[Transformar Datos]
    end
    
    subgraph API["Backend"]
        Proxy[analytics-proxy]
    end
    
    subgraph Google["Google"]
        GA4[Analytics Data API]
    end
    
    subgraph Display["Visualización"]
        Charts[Gráficos]
        Table[Tabla de Datos]
        Export[Exportar]
    end
    
    Select --> GetData
    Filters --> GetData
    GetData --> Proxy --> GA4
    GA4 --> Proxy --> Transform
    Transform --> Charts
    Transform --> Table
    Table --> Export
```

---

## ⚙️ Variables de Entorno Requeridas

```bash
# Supabase
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
REACT_APP_GOOGLE_CLIENT_SECRET=xxx

# APIs de IA
REACT_APP_GEMINI_API_KEY=xxx
REACT_APP_CHUTES_API_KEY=xxx

# YouTube
REACT_APP_YOUTUBE_API_KEY=xxx

# Entorno
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
```

---

## 🚀 Comandos

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run serve` | Inicia servidor Express |

---

## 📈 Métricas Disponibles (Google Analytics)

| Categoría | Métricas |
|-----------|----------|
| **Tráfico** | activeUsers, sessions, users, newUsers |
| **Contenido** | pageviews, eventCount |
| **Engagement** | bounceRate, sessionDuration, engagementRate |
| **Conversiones** | conversions |

---

## 🎯 Funcionalidades Clave

1. **Dashboard** - Vista general de cuentas y propiedades GA
2. **Analytics** - Explorador de datos con gráficos personalizables
3. **SpotAnalysis** - Análisis de correlación TV-Web minuto a minuto
4. **FrasesRadio** - Análisis de frases publicitarias con IA
5. **Exportación PPTX** - Reportes profesionales en PowerPoint
