#!/usr/bin/env node

/**
 * Configurador HTTPS Inmediato
 * Convierte HTTP a HTTPS para resolver OAuth
 */

const https = require('https');
const http = require('http');

class HTTPSConfigurator {
    constructor() {
        this.currentUrl = 'http://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io';
        this.expectedHttpsUrl = 'https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io';
    }

    /**
     * Verificar estado actual de la URL
     */
    async checkCurrentUrl() {
        console.log('🔍 Verificando estado actual de la URL...');
        console.log(`URL actual: ${this.currentUrl}`);
        console.log(`URL esperada: ${this.expectedHttpsUrl}`);
        console.log('');

        // Verificar HTTP
        try {
            await this.checkUrl(this.currentUrl);
            console.log('✅ HTTP está funcionando');
        } catch (error) {
            console.log('❌ HTTP no está disponible:', error.message);
        }

        // Verificar HTTPS
        try {
            await this.checkUrl(this.expectedHttpsUrl);
            console.log('✅ HTTPS está funcionando');
        } catch (error) {
            console.log('❌ HTTPS no está disponible:', error.message);
        }
    }

    /**
     * Verificar una URL específica
     */
    checkUrl(url) {
        return new Promise((resolve, reject) => {
            const client = url.startsWith('https') ? https : http;
            
            const req = client.get(url, (res) => {
                if (res.statusCode >= 200 && res.statusCode < 400) {
                    resolve(res.statusCode);
                } else {
                    reject(new Error(`Status ${res.statusCode}`));
                }
            });

            req.on('error', reject);
            req.setTimeout(5000, () => reject(new Error('Timeout')));
        });
    }

    /**
     * Mostrar opciones de configuración HTTPS
     */
    showHTTPSOptions() {
        console.log('🚀 OPCIONES PARA CONFIGURAR HTTPS');
        console.log('='.repeat(60));
        console.log('');
        
        console.log('🔧 OPCIÓN 1: Configurar HTTPS en Coolify (Recomendado)');
        console.log('   1. Ve a tu proyecto en Coolify Dashboard');
        console.log('   2. Settings > Domains');
        console.log('   3. Busca "Force HTTPS" o "SSL/TLS"');
        console.log('   4. Actívalo');
        console.log('   5. Reinicia el proyecto');
        console.log('');
        
        console.log('🌐 OPCIÓN 2: Cloudflare Tunnel (Más Rápido)');
        console.log('   1. Instala cloudflared:');
        console.log('      curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared');
        console.log('      chmod +x cloudflared');
        console.log('');
        console.log('   2. Ejecuta:');
        console.log('      ./cloudflared tunnel --url http://localhost:3000');
        console.log('');
        console.log('   3. Cloudflare te dará una URL HTTPS automáticamente');
        console.log('');
        
        console.log('⚡ OPCIÓN 3: Proxy Reverso Nginx');
        console.log('   Configura nginx para redirigir HTTP a HTTPS:');
        console.log('');
        console.log('   server {');
        console.log('       listen 80;');
        console.log('       server_name v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io;');
        console.log('       return 301 https://$server_name$request_uri;');
        console.log('   }');
        console.log('');
        
        console.log('🎯 URLS PARA GOOGLE CLOUD CONSOLE:');
        console.log('   Authorized redirect URIs:');
        console.log('   https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback');
        console.log('   https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/auth/callback');
        console.log('   https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/oauth/callback');
        console.log('');
        console.log('   Authorized JavaScript origins:');
        console.log('   https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io');
        console.log('');
    }

    /**
     * Ejecutar configuración completa
     */
    async runConfiguration() {
        console.log('🔧 CONFIGURADOR HTTPS AUTOMÁTICO');
        console.log('='.repeat(60));
        console.log('');
        
        // Verificar estado actual
        await this.checkCurrentUrl();
        
        console.log('');
        
        // Mostrar opciones
        this.showHTTPSOptions();
        
        console.log('');
        console.log('📋 PRÓXIMOS PASOS:');
        console.log('   1. Elige una opción de arriba');
        console.log('   2. Configura HTTPS');
        console.log('   3. Autoriza URLs en Google Cloud Console');
        console.log('   4. Prueba OAuth');
        console.log('');
        
        console.log('💡 RECOMENDACIÓN: Usa Opción 1 (Coolify) si está disponible,');
        console.log('   o Opción 2 (Cloudflare) para solución rápida.');
    }
}

// Ejecutar si es script principal
if (require.main === module) {
    const configurator = new HTTPSConfigurator();
    configurator.runConfiguration().catch(console.error);
}

module.exports = HTTPSConfigurator;
