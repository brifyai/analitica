import React, { useState } from 'react';
import { X, Copy, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

const SupabaseSetupHelper = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const scopesToCopy = `email
profile
https://www.googleapis.com/auth/analytics.readonly
https://www.googleapis.com/auth/analytics.edit
https://www.googleapis.com/auth/analytics.manage.users.readonly`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scopesToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Configuración de Supabase - Guía Paso a Paso
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Alerta Importante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Configuración requerida para Google Analytics
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  Para que el proxy funcione correctamente, debes configurar los scopes de Google OAuth en Supabase.
                </p>
              </div>
            </div>
          </div>

          {/* Paso 1 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Paso 1: Acceder a la configuración de Authentication
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Ve al dashboard de Supabase: <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">supabase.com/dashboard</a></li>
              <li>Selecciona tu proyecto</li>
              <li>En el menú lateral, haz clic en <strong>Authentication</strong></li>
              <li>Haz clic en <strong>Providers</strong></li>
              <li>Busca y haz clic en <strong>Google</strong></li>
            </ol>
          </div>

          {/* Paso 2 - Scopes */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Paso 2: Configurar los Scopes (IMPORTANTE)
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              En el campo <strong>"Additional Scopes"</strong>, agrega exactamente estos tres scopes:
            </p>
            
            {/* Scopes Code Block */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-gray-500">SCOPES REQUERIDOS (ACTUALIZADOS)</span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
              <pre className="text-sm text-gray-800 font-mono whitespace-pre-line">
                {scopesToCopy}
              </pre>
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-700">
                  <strong>Nota:</strong> Estos scopes incluyen permisos completos para Analytics que ya tienes configurados.
                </p>
              </div>
            </div>

            {/* Explicación de scopes */}
            <div className="space-y-2">
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium text-gray-700">email</span>
                  <p className="text-xs text-gray-500">Permite acceder al correo electrónico del usuario</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium text-gray-700">profile</span>
                  <p className="text-xs text-gray-500">Permite acceder al perfil básico del usuario</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium text-gray-700">https://www.googleapis.com/auth/analytics.readonly</span>
                  <p className="text-xs text-gray-500">🔥 ESENCIAL - Permite leer datos de Google Analytics</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium text-gray-700">https://www.googleapis.com/auth/analytics.edit</span>
                  <p className="text-xs text-gray-500">Permite editar configuraciones de Analytics</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium text-gray-700">https://www.googleapis.com/auth/analytics.manage.users.readonly</span>
                  <p className="text-xs text-gray-500">Permite gestionar usuarios de Analytics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Paso 3: Configurar Credenciales de Google
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Ve a <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Google Cloud Console</a></li>
              <li>Selecciona tu proyecto</li>
              <li>Ve a <strong>APIs & Services</strong> → <strong>Credentials</strong></li>
              <li>Crea un nuevo <strong>OAuth 2.0 Client ID</strong> o usa uno existente</li>
              <li>Copia el <strong>Client ID</strong> y <strong>Client Secret</strong></li>
              <li>Pega estos valores en la configuración de Supabase</li>
              <li>En <strong>Authorized redirect URIs</strong>, agrega la URL que te proporciona Supabase</li>
            </ol>
          </div>

          {/* Paso 4 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Paso 4: Habilitar Google Analytics API
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>En Google Cloud Console, ve a <strong>APIs & Services</strong> → <strong>Library</strong></li>
              <li>Busca <strong>"Google Analytics Data API"</strong></li>
              <li>Haz clic en <strong>Enable</strong></li>
              <li>Configura el <strong>OAuth Consent Screen</strong> si aún no lo has hecho</li>
              <li>Agrega tu correo como usuario de prueba</li>
            </ol>
          </div>

          {/* Verificación */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Verificación Final
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  Después de configurar todo:
                </p>
                <ul className="mt-2 list-disc list-inside text-sm text-green-700 space-y-1">
                  <li>Guarda la configuración en Supabase</li>
                  <li>Reinicia tu aplicación local</li>
                  <li>Intenta conectar con Google Analytics</li>
                  <li>Debería funcionar sin errores 500</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Enlaces útiles */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Enlaces Útiles
            </h3>
            <div className="space-y-2">
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Dashboard de Supabase
              </a>
              <a 
                href="https://console.cloud.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Google Cloud Console
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupabaseSetupHelper;