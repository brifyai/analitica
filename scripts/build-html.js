// Script para generar archivos HTML adicionales después del build de React
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');

// Verificar que el directorio build existe
if (!fs.existsSync(buildDir)) {
  console.log('Build directory not found, skipping HTML generation');
  process.exit(0);
}

// Leer el index.html generado por React
const indexPath = path.join(buildDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.log('index.html not found, skipping HTML generation');
  process.exit(0);
}

const indexContent = fs.readFileSync(indexPath, 'utf8');

// Crear versiones SEO optimizadas
const seoVersions = [
  {
    filename: 'index-seo-complete.html',
    title: 'BrifyAI - Análisis de Impacto de Spots TV vs Tráfico Web',
    description: 'Plataforma inteligente de análisis con IA para medir el impacto de spots de TV en el tráfico web. Análisis temporal, predictivo y de conversión.'
  },
  {
    filename: 'index-seo-final.html',
    title: 'Análisis TV-Web con IA - BrifyAI',
    description: 'Análisis avanzado de correlación entre transmisión de spots TV y métricas de tráfico web usando inteligencia artificial.'
  },
  {
    filename: 'index-optimized.html',
    title: 'Dashboard Analytics TV - BrifyAI',
    description: 'Dashboard completo de analytics para análisis de spots de TV con métricas de impacto en tiempo real.'
  }
];

// Generar cada versión SEO
seoVersions.forEach(version => {
  const seoContent = indexContent
    .replace(/<title>.*?<\/title>/, `<title>${version.title}</title>`)
    .replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${version.description}" />`
    )
    .replace(
      /<meta property="og:title" content=".*?" \/>/,
      `<meta property="og:title" content="${version.title}" />`
    )
    .replace(
      /<meta property="og:description" content=".*?" \/>/,
      `<meta property="og:description" content="${version.description}" />`
    );

  const outputPath = path.join(buildDir, version.filename);
  fs.writeFileSync(outputPath, seoContent);
  console.log(`Generated: ${version.filename}`);
});

console.log('HTML generation completed successfully');