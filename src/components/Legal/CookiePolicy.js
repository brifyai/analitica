import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Cookie, Settings, Eye, Shield, BarChart3, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CookiePolicy = () => {
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
              <Cookie className="h-6 w-6 text-white" />
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
                <Cookie className="h-4 w-4 text-yellow-400 mr-2" />
                <span className="text-sm text-slate-200">Uso Mínimo y Esencial</span>
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-4">
                Política de Cookies
              </h1>
              <p className="text-xl text-slate-300 mb-4">
                Uso mínimo y esencial de cookies para mejorar su experiencia
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
                  <Cookie className="h-6 w-6 mr-3 text-purple-400" />
                  1. ¿Qué son las Cookies?
                </h2>
                <p className="mb-4">Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web. Nos ayudan a mejorar su experiencia y proporcionar funcionalidades esenciales.</p>
                
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-green-400" />
                    Nuestro Enfoque
                  </h4>
                  <p>En iMetrics utilizamos un <strong className="text-white">enfoque mínimo</strong> de cookies, priorizando su privacidad y solo utilizando las estrictamente necesarias para el funcionamiento del servicio.</p>
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
                  <Settings className="h-6 w-6 mr-3 text-blue-400" />
                  2. Tipos de Cookies que Utilizamos
                </h2>
                
                <h3 className="text-lg font-semibold text-white mb-3">2.1 Cookies Esenciales (Necesarias):</h3>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
                  <div className="flex items-center mb-2">
                    <span className="w-3 h-3 bg-green-400 rounded-full mr-3"></span>
                    <span className="text-white font-semibold">Siempre Activas</span>
                  </div>
                  <p className="text-sm mb-3">Estas cookies son fundamentales para el funcionamiento del sitio web y no se pueden desactivar.</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      <span><strong>Sesión de usuario:</strong> Mantiene su sesión activa mientras navega</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      <span><strong>Preferencias de idioma:</strong> Recuerda su idioma preferido</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      <span><strong>Configuración de seguridad:</strong> Protege contra ataques y accesos no autorizados</span>
                    </li>
                  </ul>
                </div>

                <h3 className="text-lg font-semibold text-white mb-3">2.2 Cookies de Rendimiento (Opcionales):</h3>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
                  <div className="flex items-center mb-2">
                    <span className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></span>
                    <span className="text-white font-semibold">Requieren Consentimiento</span>
                  </div>
                  <p className="text-sm mb-3">Nos ayudan a entender cómo interactúa con nuestro sitio web.</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      <span><strong>Google Analytics:</strong> Datos anonimizados sobre el uso del sitio (opcional)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      <span><strong>Tiempo de carga:</strong> Mide el rendimiento de las páginas</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      <span><strong>Errores del sitio:</strong> Identifica problemas técnicos para mejorar el servicio</span>
                    </li>
                  </ul>
                </div>

                <h3 className="text-lg font-semibold text-white mb-3">2.3 Cookies que NO utilizamos:</h3>
                <div className="bg-red-500/10 rounded-lg p-4 border border-red-400/20">
                  <div className="flex items-center mb-2">
                    <span className="w-3 h-3 bg-red-400 rounded-full mr-3"></span>
                    <span className="text-white font-semibold">Política de Privacidad Estricta</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">✗</span>
                      <span><strong>Cookies de publicidad:</strong> No rastreamos para mostrar anuncios</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">✗</span>
                      <span><strong>Cookies de seguimiento:</strong> No compartimos datos con terceros para seguimiento</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">✗</span>
                      <span><strong>Cookies de redes sociales:</strong> No incrustamos botones de redes sociales</span>
                    </li>
                  </ul>
                </div>
              </motion.section>

              {/* Section 3 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="border-l-4 border-green-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Eye className="h-6 w-6 mr-3 text-green-400" />
                  3. Gestión de Cookies
                </h2>
                
                <h3 className="text-lg font-semibold text-white mb-3">3.1 Control desde su navegador:</h3>
                <p className="mb-4">Puede controlar y eliminar cookies a través de la configuración de su navegador:</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span><strong>Safari:</strong> Preferencias → Privacidad → Gestionar datos del sitio web</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span><strong>Edge:</strong> Configuración → Privacidad → Cookies</span>
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-white mb-3">3.2 Consecuencias de deshabilitar cookies:</h3>
                <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-400/20">
                  <p className="text-sm mb-2"><strong>Nota importante:</strong> Deshabilitar cookies esenciales puede afectar la funcionalidad del sitio web.</p>
                  <ul className="space-y-1 text-sm">
                    <li>• No podrá mantener su sesión activa</li>
                    <li>• Puede perder sus preferencias guardadas</li>
                    <li>• Algunas funciones pueden no funcionar correctamente</li>
                  </ul>
                </div>
              </motion.section>

              {/* Section 4 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="border-l-4 border-yellow-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4">4. Cookies de Terceros</h2>
                <p className="mb-4">Utilizamos servicios de terceros que pueden establecer sus propias cookies:</p>
                
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2 text-blue-400" />
                      Google Analytics (Opcional)
                    </h4>
                    <p className="text-sm mb-2">Utilizamos Google Analytics para entender cómo los usuarios interactúan con nuestro sitio.</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Datos anonimizados</li>
                      <li>• No se recopila información personal identificable</li>
                      <li>• Puede opt-out a través de la configuración de Google</li>
                    </ul>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-green-400" />
                      Proveedores de Seguridad
                    </h4>
                    <p className="text-sm mb-2">Utilizamos servicios de seguridad para proteger nuestro sitio web.</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Protección contra ataques DDoS</li>
                      <li>• Detección de actividades maliciosas</li>
                      <li>• Cumplimiento de estándares de seguridad</li>
                    </ul>
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
                <h2 className="text-2xl font-semibold text-white mb-4">5. Duración de las Cookies</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                      Cookies de Sesión
                    </h4>
                    <p className="text-sm">Se eliminan automáticamente cuando cierra su navegador.</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <Settings className="h-4 w-4 mr-2 text-blue-400" />
                      Cookies Persistentes
                    </h4>
                    <p className="text-sm">Permanecen en su dispositivo por un período determinado (máximo 12 meses).</p>
                  </div>
                </div>
              </motion.section>

              {/* Section 6 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="border-l-4 border-indigo-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4">6. Consentimiento</h2>
                <p className="mb-4">Al utilizar nuestro sitio web, usted consiente el uso de cookies esenciales. Para las cookies opcionales, le solicitaremos su consentimiento explícito.</p>
                
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-2">¿Cómo damos el consentimiento?</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Banner de cookies en su primera visita</li>
                    <li>• Configuración granular de preferencias</li>
                    <li>• Posibilidad de cambiar su consentimiento en cualquier momento</li>
                  </ul>
                </div>
              </motion.section>

              {/* Section 7 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="border-l-4 border-pink-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4">7. Cambios en esta Política</h2>
                <p className="mb-4">Podemos actualizar esta política de cookies ocasionalmente para reflejar cambios en nuestras prácticas o por otras razones operativas, legales o regulatorias.</p>
                
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-2">Le notificaremos sobre cambios importantes:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Actualizando la fecha de "última actualización"</li>
                    <li>• Notificación prominente en nuestro sitio web</li>
                    <li>• Email a usuarios registrados (si el cambio es sustancial)</li>
                  </ul>
                </div>
              </motion.section>

              {/* Section 8 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="border-l-4 border-teal-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4">8. Contacto</h2>
                <p className="mb-4">Si tiene preguntas sobre nuestra política de cookies o desea ejercer sus derechos:</p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-teal-400 mr-2">📧</span>
                    <span><strong>Email:</strong> contacto@imetrics.cl</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-teal-400 mr-2">🌐</span>
                    <span><strong>Sitio web:</strong> imetrics.cl</span>
                  </li>
                </ul>
                
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 mt-4">
                  <h4 className="text-white font-semibold mb-2 flex items-center">
                    <span className="text-teal-400 mr-2">⏱️</span>
                    Tiempo de Respuesta
                  </h4>
                  <p>Respondemos a consultas sobre cookies dentro de <strong className="text-teal-400">48 horas hábiles</strong>.</p>
                </div>
              </motion.section>

              {/* Section 9 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="border-l-4 border-orange-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4">9. Cumplimiento Legal</h2>
                <p className="mb-4">Esta política de cookies cumple con:</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">•</span>
                    <span><strong>GDPR</strong> (Reglamento General de Protección de Datos de la UE)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">•</span>
                    <span><strong>CCPA</strong> (Ley de Privacidad del Consumidor de California)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">•</span>
                    <span><strong>Ley de Cookies Europea</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">•</span>
                    <span><strong>LGPD</strong> (Ley General de Protección de Datos de Brasil)</span>
                  </li>
                </ul>
              </motion.section>

            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-white/20 text-center">
              <p className="text-slate-400 text-sm">
                Esta política de cookies fue actualizada por última vez el 18 de diciembre de 2025
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;