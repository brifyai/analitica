#!/usr/bin/env node

/**
 * Solución Específica para Problema OAuth HTTP/HTTPS
 * Configura HTTPS y autoriza URLs en Google Cloud Console
 */

const OAuthFixer = {
    projectId: 'tvradio2',
    clientId: '575745299328-scsmugneks2vg3kkoap6gd2ssashvefs.apps.googleusercontent.com',
    currentUrl: 'http://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io',
    expectedHttpsUrl: 'https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io',

    /**
     * Crear URLs de redirect autorizadas para Google Cloud Console
     */
    generateAuthorizedUrls() {
        const baseUrl = this.expectedHttpsUrl;
        
        return {
            // URLs principales de redirect
            redirectUris: [
                `${baseUrl}/callback`,
                `${baseUrl}/auth/callback`,
                `${baseUrl}/oauth/callback`,
                `${baseUrl}/auth/google/callback`,
                // URLs adicionales para diferentes patrones
                `${baseUrl}/`,
                `${baseUrl}/login`,
                `${baseUrl}/auth/login`
            ],
            
            // URLs de origen JavaScript
            javascriptOrigins: [
                baseUrl,
                `${baseUrl}:3000`,
                `${baseUrl}:8080`,
                `${baseUrl}:4173`
            ]
        };
    },

    /**
     * Mostrar instrucciones para Google Cloud Console
     */
    showGoogleCloudInstructions() {
        console.log('🔧 INSTRUCCIONES PARA GOOGLE CLOUD CONSOLE');
        console.log('='.repeat(60));
        console.log('');
        console.log('1. Ve a Google Cloud Console: https://console.cloud.google.com/');
        console.log(`2. Selecciona el proyecto: ${this.projectId}`);
        console.log('3. Ve a "APIs & Services" > "Credentials"');
        console.log(`4. Busca el Client ID: ${this.clientId}`);
        console.log('5. Haz clic en él para editarlo');
        console.log('');
        console.log('6. En "Authorized redirect URIs", agrega estas URLs:');
        console.log('');
        
        const urls = this.generateAuthorizedUrls();
        urls.redirectUris.forEach((url, index) => {
            console.log(`   ${index + 1}. ${url}`);
        });
        
        console.log('');
        console.log('7. En "Authorized JavaScript origins", agrega:');
        urls.javascriptOrigins.forEach((origin, index) => {
            console.log(`   ${index + 1}. ${origin}`);
        });
        
        console.log('');
        console.log('8. Haz clic en "Save"');
        console.log('');
        console.log('⚠️  IMPORTANTE: Estas URLs deben usar HTTPS, no HTTP');
        console.log('');
    },

    /**
     * Ejecutar diagnóstico completo
     */
    runDiagnosis() {
        console.log('🔍 DIAGNÓSTICO COMPLETO DEL PROBLEMA OAUTH');
        console.log('='.repeat(60));
        console.log('');
        
        console.log('📋 INFORMACIÓN ACTUAL:');
        console.log(`   • Proyecto ID: ${this.projectId}`);
        console.log(`   • Client ID: ${this.clientId}`);
        console.log(`   • URL Actual: ${this.currentUrl}`);
        console.log(`   • URL Esperada HTTPS: ${this.expectedHttpsUrl}`);
        console.log('');
        
        console.log('🚨 PROBLEMAS IDENTIFICADOS:');
        console.log('   1. ❌ Aplicación corriendo en HTTP (no HTTPS)');
        console.log('   2. ❌ URLs no autorizadas en Google Cloud Console');
        console.log('   3. ❌ Google OAuth requiere HTTPS para funcionar');
        console.log('');
        
        console.log('💡 SOLUCIONES DISPONIBLES:');
        console.log('   A) Configurar HTTPS en Coolify directamente');
        console.log('   B) Usar Cloudflare Tunnel para HTTPS');
        console.log('   C) Configurar proxy reverso con SSL');
        console.log('');
        
        return this.generateAuthorizedUrls();
    },

    /**
     * Crear guía paso a paso
     */
    createStepByStepGuide() {
        console.log('📚 GUÍA PASO A PASO PARA SOLUCIONAR OAUTH');
        console.log('='.repeat(60));
        console.log('');
        
        console.log('🔧 PASO 1: Configurar HTTPS en Coolify');
        console.log('   1.1. Ve a tu proyecto en Coolify Dashboard');
        console.log('   1.2. Ve a "Settings" > "Domains"');
        console.log('   1.3. Activa "Force HTTPS" o configura SSL');
        console.log('   1.4. Si no está disponible, configura un proxy reverso');
        console.log('   1.5. Reinicia el proyecto');
        console.log('');
        
        console.log('🌐 PASO 2: Configurar Cloudflare (Alternativo)');
        console.log('   2.1. Crea una cuenta en Cloudflare (si no tienes)');
        console.log('   2.2. Configura un Cloudflare Tunnel');
        console.log('   2.3. Apunta el túnel a tu aplicación Coolify');
        console.log('   2.4. Cloudflare proporcionará HTTPS automático');
        console.log('');
        
        console.log('🔑 PASO 3: Autorizar URLs en Google Cloud Console');
        this.showGoogleCloudInstructions();
        
        console.log('✅ PASO 4: Verificar Funcionamiento');
        console.log('   4.1. Accede a tu aplicación usando HTTPS');
        console.log('   4.2. Prueba el login con Google OAuth');
        console.log('   4.3. Verifica que no aparezcan errores de redirect_uri');
        console.log('');
    }
};

// Ejecutar si es script principal
if (require.main === module) {
    async function main() {
        console.log('🚀 SOLUCIONADOR DE PROBLEMAS OAUTH HTTP/HTTPS');
        console.log('='.repeat(60));
        console.log('');
        
        // Ejecutar diagnóstico
        OAuthFixer.runDiagnosis();
        
        // Mostrar guía
        OAuthFixer.createStepByStepGuide();
        
        console.log('🎯 RESUMEN DE ACCIONES REQUERIDAS:');
        console.log('   1. Configurar HTTPS en tu aplicación');
        console.log('   2. Autorizar URLs en Google Cloud Console');
        console.log('   3. Probar OAuth con la nueva configuración');
        console.log('');
        console.log('💬 ¿Necesitas ayuda con algún paso específico?');
    }
    
    main().catch(console.error);
}

module.exports = OAuthFixer;
