#!/usr/bin/env node

/**
 * Script de Automatización Coolify API
 * Automatiza despliegues, configuraciones y gestión de proyectos
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class CoolifyAutomation {
    constructor(config = {}) {
        this.baseURL = config.baseURL || process.env.COOLIFY_URL || 'http://localhost:3000';
        this.apiKey = config.apiKey || process.env.COOLIFY_API_KEY;
        this.projectId = config.projectId || process.env.COOLIFY_PROJECT_ID;
        
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
    }

    /**
     * Verificar conexión con Coolify
     */
    async checkConnection() {
        try {
            const response = await this.client.get('/api/v1/health');
            console.log('✅ Conexión con Coolify exitosa');
            return true;
        } catch (error) {
            console.error('❌ Error conectando con Coolify:', error.message);
            return false;
        }
    }

    /**
     * Obtener lista de proyectos
     */
    async getProjects() {
        try {
            const response = await this.client.get('/api/v1/projects');
            return response.data;
        } catch (error) {
            console.error('❌ Error obteniendo proyectos:', error.message);
            throw error;
        }
    }

    /**
     * Obtener detalles de un proyecto específico
     */
    async getProject(projectId = this.projectId) {
        try {
            const response = await this.client.get(`/api/v1/projects/${projectId}`);
            return response.data;
        } catch (error) {
            console.error('❌ Error obteniendo proyecto:', error.message);
            throw error;
        }
    }

    /**
     * Desplegar proyecto automáticamente
     */
    async deployProject(projectId = this.projectId, options = {}) {
        try {
            console.log(`🚀 Iniciando despliegue del proyecto ${projectId}...`);
            
            const deploymentData = {
                projectId,
                environment: options.environment || 'production',
                branch: options.branch || 'main',
                forceRebuild: options.forceRebuild || false,
                ...options
            };

            const response = await this.client.post(`/api/v1/projects/${projectId}/deploy`, deploymentData);
            
            console.log('✅ Despliegue iniciado exitosamente');
            return response.data;
        } catch (error) {
            console.error('❌ Error en despliegue:', error.message);
            throw error;
        }
    }

    /**
     * Obtener estado del despliegue
     */
    async getDeploymentStatus(deploymentId) {
        try {
            const response = await this.client.get(`/api/v1/deployments/${deploymentId}`);
            return response.data;
        } catch (error) {
            console.error('❌ Error obteniendo estado del despliegue:', error.message);
            throw error;
        }
    }

    /**
     * Configurar variables de entorno
     */
    async setEnvironmentVariable(projectId, key, value, environment = 'production') {
        try {
            const response = await this.client.post(`/api/v1/projects/${projectId}/env`, {
                key,
                value,
                environment
            });
            
            console.log(`✅ Variable ${key} configurada en ${environment}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Error configurando variable ${key}:`, error.message);
            throw error;
        }
    }

    /**
     * Configurar múltiples variables de entorno
     */
    async setEnvironmentVariables(projectId, variables, environment = 'production') {
        const results = [];
        
        for (const [key, value] of Object.entries(variables)) {
            try {
                const result = await this.setEnvironmentVariable(projectId, key, value, environment);
                results.push({ key, success: true, data: result });
            } catch (error) {
                results.push({ key, success: false, error: error.message });
            }
        }
        
        return results;
    }

    /**
     * Crear nuevo proyecto desde template
     */
    async createProjectFromTemplate(templateData) {
        try {
            const response = await this.client.post('/api/v1/projects', templateData);
            console.log('✅ Proyecto creado exitosamente');
            return response.data;
        } catch (error) {
            console.error('❌ Error creando proyecto:', error.message);
            throw error;
        }
    }

    /**
     * Actualizar configuración del proyecto
     */
    async updateProject(projectId, config) {
        try {
            const response = await this.client.put(`/api/v1/projects/${projectId}`, config);
            console.log('✅ Proyecto actualizado exitosamente');
            return response.data;
        } catch (error) {
            console.error('❌ Error actualizando proyecto:', error.message);
            throw error;
        }
    }

    /**
     * Obtener logs del proyecto
     */
    async getProjectLogs(projectId = this.projectId, options = {}) {
        try {
            const params = new URLSearchParams({
                lines: options.lines || 100,
                follow: options.follow || false
            });
            
            const response = await this.client.get(`/api/v1/projects/${projectId}/logs?${params}`);
            return response.data;
        } catch (error) {
            console.error('❌ Error obteniendo logs:', error.message);
            throw error;
        }
    }

    /**
     * Reiniciar proyecto
     */
    async restartProject(projectId = this.projectId) {
        try {
            const response = await this.client.post(`/api/v1/projects/${projectId}/restart`);
            console.log('✅ Proyecto reiniciado exitosamente');
            return response.data;
        } catch (error) {
            console.error('❌ Error reiniciando proyecto:', error.message);
            throw error;
        }
    }

    /**
     * Detener proyecto
     */
    async stopProject(projectId = this.projectId) {
        try {
            const response = await this.client.post(`/api/v1/projects/${projectId}/stop`);
            console.log('✅ Proyecto detenido exitosamente');
            return response.data;
        } catch (error) {
            console.error('❌ Error deteniendo proyecto:', error.message);
            throw error;
        }
    }

    /**
     * Automatización completa de despliegue
     */
    async fullDeployment(projectId, config = {}) {
        try {
            console.log('🎯 Iniciando automatización completa de despliegue...');
            
            // 1. Verificar conexión
            const connected = await this.checkConnection();
            if (!connected) throw new Error('No se puede conectar con Coolify');
            
            // 2. Obtener proyecto actual
            const project = await this.getProject(projectId);
            console.log(`📋 Proyecto: ${project.name}`);
            
            // 3. Configurar variables de entorno si se proporcionan
            if (config.environmentVariables) {
                console.log('🔧 Configurando variables de entorno...');
                await this.setEnvironmentVariables(projectId, config.environmentVariables);
            }
            
            // 4. Realizar despliegue
            console.log('🚀 Iniciando despliegue...');
            const deployment = await this.deployProject(projectId, config.deploymentOptions);
            
            // 5. Monitorear despliegue
            if (config.monitorDeployment !== false) {
                console.log('👀 Monitoreando despliegue...');
                await this.monitorDeployment(deployment.id);
            }
            
            console.log('🎉 Automatización completa finalizada exitosamente');
            return {
                project,
                deployment,
                success: true
            };
            
        } catch (error) {
            console.error('❌ Error en automatización completa:', error.message);
            throw error;
        }
    }

    /**
     * Monitorear progreso del despliegue
     */
    async monitorDeployment(deploymentId, maxWaitTime = 600000) { // 10 minutos
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWaitTime) {
            try {
                const status = await this.getDeploymentStatus(deploymentId);
                
                console.log(`📊 Estado del despliegue: ${status.status}`);
                
                if (status.status === 'success') {
                    console.log('✅ Despliegue completado exitosamente');
                    return status;
                } else if (status.status === 'failed') {
                    throw new Error(`Despliegue falló: ${status.error || 'Error desconocido'}`);
                }
                
                // Esperar antes del siguiente chequeo
                await new Promise(resolve => setTimeout(resolve, 5000));
                
            } catch (error) {
                console.error('❌ Error monitoreando despliegue:', error.message);
                throw error;
            }
        }
        
        throw new Error('Timeout esperando que el despliegue se complete');
    }
}

// Configuración por defecto desde variables de entorno
const defaultConfig = {
    baseURL: process.env.COOLIFY_URL,
    apiKey: process.env.COOLIFY_API_KEY,
    projectId: process.env.COOLIFY_PROJECT_ID
};

// Exportar para uso como módulo
module.exports = CoolifyAutomation;

// Ejecutar como script independiente
if (require.main === module) {
    const automation = new CoolifyAutomation(defaultConfig);
    
    // Ejemplo de uso
    async function main() {
        try {
            // Verificar conexión
            await automation.checkConnection();
            
            // Obtener proyectos
            const projects = await automation.getProjects();
            console.log('📋 Proyectos disponibles:', projects.length);
            
            // Si se especifica un proyecto, realizar despliegue completo
            if (automation.projectId) {
                await automation.fullDeployment(automation.projectId, {
                    environmentVariables: {
                        NODE_ENV: 'production',
                        REACT_APP_VERSION: process.env.npm_package_version || '1.0.0'
                    },
                    deploymentOptions: {
                        branch: 'main',
                        forceRebuild: false
                    },
                    monitorDeployment: true
                });
            }
            
        } catch (error) {
            console.error('❌ Error en ejecución principal:', error.message);
            process.exit(1);
        }
    }
    
    main();
}