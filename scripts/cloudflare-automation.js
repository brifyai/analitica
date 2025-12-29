#!/usr/bin/env node

/**
 * Script de Automatización Cloudflare API
 * Automatiza túneles, certificados SSL, DNS y configuraciones de seguridad
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class CloudflareAutomation {
    constructor(config = {}) {
        this.apiToken = config.apiToken || process.env.CLOUDFLARE_API_TOKEN;
        this.apiEmail = config.apiEmail || process.env.CLOUDFLARE_EMAIL;
        this.apiKey = config.apiKey || process.env.CLOUDFLARE_API_KEY;
        this.accountId = config.accountId || process.env.CLOUDFLARE_ACCOUNT_ID;
        this.zoneId = config.zoneId || process.env.CLOUDFLARE_ZONE_ID;
        
        this.baseURL = 'https://api.cloudflare.com/client/v4';
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.apiToken) {
            headers['Authorization'] = `Bearer ${this.apiToken}`;
        } else if (this.apiEmail && this.apiKey) {
            headers['X-Auth-Email'] = this.apiEmail;
            headers['X-Auth-Key'] = this.apiKey;
        }
        
        this.client = axios.create({
            baseURL: this.baseURL,
            headers,
            timeout: 30000
        });
    }

    /**
     * Verificar conexión con Cloudflare
     */
    async checkConnection() {
        try {
            const response = await this.client.get('/user/tokens/verify');
            if (response.data.success) {
                console.log('✅ Conexión con Cloudflare API exitosa');
                return true;
            } else {
                throw new Error('Token inválido');
            }
        } catch (error) {
            console.error('❌ Error conectando con Cloudflare:', error.message);
            return false;
        }
    }

    /**
     * Obtener información de la cuenta
     */
    async getAccountInfo() {
        try {
            const response = await this.client.get('/accounts');
            return response.data.result[0];
        } catch (error) {
            console.error('❌ Error obteniendo información de cuenta:', error.message);
            throw error;
        }
    }

    /**
     * Obtener zonas disponibles
     */
    async getZones() {
        try {
            const response = await this.client.get('/zones');
            return response.data.result;
        } catch (error) {
            console.error('❌ Error obteniendo zonas:', error.message);
            throw error;
        }
    }

    /**
     * Crear túnel de Cloudflare
     */
    async createTunnel(tunnelConfig) {
        try {
            console.log('🌐 Creando túnel de Cloudflare...');
            
            const response = await this.client.post('/accounts/' + this.accountId + '/cfd_tunnel', {
                name: tunnelConfig.name,
                tunnel_secret: tunnelConfig.secret || crypto.randomBytes(32).toString('hex'),
                metadata: tunnelConfig.metadata || {}
            });
            
            if (response.data.success) {
                console.log('✅ Túnel creado exitosamente');
                return response.data.result;
            } else {
                throw new Error(response.data.errors[0]?.message || 'Error desconocido');
            }
        } catch (error) {
            console.error('❌ Error creando túnel:', error.message);
            throw error;
        }
    }

    /**
     * Obtener configuración del túnel
     */
    async getTunnel(tunnelId) {
        try {
            const response = await this.client.get(`/accounts/${this.accountId}/cfd_tunnel/${tunnelId}`);
            return response.data.result;
        } catch (error) {
            console.error('❌ Error obteniendo túnel:', error.message);
            throw error;
        }
    }

    /**
     * Eliminar túnel
     */
    async deleteTunnel(tunnelId) {
        try {
            const response = await this.client.delete(`/accounts/${this.accountId}/cfd_tunnel/${tunnelId}`);
            if (response.data.success) {
                console.log('✅ Túnel eliminado exitosamente');
                return true;
            }
            throw new Error(response.data.errors[0]?.message || 'Error desconocido');
        } catch (error) {
            console.error('❌ Error eliminando túnel:', error.message);
            throw error;
        }
    }

    /**
     * Crear registro DNS
     */
    async createDNSRecord(zoneId, recordConfig) {
        try {
            const response = await this.client.post(`/zones/${zoneId}/dns_records`, {
                type: recordConfig.type,
                name: recordConfig.name,
                content: recordConfig.content,
                ttl: recordConfig.ttl || 1,
                proxied: recordConfig.proxied || false
            });
            
            if (response.data.success) {
                console.log(`✅ Registro DNS ${recordConfig.name} creado exitosamente`);
                return response.data.result;
            } else {
                throw new Error(response.data.errors[0]?.message || 'Error desconocido');
            }
        } catch (error) {
            console.error('❌ Error creando registro DNS:', error.message);
            throw error;
        }
    }

    /**
     * Configurar DNS para túnel
     */
    async setupTunnelDNS(tunnelId, domain, tunnelConfig) {
        try {
            console.log(`🌐 Configurando DNS para túnel ${tunnelId}...`);
            
            // Crear registro CNAME para el túnel
            const cnameRecord = await this.createDNSRecord(this.zoneId, {
                type: 'CNAME',
                name: domain,
                content: `${tunnelId}.cfargotunnel.com`,
                proxied: true
            });
            
            // Crear registro para wildcard si se especifica
            if (tunnelConfig.wildcard) {
                const wildcardRecord = await this.createDNSRecord(this.zoneId, {
                    type: 'CNAME',
                    name: `*.${domain}`,
                    content: `${tunnelId}.cfargotunnel.com`,
                    proxied: true
                });
                return { cnameRecord, wildcardRecord };
            }
            
            return { cnameRecord };
        } catch (error) {
            console.error('❌ Error configurando DNS para túnel:', error.message);
            throw error;
        }
    }

    /**
     * Configurar SSL/TLS settings
     */
    async configureSSL(zoneId, sslConfig = {}) {
        try {
            const settings = {
                ssl: sslConfig.level || 'strict', // off, flexible, full, strict
                always_use_https: sslConfig.alwaysUseHttps || 'on',
                min_tls_version: sslConfig.minTlsVersion || '1.2',
                tls_1_3: sslConfig.tls13 || 'zrt',
                automatic_https_rewrites: sslConfig.autoHttpsRewrites || 'on',
                opportunistic_encryption: sslConfig.opportunisticEncryption || 'on',
                tls_cipher_suite: sslConfig.cipherSuite || 'eecdh'
            };
            
            const response = await this.client.patch(`/zones/${zoneId}/settings/ssl`, {
                value: settings.ssl
            });
            
            if (response.data.success) {
                console.log('✅ Configuración SSL actualizada exitosamente');
                return response.data.result;
            } else {
                throw new Error(response.data.errors[0]?.message || 'Error desconocido');
            }
        } catch (error) {
            console.error('❌ Error configurando SSL:', error.message);
            throw error;
        }
    }

    /**
     * Automatización completa de configuración Cloudflare
     */
    async fullCloudflareSetup(config) {
        try {
            console.log('🎯 Iniciando automatización completa de Cloudflare...');
            
            // 1. Verificar conexión
            const connected = await this.checkConnection();
            if (!connected) throw new Error('No se puede conectar con Cloudflare API');
            
            // 2. Crear túnel
            const tunnel = await this.createTunnel({
                name: config.tunnelName,
                secret: config.tunnelSecret,
                metadata: config.tunnelMetadata || {}
            });
            
            // 3. Configurar DNS
            const dnsConfig = await this.setupTunnelDNS(tunnel.id, config.domain, {
                wildcard: config.wildcard || false
            });
            
            // 4. Configurar SSL
            await this.configureSSL(this.zoneId, config.sslConfig || {});
            
            console.log('🎉 Automatización completa de Cloudflare finalizada exitosamente');
            
            return {
                tunnel,
                dnsConfig,
                success: true
            };
            
        } catch (error) {
            console.error('❌ Error en automatización completa de Cloudflare:', error.message);
            throw error;
        }
    }

    /**
     * Obtener métricas del túnel
     */
    async getTunnelMetrics(tunnelId, options = {}) {
        try {
            const params = new URLSearchParams({
                since: options.since || Math.floor(Date.now() / 1000) - 86400, // 24 horas atrás
                until: options.until || Math.floor(Date.now() / 1000)
            });
            
            const response = await this.client.get(`/accounts/${this.accountId}/cfd_tunnel/${tunnelId}/metrics?${params}`);
            return response.data.result;
        } catch (error) {
            console.error('❌ Error obteniendo métricas del túnel:', error.message);
            throw error;
        }
    }

    /**
     * Generar configuración de túnel para cliente
     */
    async generateTunnelConfig(tunnelId, config = {}) {
        try {
            const tunnel = await this.getTunnel(tunnelId);
            
            const tunnelConfig = {
                tunnel: tunnel.id,
                credentials_file: './cloudflared-credentials.json',
                logfile: config.logFile || '/var/log/cloudflared.log',
                loglevel: config.logLevel || 'info',
                metrics: config.metrics || 'localhost:8787',
                no_autoupgrade: config.noAutoupgrade || false,
                edge_ip_version: config.edgeIpVersion || 'auto'
            };
            
            // Agregar ingress rules si se especifican
            if (config.ingressRules) {
                tunnelConfig.ingress = config.ingressRules;
            }
            
            return tunnelConfig;
        } catch (error) {
            console.error('❌ Error generando configuración de túnel:', error.message);
            throw error;
        }
    }
}

