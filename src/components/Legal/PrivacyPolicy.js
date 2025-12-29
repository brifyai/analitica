import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, UserCheck, Download, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  // Reset scroll position when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">iMetrics</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 backdrop-blur-sm flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </motion.button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                <Lock className="h-4 w-4 text-yellow-400 mr-2" />
                <span className="text-sm text-slate-200">Protección de Datos GDPR</span>
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-4">
                Política de Privacidad
              </h1>
              <p className="text-xl text-slate-300 mb-4">
                Protección de sus datos con cumplimiento GDPR para análisis de medios
              </p>
              <p className="text-sm text-slate-400">
                Última actualización: 18 de diciembre de 2025
              </p>
            </div>

            {/* Content */}
            <div className="space-y-8 text-slate-300">
              
              {/* Section 1 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="border-l-4 border-purple-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <UserCheck className="h-6 w-6 mr-3 text-purple-400" />
                  1. Responsable del Tratamiento
                </h2>
                <p className="mb-4"><strong className="text-white">iMetrics</strong> ("nosotros", "nuestro", "la aplicación")</p>
                <p className="mb-4"><strong>Email:</strong> contacto@imetrics.cl</p>
                <p className="mb-4"><strong>Sitio web:</strong> imetrics.cl</p>
                
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-green-400" />
                    Cumplimiento Normativo
                  </h4>
                  <p>Esta política cumple con los requisitos del <span className="text-purple-400 font-semibold">GDPR</span> (Reglamento General de Protección de Datos de la UE), <span className="text-purple-400 font-semibold">LGPD</span> (Brasil), y <span className="text-purple-400 font-semibold">CCPA</span> (California).</p>
                </div>
              </motion.section>

              {/* Section 2 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="border-l-4 border-blue-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Eye className="h-6 w-6 mr-3 text-blue-400" />
                  2. Información que Recopilamos
                </h2>
                
                <h3 className="text-lg font-semibold text-white mb-3">2.1 Datos proporcionados por el usuario:</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span><strong>Información de cuenta:</strong> Nombre, dirección de email (si se registra a través de nuestro portal web)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span><strong>Contenido de análisis:</strong> Datos de transmisiones de TV/Radio y métricas web proporcionadas para análisis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span><strong>Configuraciones:</strong> Preferencias de análisis y configuración de dashboards</span>
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-white mb-3">2.2 Datos recopilados automáticamente:</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span><strong>Datos de uso:</strong> Patrones de interacción, funciones utilizadas, tiempo de sesión</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span><strong>Datos técnicos:</strong> Dirección IP, tipo de navegador, sistema operativo</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span><strong>Métricas de rendimiento:</strong> Datos de análisis de correlación TV/Radio-Web</span>
                  </li>
                </ul>
              </motion.section>

              {/* Section 3 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="border-l-4 border-green-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4">3. Finalidades del Tratamiento</h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Proporcionar y mantener el servicio de análisis de correlación TV/Radio-Web</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Procesar datos de transmisiones y generar insights personalizados en tiempo real</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Mejorar y optimizar el rendimiento de nuestros algoritmos de análisis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Gestionar suscripciones y acceso a funcionalidades premium</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Personalizar los análisis según el historial de uso</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Prevenir fraudes, abusos y uso indebido del servicio</span>
                  </li>
                </ul>
              </motion.section>

              {/* Section 4 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="border-l-4 border-yellow-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4">4. Base Legal (GDPR)</h2>
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-yellow-400" />
                    Fundamentos Legales
                  </h4>
                  <div className="space-y-3">
                    <p><strong>Ejecución del contrato:</strong> Para prestar los servicios de análisis solicitados</p>
                    <p><strong>Consentimiento:</strong> Para funcionalidades específicas y comunicaciones de marketing (cuando aplica)</p>
                    <p><strong>Interés legítimo:</strong> Para mejorar nuestros servicios, seguridad y prevenir fraudes</p>
                    <p><strong>Cumplimiento legal:</strong> Para obligaciones fiscales y regulatorias</p>
                  </div>
                </div>
              </motion.section>

              {/* Section 5 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="border-l-4 border-red-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4">5. Seguridad de los Datos</h2>
                <p className="mb-4">Implementamos medidas técnicas y organizativas apropiadas:</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">🔐</span>
                    <span><strong>Cifrado en tránsito:</strong> SSL/TLS para todas las comunicaciones</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">🔒</span>
                    <span><strong>Control de acceso:</strong> Basado en roles con autenticación requerida</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">🛡️</span>
                    <span><strong>Almacenamiento seguro:</strong> Datos procesados y almacenados de forma segura</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">🔍</span>
                    <span><strong>Auditorías de seguridad:</strong> Revisiones periódicas de nuestros sistemas</span>
                  </li>
                </ul>
              </motion.section>

              {/* Section 6 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="border-l-4 border-purple-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <UserCheck className="h-6 w-6 mr-3 text-purple-400" />
                  6. Derechos del Usuario
                </h2>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <Eye className="h-4 w-4 mr-2 text-blue-400" />
                      Acceso
                    </h4>
                    <p className="text-sm">Saber qué información procesamos sobre ti</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <span className="inline-flex items-center justify-center w-4 h-4 mr-2">
                        <Download className="w-4 h-4 text-green-400" style={{ minWidth: '16px', minHeight: '16px' }} />
                      </span>
                      Portabilidad
                    </h4>
                    <p className="text-sm">Recibir tus datos en formato estructurado</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <Trash2 className="h-4 w-4 mr-2 text-red-400" />
                      Eliminación
                    </h4>
                    <p className="text-sm">Solicitar borrado de tus datos ("derecho al olvido")</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-yellow-400" />
                      Oposición
                    </h4>
                    <p className="text-sm">Oponerte al tratamiento de datos personales</p>
                  </div>
                </div>
                
                <p className="mb-2"><strong>Para ejercer estos derechos:</strong> Contacta en contacto@imetrics.cl</p>
                <p>Responderemos dentro de los <strong className="text-purple-400">30 días</strong> requeridos por ley.</p>
              </motion.section>

              {/* Section 7 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="border-l-4 border-indigo-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4">7. Retención de Datos</h2>
                <p className="mb-4">Conservamos los datos personales únicamente durante el tiempo necesario:</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-indigo-400 mr-2">•</span>
                    <span><strong>Datos de análisis:</strong> Según configuración del usuario (opción de eliminar historial)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-400 mr-2">•</span>
                    <span><strong>Datos de cuenta:</strong> Mientras la cuenta esté activa + 30 días después de la cancelación</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-400 mr-2">•</span>
                    <span><strong>Datos para cumplimiento legal:</strong> 5 años según requerimientos fiscales</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-400 mr-2">•</span>
                    <span><strong>Datos de mejora de análisis:</strong> Anonimizados después de 12 meses</span>
                  </li>
                </ul>
              </motion.section>

              {/* Section 8 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="border-l-4 border-pink-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4">8. Contacto para Privacidad</h2>
                <p className="mb-4">Para preguntas, ejercer derechos o reportar incidentes de privacidad:</p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-pink-400 mr-2">📧</span>
                    <span><strong>Correo electrónico:</strong> contacto@imetrics.cl</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-pink-400 mr-2">🌐</span>
                    <span><strong>Sitio web:</strong> imetrics.cl</span>
                  </li>
                </ul>
                
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 mt-4">
                  <h4 className="text-white font-semibold mb-2 flex items-center">
                    <span className="text-pink-400 mr-2">⏱️</span>
                    Tiempo de Respuesta
                  </h4>
                  <p>Intentamos responder a todas las consultas relacionadas con privacidad dentro de <strong className="text-pink-400">48 horas hábiles</strong>.</p>
                </div>
              </motion.section>

            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-white/20 text-center">
              <p className="text-slate-400 text-sm">
                Esta política de privacidad fue actualizada por última vez el 18 de diciembre de 2025
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;