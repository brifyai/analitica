#!/usr/bin/env node

/**
 * Sistema de Automatización Completo Coolify + Cloudflare
 * Integra ambas APIs para automatización end-to-end
 */

const CoolifyAutomation = require('./coolify-automation');
const CloudflareAutomation = require('./cloudflare-automation');
const fs = require('fs');

class IntegratedAutomation {
    constructor(config = {}) {
        this.coolifyConfig = {
            baseURL: config.coolifyURL || process.env.COOLIFY_URL,
            apiKey: config.coolifyAPIKey || process.env.COOLIFY_API_KEY,
            projectId: config.coolifyProjectId || process.env.COOLIFY_PROJECT_ID
        };

        this.cloudflareConfig = {
            apiToken: config.cloudflareToken || process.env.CLOUDFLARE_API_TOKEN,
            apiEmail: config.cloudflareEmail || process.env.CLOUDFLARE_EMAIL,
            apiKey: config.cloudflareKey || process.env.CLOUDFLARE_API_KEY,
            accountId: config.cloudflareAccountId || process.env.CLOUDFLARE_ACCOUNT_ID,
            zoneId: config.cloudflareZoneId || process.env.CLOUDFLARE_ZONE_ID
        };

        this.coolify = new CoolifyAutomation(this.coolifyConfig);
        this.cloudflare = new CloudflareAutomation(this.cloudflareConfig);
        
        this.deploymentHistory = [];
    }

    /**
     * Verificar conexiones con ambos servicios
     */
    async checkConnections() {
        console.log('🔍 Verificando conexiones...');
        
        const results = {
            coolify: false,
            cloudflare: false
        };

        try {
            results.coolify = await this.coolify.checkConnection();
        } catch (error) {
            console.error('❌ Error conectando con Coolify:', error.message);
        }

        try {
            results.cloudflare = await this.cloudflare.checkConnection();
        } catch (error) {
            console.error('❌ Error conectando con Cloudflare:', error.message);
        }

        const allConnected = results.coolify && results.cloudflare;
        
        if (allConnected) {
            console.log('✅ Ambas conexiones establecidas exitosamente');
        } else {
            console.warn('⚠️ Algunas conexiones fallaron:', results);
        }

        return results;
    }

    /**
     * Automatización completa de despliegue
     */
    async fullDeployment(config = {}) {
        const deploymentId = `deploy_${Date.now()}`;
        const deploymentLog = {
            id: deploymentId,
            timestamp: new Date().toISOString(),
            status: 'started',
            steps: []
        };

        try {
            console.log(`🚀 Iniciando despliegue completo: ${deploymentId}`);
            console.log('='.repeat(60));

            // 1. Verificar conexiones
            console.log('\n📡 PASO 1: Verificando conexiones...');
            const connections = await this.checkConnections();
            deploymentLog.steps.push({
                step: 'connection_check',
                status: connections.coolify && connections.cloudflare ? 'success' : 'warning',
                details: connections
            });

            if (!connections.coolify && !connections.cloudflare) {
                throw new Error('No se pudo establecer conexión con ningún servicio');
            }

            // 2. Configurar variables de entorno en Coolify
            if (connections.coolify && config.environmentVariables) {
                console.log('\n🔧 PASO 2: Configurando variables de entorno en Coolify...');
                const envResults = await this.coolify.setEnvironmentVariables(
                    this.coolifyConfig.projectId,
                    config.environmentVariables
                );
                deploymentLog.steps.push({
                    step: 'environment_setup',
                    status: 'success',
                    details: envResults
                });
            }

            // 3. Desplegar en Coolify
            if (connections.coolify) {
                console.log('\n🚀 PASO 3: Desplegando en Coolify...');
                const deployment = await this.coolify.deployProject(
                    this.coolifyConfig.projectId,
                    config.coolifyDeploymentOptions || {}
                );
                deploymentLog.coolifyDeployment = deployment;
                
                // Monitorear despliegue si está habilitado
                if (config.monitorCoolifyDeployment !== false) {
                    console.log('👀 Monitoreando despliegue en Coolify...');
                    const finalStatus = await this.coolify.monitorDeployment(deployment.id);
                    deploymentLog.steps.push({
                        step: 'coolify_deployment',
                        status: finalStatus.status === 'success' ? 'success' : 'failed',
                        details: finalStatus
                    });
                }
            }

            // 4. Configurar Cloudflare (túneles, DNS, SSL)
            if (connections.cloudflare && config.cloudflareSetup) {
                console.log('\n🌐 PASO 4: Configurando Cloudflare...');
                const cloudflareResult = await this.cloudflare.fullCloudflareSetup(config.cloudflareSetup);
                deploymentLog.cloudflare = cloudflareResult;
                deploymentLog.steps.push({
                    step: 'cloudflare_setup',
                    status: 'success',
                    details: cloudflareResult
                });
            }

            // Marcar como completado
            deploymentLog.status = 'completed';
            deploymentLog.endTime = new Date().toISOString();
            
            // Guardar historial
            this.deploymentHistory.push(deploymentLog);
            
            console.log('\n🎉 DESPLIEGUE COMPLETADO EXITOSAMENTE');
            console.log('='.repeat(60));
            console.log(`📋 ID del despliegue: ${deploymentId}`);
            console.log(`⏱️ Duración: ${this.calculateDuration(deploymentLog.timestamp, deploymentLog.endTime)}`);
            
            return {
                deploymentId,
                success: true,
                details: deploymentLog
            };

        } catch (error) {
            deploymentLog.status = 'failed';
            deploymentLog.error = error.message;
            deploymentLog.endTime = new Date().toISOString();
            this.deploymentHistory.push(deploymentLog);
            
            console.error('\n❌ DESPLIEGUE FALLÓ');
            console.error('='.repeat(60));
            console.error(`🚨 Error: ${error.message}`);
            
            return {
                deploymentId,
                success: false,
                error: error.message,
                details: deploymentLog
            };
        }
    }

    /**
     * Calcular duración entre dos timestamps
     */
    calculateDuration(startTime, endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const duration = Math.floor((end - start) / 1000);
        
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;
        
        let result = '';
        if (hours > 0) result += `${hours}h `;
        if (minutes > 0) result += `${minutes}m `;
        result += `${seconds}s`;
        
        return result.trim();
    }

    /**
     * Obtener historial de despliegues
     */
    getDeploymentHistory() {
        return this.deploymentHistory;
    }
}

// Configuración por defecto
const defaultConfig = {
    coolifyURL: process.env.COOLIFY_URL,
    coolifyAPIKey: process.env.COOLIFY_API_KEY,
    coolifyProjectId: process.env.COOLIFY_PROJECT_ID,
    cloudflareToken: process.env.CLOUDFLARE_API_TOKEN,
    cloudflareEmail: process.env.CLOUDFLARE_EMAIL,
    cloudflareKey: process.env.CLOUDFLARE_API_KEY,
    cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    cloudflareZoneId: process.env.CLOUDFLARE_ZONE_ID
};

// Exportar para uso como módulo
module.exports = IntegratedAutomation;

// Ejecutar como script independiente
if (require.main === module) {
    const automation = new IntegratedAutomation(defaultConfig);
    
    // Ejemplo de uso completo
    async function main() {
        try {
            console.log('🎯 Sistema de Automatización Coolify + Cloudflare');
            console.log('='.repeat(60));
            
            // Configuración de ejemplo
            const deploymentConfig = {
                environmentVariables: {
                    NODE_ENV: 'production',
                    REACT_APP_VERSION: process.env.npm_package_version || '1.0.0',
                    API_BASE_URL: process.env.API_BASE_URL || 'https://api.example.com'
                },
                coolifyDeploymentOptions: {
                    branch: 'main',
                    forceRebuild: false
                },
                cloudflareSetup: {
                    tunnelName: 'imetrics-tv-radio-production',
                    domain: process.env.DOMAIN || 'imetrics.tv',
                    wildcard: true,
                    sslConfig: {
                        level: 'strict',
                        alwaysUseHttps: 'on',
                        minTlsVersion: '1.2'
                    }
                },
                monitorCoolifyDeployment: true
            };
            
            // Realizar despliegue completo
            const result = await automation.fullDeployment(deploymentConfig);
            
            if (result.success) {
                console.log('\n📊 DESPLIEGUE EXITOSO');
            } else {
                console.error('\n💥 El despliegue falló:', result.error);
                process.exit(1);
            }
            
        } catch (error) {
            console.error('❌ Error en ejecución principal:', error.message);
            process.exit(1);
        }
    }
    
    main();
}
