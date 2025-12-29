import React, { useState } from 'react';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import { motion } from 'framer-motion';
import {
  Users,
  Globe,
  ExternalLink,
  RefreshCw,
  Database,
  TrendingUp,
  Brain
} from 'lucide-react';

const Accounts = () => {
  const {
    accounts,
    properties,
    loading,
    error,
    errorType,
    loadAccountsAndProperties,
    isConnected,
    clearError
  } = useGoogleAnalytics();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAccountsAndProperties();
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Group properties by account - Optimized version
  // Create a map for O(1) lookup instead of O(n) filtering
  const propertiesByAccount = React.useMemo(() => {
    const map = new Map();
    properties.forEach(property => {
      const accountId = property.accountId;
      if (!map.has(accountId)) {
        map.set(accountId, []);
      }
      map.get(accountId).push(property);
    });
    return map;
  }, [properties]);

  const accountsWithProperties = React.useMemo(() => {
    return accounts.map(account => ({
      ...account,
      accountProperties: propertiesByAccount.get(account.id) || []
    }));
  }, [accounts, propertiesByAccount]);

  // Debug logging solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 DEBUG: Total de cuentas: ${accounts.length}, Total de propiedades: ${properties.length}`);
    console.log(`🔍 DEBUG: Resumen de propiedades por cuenta:`,
      accountsWithProperties.map(a => ({ id: a.id, name: a.displayName, count: a.accountProperties.length }))
    );
  }

  // Show loading only for initial connection, not for property loading
  const showLoading = loading && accounts.length === 0 && !isConnected;

  if (showLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Principal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Cuentas de Google Analytics
              </h1>
              <p className="text-blue-100">
                Gestiona tus cuentas y propiedades de Google Analytics 4
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mensaje de No Conexión */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="bg-white rounded-xl shadow-lg p-12 max-w-md mx-auto border border-gray-100">
            <Database className="mx-auto h-16 w-16 text-gray-400 mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-4">
              No hay conexión con Google Analytics
            </h3>
            <p className="text-gray-600 mb-6">
              Conecta tu cuenta de Google Analytics para ver tus cuentas y propiedades disponibles.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                Requiere autenticación con Google
              </div>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                Acceso seguro a tus datos
              </div>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                Configuración de una sola vez
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Principal - SIEMPRE VISIBLE */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Cuentas de Google Analytics
            </h1>
            <p className="text-blue-100">
              Gestiona tus cuentas y propiedades de Google Analytics 4
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-6 py-3 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Error Display */}
      <ErrorMessage
        error={error}
        errorType={errorType}
        onDismiss={clearError}
      />

      {/* Estado de No Conexión - OCULTO */}
      {/* {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Database className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay conexión con Google Analytics
          </h3>
          <p className="text-gray-500">
            Conecta tu cuenta de Google Analytics para ver tus cuentas y propiedades.
          </p>
        </motion.div>
      )} */}

      {/* Dashboard de Métricas Principales */}
      {accountsWithProperties.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cuentas</p>
                <p className="text-3xl font-bold text-gray-900">{accountsWithProperties.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Propiedades</p>
                <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio por Cuenta</p>
                <p className="text-3xl font-bold text-gray-900">
                  {accountsWithProperties.length > 0
                    ? Math.round(properties.length / accountsWithProperties.length * 10) / 10
                    : 0
                  }
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confianza IA</p>
                <p className="text-3xl font-bold text-orange-600">0%</p>
                <p className="text-xs text-gray-500">Sin datos reales</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Brain className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Accounts Grid */}
      {accountsWithProperties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay cuentas disponibles
          </h3>
          <p className="text-gray-500">
            {isConnected
              ? 'No se encontraron cuentas de Google Analytics para tu cuenta.'
              : 'Conecta tu cuenta de Google Analytics para ver tus cuentas.'
            }
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {accountsWithProperties.map((account) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {account.displayName || account.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ID: {account.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {loading && accounts.length > 0 ? (
                        <div className="flex items-center">
                          <LoadingSpinner size="sm" />
                          <span className="ml-1">Cargando...</span>
                        </div>
                      ) : (
                        `${account.accountProperties.length} propiedades`
                      )}
                    </span>
                  </div>
                </div>

                {/* Properties List */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Propiedades ({account.accountProperties.length})
                  </h4>
                  
                  {loading && accounts.length > 0 ? (
                    <div className="flex items-center justify-center py-6">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2 text-sm text-gray-500">Cargando propiedades...</span>
                    </div>
                  ) : account.accountProperties.length === 0 ? (
                    <p className="text-sm text-gray-500 italic py-4">
                      No hay propiedades en esta cuenta
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {account.accountProperties.map((property) => (
                        <motion.div
                          key={property.id}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
                        >
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-500 rounded-lg mr-4">
                              <Globe className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {property.displayName || property.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {property.type} • ID: {property.id}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/analytics/${property.id}`}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 transition-all"
                            >
                              Ver datos
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={`/properties/${account.id}`}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Ver todas las propiedades
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Accounts;