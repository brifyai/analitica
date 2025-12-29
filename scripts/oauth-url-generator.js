#!/usr/bin/env node

/**
 * Generador de URLs OAuth y Guía de Configuración
 * Solución directa para el problema redirect_uri_mismatch
 */

class OAuthURLGenerator {
    constructor() {
        this.projectId = 'tvradio2';
        this.clientId = '575745299328-scsmugneks2vg3kkoap6gd2ssashvefs.apps.googleusercontent.com';
        this.currentHttpUrl = 'http://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io';
        this.expectedHttpsUrl = 'https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io';
    }

    /**
     * Generar URLs autorizadas para Google Cloud Console
     */
    generateAuthorizedURLs() {
        const baseUrl = this.expectedHttpsUrl;
        
        return {
            redirectURIs: [
                `${baseUrl}/callback`,
                `${baseUrl}/auth/callback`,
                `${baseUrl}/oauth/callback`,
                `${baseUrl}/auth/google/callback`,
                `${baseUrl}/`,
                `${baseUrl}/login`,
                `${baseUrl}/auth/login`
            ],
            javascriptOrigins: [
                baseUrl,
                `${baseUrl}:3000`,
                `${baseUrl}:8080`,
                `${baseUrl}:4173`
            ]
        };
    }

    /**
     * Mostrar instrucciones paso a paso
     */
    showStepByStepInstructions() {
        console.log('🎯 SOLUCIÓN DIRECTA PARA OAUTH REDIRECT_URI_MISMATCH');
        console.log('=' .repeat(70));
        console.log('');
        
        console.log('📋 PROBLEMA IDENTIFICADO:');
        console.log(`   ❌ URL actual: ${this.currentHttpUrl}`);
        console.log(`   ✅ URL requerida: ${this.expectedHttpsUrl}`);
        console.log('   ❌ Google OAuth solo acepta HTTPS');
        console.log('');
        
        console.log('🔧 SOLUCIÓN INMEDIATA:');
        console.log('');
        
        console.log('PASO 1: Configurar HTTPS en Coolify');
        console.log('   1. Ve a tu proyecto en Coolify Dashboard');
        console.log('   2. Busca "Settings" o "Advanced"');
        console.log('   3. Activa "Force HTTPS"');
        console.log('   4. Guarda y reinicia el proyecto');
        console.log('');
        
        console.log('PASO 2: Autorizar URLs en Google Cloud Console');
        console.log('   1. Ve a: https://console.cloud.google.com/');
        console.log(`   2. Selecciona proyecto: ${this.projectId}`);
        console.log('   3. Ve a: APIs & Services > Credentials');
        console.log(`   4. Busca Client ID: ${this.clientId}`);
        console.log('   5. Haz clic para editar');
        console.log('');
        
        const urls = this.generateAuthorizedURLs();
        
        console.log('   6. En "Authorized redirect URIs", agrega:');
        urls.redirectURIs.forEach((url, index) => {
            console.log(`      ${index + 1}. ${url}`);
        });
        console.log('');
        
        console.log('   7. En "Authorized JavaScript origins", agrega:');
        urls.javascriptOrigins.forEach((origin, index) => {
            console.log(`      ${index + 1}. ${origin}`);
        });
        console.log('');
        
        console.log('   8. Haz clic en "Save"');
        console.log('');
        
        console.log('PASO 3: Verificar Funcionamiento');
        console.log('   1. Espera 5-10 minutos para propagación');
        console.log('   2. Accede a tu aplicación con HTTPS');
        console.log('   3. Prueba el login con Google OAuth');
        console.log('   4. Verifica que no aparezcan errores');
        console.log('');
    }

    /**
     * Mostrar URLs para copiar y pegar
     */
    showCopyPasteURLs() {
        console.log('📋 URLs PARA COPIAR Y PEGAR EN GOOGLE CLOUD CONSOLE:');
        console.log('=' .repeat(60));
        console.log('');
        
        const urls = this.generateAuthorizedURLs();
        
        console.log('🔗 AUTHORIZED REDIRECT URIs:');
        urls.redirectURIs.forEach((url, index) => {
            console.log(`${index + 1}. ${url}`);
        });
        console.log('');
        
        console.log('🌐 AUTHORIZED JAVASCRIPT ORIGINS:');
        urls.javascriptOrigins.forEach((origin, index) => {
            console.log(`${index + 1}. ${origin}`);
        });
        console.log('');
        
        console.log('💡 INSTRUCCIONES:');
        console.log('   1. Copia cada URL de arriba');
        console.log('   2. Pégalas en Google Cloud Console');
        console.log('   3. Guarda los cambios');
        console.log('');
    }

    /**
     * Verificar estado actual
     */
    checkCurrentStatus() {
        console.log('🔍 VERIFICACIÓN DE ESTADO ACTUAL:');
        console.log('=' .repeat(40));
        console.log('');
        
        console.log('✅ Tu aplicación está corriendo en:');
        console.log(`   ${this.currentHttpUrl}`);
        console.log('');
        
        console.log('🎯 Google OAuth requiere:');
        console.log(`   ${this.expectedHttpsUrl}`);
        console.log('');
        
        console.log('📝 Próximos pasos:');
        console.log('   1. Configurar HTTPS en Coolify');
        console.log('   2. Autorizar URLs en Google Cloud');
        console.log('   3. Probar OAuth');
        console.log('');
    }

    /**
     * Ejecutar diagnóstico completo
     */
    runCompleteDiagnosis() {
        this.checkCurrentStatus();
        this.showStepByStepInstructions();
        this.showCopyPasteURLs();
        
        console.log('🎉 RESUMEN FINAL:');
        console.log('   ✅ URLs generadas para Google Cloud Console');
        console.log('   ✅ Instrucciones paso a paso proporcionadas');
        console.log('   ✅ Solución directa para redirect_uri_mismatch');
        console.log('');
        console.log('💬 ¿Necesitas ayuda con algún paso específico?');
    }
}

// Ejecutar si es script principal
if (require.main === module) {
    const generator = new OAuthURLGenerator();
    generator.runCompleteDiagnosis();
}

module.exports = OAuthURLGenerator;
