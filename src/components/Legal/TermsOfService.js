import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Users, 
  Shield, 
  CreditCard, 
  DollarSign, 
  RefreshCw, 
  XCircle, 
  AlertTriangle,
  Database,
  Upload,
  BarChart3,
  Copyright,
  Scale,
  Edit,
  Globe,
  Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
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
              <FileText className="h-6 w-6 text-white" />
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
                <FileText className="h-4 w-4 text-blue-400 mr-2" />
                <span className="text-sm text-slate-200">Condiciones de Servicio</span>
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-4">
                Condiciones de Servicio de iMetrics
              </h1>
              <p className="text-xl text-slate-300 mb-4">
                Términos de uso para el análisis de correlación TV-Web y Radio-Web
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
                className="border-l-4 border-blue-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <FileText className="h-6 w-6 mr-3 text-blue-400" />
                  1. Introducción
                </h2>
                <p className="mb-4">Bienvenido a iMetrics ("nosotros", "nuestro" o "la Compañía"). Estos Términos de Servicio ("Términos") rigen su acceso y uso de nuestro sitio web imetrics.cl y nuestros servicios de análisis de correlación TV-Web y Radio-Web con métricas en tiempo real (colectivamente, el "Servicio").</p>
                <p className="mb-4">Al acceder o utilizar el Servicio, usted acepta estar sujeto a estos Términos. Si no está de acuerdo con alguna parte de los términos, no podrá acceder al Servicio.</p>
              </motion.section>

              {/* Section 2 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="border-l-4 border-green-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Users className="h-6 w-6 mr-3 text-green-400" />
                  2. Cuentas
                </h2>
                <p className="mb-4">Usted es responsable de mantener la confidencialidad de su cuenta y contraseña. Acepta notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta.</p>
              </motion.section>

              {/* Section 3 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="border-l-4 border-purple-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Shield className="h-6 w-6 mr-3 text-purple-400" />
                  3. Licencia de Uso
                </h2>
                <p className="mb-4">Le otorgamos una licencia limitada, no exclusiva e intransferible para usar el Servicio para la generación de contenido asistido por IA para sus fines comerciales y personales, sujeto a estos Términos.</p>
                
                <h3 className="text-lg font-semibold text-white mb-3">3.1 Uso Prohibido:</h3>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <XCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Actividades ilegales o que infrinjan los derechos de terceros</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Generar material que promueva el odio, la discriminación o la violencia</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Intentar realizar ingeniería inversa, descompilar o descubrir el código fuente de nuestro Servicio</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Revender o sublicenciar el Servicio sin nuestro permiso explícito</span>
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
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <CreditCard className="h-6 w-6 mr-3 text-yellow-400" />
                  4. Pagos y Suscripciones
                </h2>
                <ul className="space-y-4">
                  <li className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-green-400" />
                      Facturación
                    </h4>
                    <p className="text-sm text-slate-300">Los planes pagados se facturan de forma mensual o anual por adelantado.</p>
                  </li>
                  
                  <li className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <RefreshCw className="h-4 w-4 mr-2 text-blue-400" />
                      Renovación Automática
                    </h4>
                    <p className="text-sm text-slate-300">Su suscripción se renovará automáticamente al final de cada ciclo de facturación, a menos que usted la cancele.</p>
                  </li>
                  
                  <li className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <XCircle className="h-4 w-4 mr-2 text-red-400" />
                      Cancelación
                    </h4>
                    <p className="text-sm text-slate-300">Puede cancelar su suscripción en cualquier momento. La cancelación será efectiva al final del período de facturación actual.</p>
                  </li>
                  
                  <li className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-yellow-400" />
                      Reembolsos
                    </h4>
                    <p className="text-sm text-slate-300">Salvo que la ley aplicable exija lo contrario, todos los pagos son finales y no reembolsables.</p>
                  </li>
                </ul>
              </motion.section>

              {/* Section 5 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="border-l-4 border-indigo-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Database className="h-6 w-6 mr-3 text-indigo-400" />
                  5. Propiedad del Contenido
                </h2>
                <ul className="space-y-4">
                  <li className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <Upload className="h-4 w-4 mr-2 text-blue-400" />
                      Contenido del Usuario
                    </h4>
                    <p className="text-sm text-slate-300">Usted retiene la propiedad de todos los datos e información que carga en el Servicio ("Contenido del Usuario").</p>
                  </li>
                  
                  <li className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2 text-green-400" />
                      Contenido Generado
                    </h4>
                    <p className="text-sm text-slate-300">Usted retiene todos los derechos y la propiedad del contenido que genera utilizando el Servicio ("Contenido Generado"). Usted es libre de usar el Contenido Generado para cualquier propósito, incluido el comercial.</p>
                  </li>
                  
                  <li className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-yellow-400" />
                      Responsabilidad
                    </h4>
                    <p className="text-sm text-slate-300">La IA puede cometer errores. Usted es el único responsable de revisar, validar y asegurar que el Contenido Generado sea preciso y apropiado para su uso. No garantizamos la precisión del Contenido Generado.</p>
                  </li>
                </ul>
              </motion.section>

              {/* Section 6 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="border-l-4 border-red-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Copyright className="h-6 w-6 mr-3 text-red-400" />
                  6. Propiedad Intelectual
                </h2>
                <p className="mb-4">El Servicio y todo su contenido original, características y funcionalidades (excluyendo el Contenido del Usuario y el Contenido Generado) son y seguirán siendo propiedad exclusiva de iMetrics y sus licenciantes.</p>
              </motion.section>

              {/* Section 7 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="border-l-4 border-orange-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Shield className="h-6 w-6 mr-3 text-orange-400" />
                  7. Política de Privacidad
                </h2>
                <p className="mb-4">El uso que hacemos de su información personal se rige por nuestra Política de Privacidad, disponible en /privacidad. Al usar el Servicio, usted acepta los términos de nuestra Política de Privacidad.</p>
              </motion.section>

              {/* Section 8 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="border-l-4 border-teal-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <XCircle className="h-6 w-6 mr-3 text-teal-400" />
                  8. Terminación
                </h2>
                <p className="mb-4">Podemos suspender o terminar su acceso al Servicio de inmediato, sin previo aviso, si usted incumple estos Términos.</p>
              </motion.section>

              {/* Section 9 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="border-l-4 border-pink-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <AlertTriangle className="h-6 w-6 mr-3 text-pink-400" />
                  9. Exclusión de Garantías
                </h2>
                <p className="mb-4">El Servicio se proporciona "TAL CUAL" y "SEGÚN DISPONIBILIDAD". No garantizamos que el Servicio será ininterrumpido, seguro o libre de errores.</p>
              </motion.section>

              {/* Section 10 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="border-l-4 border-yellow-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Scale className="h-6 w-6 mr-3 text-yellow-400" />
                  10. Limitación de Responsabilidad
                </h2>
                <p className="mb-4">En la máxima medida permitida por la ley, iMetrics no será responsable de ningún daño indirecto, incidental o consecuente que resulte del uso del Servicio.</p>
              </motion.section>

              {/* Section 11 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="border-l-4 border-green-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Edit className="h-6 w-6 mr-3 text-green-400" />
                  11. Modificaciones a los Términos
                </h2>
                <p className="mb-4">Nos reservamos el derecho de modificar estos Términos en cualquier momento. Le notificaremos publicando los nuevos términos en esta página.</p>
              </motion.section>

              {/* Section 12 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="border-l-4 border-blue-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Globe className="h-6 w-6 mr-3 text-blue-400" />
                  12. Ley Aplicable
                </h2>
                <p className="mb-4">Estos Términos se regirán e interpretarán de acuerdo con las leyes de Chile, sin tener en cuenta sus disposiciones sobre conflicto de leyes.</p>
              </motion.section>

              {/* Section 13 */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="border-l-4 border-purple-400 pl-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Mail className="h-6 w-6 mr-3 text-purple-400" />
                  13. Contacto
                </h2>
                <p className="mb-4">Si tiene alguna pregunta sobre estos Términos, contáctenos en contacto@imetrics.cl.</p>
              </motion.section>

            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-white/20 text-center">
              <p className="text-slate-400 text-sm">
                Estos términos fueron actualizados por última vez el 18 de diciembre de 2025
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;