#!/usr/bin/env node

/**
 * Configuración Automática Cloudflare Tunnel
 * Solución inmediata para HTTPS
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class CloudflareTunnelSetup {
    constructor() {
        this.tunnelName = 'tvradio-oauth-fix';
        this.localUrl = 'http://localhost:3000';
    }

    /**
     * Verificar si cloudflared está instalado
     */
    checkCloudflared() {
        return new Promise((resolve) => {
            exec('which cloudflared', (error) => {
                resolve(!error);
            });
        });
    }

    /**
     * Instalar cloudflared
     */
    async installCloudflared() {
        console.log('📦 Instalando cloudflared...');
        
        const installCommands = [
            'curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared',
            'chmod +x cloudflared'
        ];

        for (const command of installCommands) {
            await this.executeCommand(command);
        }
        
        console.log('✅ cloudflared instalado correctamente');
    }

    /**
     * Ejecutar comando
     */
    executeCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    /**
     * Crear túnel
     */
    async createTunnel() {
        console.log('🌐 Creando túnel Cloudflare...');
        console.log('⏳ Esto puede tomar unos segundos...');
        
        try {
            const result = await this.executeCommand('./cloudflared tunnel --url ' + this.localUrl);
            console.log('✅ Túnel creado exitosamente!');
            console.log('');
            console.log('🔗 URL HTTPS disponible:');
            console.log(result);
            console.log('');
            console.log('📋 PRÓXIMOS PASOS:');
            console.log('1. Copia la URL HTTPS que aparece arriba');
            console.log('2. Ve a Google Cloud Console');
            console.log('3. Autoriza esta nueva URL HTTPS');
            console.log('4. Prueba OAuth');
            
            return result;
        } catch (error) {
            console.error('❌ Error creando túnel:', error.message);
            throw error;
        }
    }

    /**
     * Mostrar URLs para Google Cloud Console
     */
    showGoogleCloudInstructions(tunnelUrl) {
        console.log('');
        console.log('🔑 CONFIGURAR GOOGLE CLOUD CONSOLE:');
        console.log('='.repeat(50));
        console.log('');
        console.log('1. Ve a: https://console.cloud.google.com/');
        console.log('2. Selecciona proyecto: tvradio2');
        console.log('3. Ve a: APIs & Services > Credentials');
        console.log('4. Busca: 575745299328-scsmugneks2vg3kkoap6gd2ssashvefs.apps.googleusercontent.com');
        console.log('5. Edita y agrega estas URLs:');
        console.log('');
        console.log('Authorized redirect URIs:');
        console.log(`${tunnelUrl}/callback`);
        console.log(`${tunnelUrl}/auth/callback`);
        console.log(`${tunnelUrl}/oauth/callback`);
        console.log(`${tunnelUrl}/auth/google/callback`);
        console.log('');
        console.log('Authorized JavaScript origins:');
        console.log(tunnelUrl);
        console.log('');
        console.log('6. Haz clic en Save');
    }

    /**
     * Ejecutar configuración completa
     */
    async runSetup() {
        console.log('🚀 CONFIGURACIÓN AUTOMÁTICA CLOUDFLARE TUNNEL');
        console.log('='.repeat(60));
        console.log('');
        
        try {
            // Verificar cloudflared
            const isInstalled = await this.checkCloudflared();
            
            if (!isInstalled) {
                await this.installCloudflared();
            } else {
                console.log('✅ cloudflared ya está instalado');
            }
            
            console.log('');
            
            // Crear túnel
            const tunnelResult = await this.createTunnel();
            
            // Extraer URL del resultado
            const urlMatch = tunnelResult.match(/https:\/\/[^\s]+/);
            if (urlMatch) {
                const httpsUrl = urlMatch[0];
                this.showGoogleCloudInstructions(httpsUrl);
            }
            
        } catch (error) {
            console.error('💥 Error en la configuración:', error.message);
            console.log('');
            console.log('🔧 SOLUCIÓN MANUAL:');
            console.log('1. Descarga cloudflared manualmente:');
            console.log('   https://github.com/cloudflare/cloudflared/releases/latest');
            console.log('2. Ejecuta: ./cloudflared tunnel --url http://localhost:3000');
            console.log('3. Usa la URL HTTPS que te dé');
        }
    }
}

// Ejecutar si es script principal
if (require.main === module) {
    const setup = new CloudflareTunnelSetup();
    setup.runSetup().catch(console.error);
}

module.exports = CloudflareTunnelSetup;