// Configuración por defecto desde variables de entorno
const defaultConfig = {
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    apiEmail: process.env.CLOUDFLARE_EMAIL,
    apiKey: process.env.CLOUDFLARE_API_KEY,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    zoneId: process.env.CLOUDFLARE_ZONE_ID
};

// Exportar para uso como módulo
module.exports = CloudflareAutomation;

// Ejecutar como script independiente
if (require.main === module) {
    const automation = new CloudflareAutomation(defaultConfig);
    
    // Ejemplo de uso
    async function main() {
        try {
            // Verificar conexión
            await automation.checkConnection();
            
            // Obtener información de la cuenta
            const account = await automation.getAccountInfo();
            console.log('📋 Cuenta:', account.name);
            
            // Obtener zonas
            const zones = await automation.getZones();
            console.log('🌐 Zonas disponibles:', zones.length);
            
            // Ejemplo de configuración completa
            if (automation.zoneId && process.env.DOMAIN) {
                await automation.fullCloudflareSetup({
                    tunnelName: 'imetrics-tv-radio-tunnel',
                    domain: process.env.DOMAIN,
                    wildcard: true,
                    sslConfig: {
                        level: 'strict',
                        alwaysUseHttps: 'on',
                        minTlsVersion: '1.2'
                    }
                });
            }
            
        } catch (error) {
            console.error('❌ Error en ejecución principal:', error.message);
            process.exit(1);
        }
    }
    
    main();
}