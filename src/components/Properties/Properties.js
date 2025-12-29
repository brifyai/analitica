import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import LoadingSpinner from '../UI/LoadingSpinner';
import {
  Globe,
  RefreshCw,
  AlertCircle,
  Database,
  ArrowLeft,
  Search,
  Filter,
  Monitor,
  Smartphone,
  Tv,
  Activity,
  TrendingUp
} from 'lucide-react';

const Properties = () => {
  const { accountId } = useParams();
  const { 
    accounts, 
    properties, 
    loading, 
    error, 
    loadAccountsAndProperties,
    isConnected 
  } = useGoogleAnalytics();

  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Find the current account
  const currentAccount = accounts.find(account => account.id === accountId);

  // Filter properties for this account
  const accountProperties = properties.filter(property => property.accountId === accountId);

  // Filter properties based on search and type
  const filteredProperties = accountProperties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || property.type === filterType;
    return matchesSearch && matchesFilter;
  });

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

  // Get unique property types for filter
  const propertyTypes = [...new Set(accountProperties.map(p => p.type))];

  // Get property type icon
  const getPropertyIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'web':
        return Monitor;
      case 'app':
      case 'mobile_app':
        return Smartphone;
      case 'tv':
        return Tv;
      default:
        return Globe;
    }
  };

  // Get property type color
  const getPropertyColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'web':
        return 'from-blue-500 to-blue-600';
      case 'app':
      case 'mobile_app':
        return 'from-green-500 to-green-600';
      case 'tv':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading && accountProperties.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8 text-white animate-pulse" />
            </div>
            <LoadingSpinner size="lg" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Cargando propiedades...</p>
        </motion.div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Database className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Sin conexión con Google Analytics
          </h3>
          <p className="text-gray-600 mb-6">
            Conecta tu cuenta de Google Analytics para ver y gestionar tus propiedades.
          </p>
          <Link
            to="/accounts"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Conectar Cuenta
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Cuenta no encontrada
          </h3>
          <p className="text-gray-600 mb-6">
            La cuenta especificada no existe o no tienes acceso a ella.
          </p>
          <Link
            to="/accounts"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a cuentas
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/accounts"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver a cuentas
              </Link>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
          
          <div className="mt-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Propiedades de Google Analytics
            </h1>
            <p className="mt-2 text-gray-600">
              Gestiona las propiedades de <span className="font-semibold">{currentAccount?.displayName || currentAccount?.name}</span>
            </p>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error al cargar datos
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Buscar propiedades..."
                  />
                </div>
              </div>

              {/* Filter */}
              <div className="flex items-center space-x-3">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[150px]"
                >
                  <option value="all">Todos los tipos</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {accountProperties.length === 0
                ? 'No hay propiedades en esta cuenta'
                : 'No se encontraron propiedades'
              }
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {accountProperties.length === 0
                ? 'Esta cuenta no tiene propiedades de Google Analytics configuradas.'
                : 'Intenta cambiar los filtros de búsqueda para encontrar las propiedades que buscas.'
              }
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {filteredProperties.map((property, index) => {
              const PropertyIcon = getPropertyIcon(property.type);
              const colorClass = getPropertyColor(property.type);
              
              return (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${colorClass} rounded-xl flex items-center justify-center shadow-lg`}>
                          <PropertyIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                            {property.displayName || property.name}
                          </h3>
                          <p className="text-sm text-gray-500">{property.type}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
                        {property.type}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">ID de Propiedad</span>
                        <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                          {property.id}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Cuenta</span>
                        <span className="text-sm text-gray-900 font-medium">
                          {currentAccount?.displayName || currentAccount?.name}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <Link
                        to={`/analytics/${property.id}`}
                        className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Ver Analytics
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {accountProperties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
                Resumen de Propiedades
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total Propiedades</p>
                      <p className="text-2xl font-bold text-blue-900">{accountProperties.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Search className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Filtradas</p>
                      <p className="text-2xl font-bold text-green-900">{filteredProperties.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Filter className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Tipos Únicos</p>
                      <p className="text-2xl font-bold text-purple-900">{propertyTypes.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Database className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-orange-600">Cuenta</p>
                      <p className="text-lg font-bold text-orange-900 truncate">
                        {currentAccount?.displayName || currentAccount?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Properties;