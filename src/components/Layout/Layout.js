import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import LoadingSpinner from '../UI/LoadingSpinner';
import Avatar from '../UI/Avatar';
import Help from '../Help/Help';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Database,
  AlertCircle,
  ChevronDown,
  Unlink,
  TrendingUp,
  Radio,
  Maximize,
  Minimize,
  HelpCircle
} from 'lucide-react';

const Layout = () => {
  const { user, signOut } = useAuth();
  const { isConnected, loading: gaLoading, error: gaError, disconnectGoogleAnalytics } = useGoogleAnalytics();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDisconnectAnalytics = async () => {
    try {
      await disconnectGoogleAnalytics();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Error disconnecting Google Analytics:', error);
    }
  };

  const toggleFullscreen = () => {
    setFullscreenMode(!fullscreenMode);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: location.pathname === '/dashboard' },
    { name: 'Cuentas', href: '/accounts', icon: Users, current: location.pathname === '/accounts' },
    { name: 'Spot TV', href: '/spot-analysis', icon: TrendingUp, current: location.pathname === '/spot-analysis' },
    { name: 'Frases Radio', href: '/frases-radio', icon: Radio, current: location.pathname === '/frases-radio' },
    { name: 'Ayuda', href: '#', icon: HelpCircle, current: false, onClick: () => setHelpOpen(true) },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div 
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transition ease-in-out duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">iMetrics</span>
            </div>
            
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                item.onClick ? (
                  <button
                    key={item.name}
                    type="button"
                    className={`group flex items-center w-full px-2 py-2 text-base font-medium rounded-md ${
                      item.current
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => {
                      item.onClick();
                      setSidebarOpen(false);
                    }}
                  >
                    <item.icon
                      className={`mr-4 flex-shrink-0 h-6 w-6 ${
                        item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      item.current
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`mr-4 flex-shrink-0 h-6 w-6 ${
                        item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Avatar
                  src={user?.user_metadata?.avatar_url}
                  alt={user?.email}
                  size="sm"
                  fallbackText={user?.email?.charAt(0).toUpperCase()}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {user?.user_metadata?.full_name || user?.email || 'Usuario'}
                </p>
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                  {user?.email || 'Sin email'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop - solo se muestra si no está en modo pantalla completa */}
      {!fullscreenMode && (
        <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
          <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
            {/* Header del sidebar */}
            <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-6 mb-8">
                <motion.div
                  className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <BarChart3 className="h-7 w-7 text-white" />
                </motion.div>
                <div className="ml-4">
                  <h1 className="text-xl font-bold text-white">iMetrics</h1>
                  <p className="text-xs text-slate-300">Análisis TV-Web & Radio-Web</p>
                </div>
              </div>
              
              {/* Navegación */}
              <nav className="flex-1 px-4 space-y-2">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {item.onClick ? (
                      <button
                        type="button"
                        onClick={item.onClick}
                        className={`group flex items-center w-full px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                          item.current
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg border border-blue-400/30'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white hover:shadow-md'
                        }`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <item.icon
                            className={`mr-4 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
                              item.current ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'
                            }`}
                          />
                        </motion.div>
                        <span className="font-medium">{item.name}</span>
                        {item.current && (
                          <motion.div
                            className="ml-auto h-2 w-2 bg-blue-400 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          />
                        )}
                      </button>
                    ) : (
                      <Link
                        to={item.href}
                        className={`group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                          item.current
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg border border-blue-400/30'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white hover:shadow-md'
                        }`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <item.icon
                            className={`mr-4 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
                              item.current ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'
                            }`}
                          />
                        </motion.div>
                        <span className="font-medium">{item.name}</span>
                        {item.current && (
                          <motion.div
                            className="ml-auto h-2 w-2 bg-blue-400 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          />
                        )}
                      </Link>
                    )}
                  </motion.div>
                ))}
              </nav>
            </div>
            
            {/* Perfil de usuario */}
            <div className="flex-shrink-0 border-t border-slate-700/50 p-4">
              <div className="flex items-center w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-200">
                <div className="flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                  >
                    <Avatar
                      src={user?.user_metadata?.avatar_url}
                      alt={user?.email}
                      size="md"
                      fallbackText={user?.email?.charAt(0).toUpperCase()}
                      className="rounded-xl"
                    />
                  </motion.div>
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.user_metadata?.full_name || user?.email || 'Usuario'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email || 'Sin email'}
                  </p>
                </div>
                <motion.div
                  className="ml-2 h-2 w-2 bg-green-400 rounded-full"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`flex flex-col flex-1 ${!fullscreenMode ? 'md:pl-72' : ''}`}>
        {/* Header - siempre visible */}
        <header className="bg-white shadow">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                {/* Botón de menú móvil */}
                <div className="md:hidden mr-4">
                  <button
                    type="button"
                    className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                </div>
                
                {/* Título eliminado para limpiar la interfaz */}
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Botón de pantalla completa */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleFullscreen}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title={fullscreenMode ? 'Salir de pantalla completa' : 'Pantalla completa'}
                >
                  {fullscreenMode ? (
                    <Minimize className="h-5 w-5" />
                  ) : (
                    <Maximize className="h-5 w-5" />
                  )}
                </motion.button>

                {/* Google Analytics Connection Status */}
                <div className="flex items-center space-x-2">
                  {gaLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : isConnected ? (
                    <div className="flex items-center space-x-1 text-success-600">
                      <Database className="h-4 w-4" />
                      <span className="text-sm font-medium">Conectado</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-danger-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Desconectado</span>
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:bg-gray-100 p-1"
                    id="user-menu-button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <Avatar
                      src={user?.user_metadata?.avatar_url}
                      alt={user?.email}
                      size="sm"
                      fallbackText={user?.email?.charAt(0).toUpperCase()}
                    />
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />
                  </button>

                  {/* User dropdown menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-50">
                      <div className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.user_metadata?.full_name || user?.email || 'Usuario'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user?.email || 'Sin email'}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-3 text-gray-400" />
                          Configuración
                        </Link>
                        
                        {/* Botón para desconectar Google Analytics - solo mostrar si está conectado */}
                        {isConnected && (
                          <button
                            type="button"
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              handleDisconnectAnalytics();
                              setUserMenuOpen(false);
                            }}
                          >
                            <Unlink className="h-4 w-4 mr-3 text-gray-400" />
                            Desconectar Google Analytics
                          </button>
                        )}
                        
                        <button
                          type="button"
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            handleSignOut();
                            setUserMenuOpen(false);
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-3 text-gray-400" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 w-full">
          <div className="w-full py-6">
            {/* Google Analytics Error Alert */}
            {gaError && (
              <div className="mb-6 mx-4 sm:mx-6 lg:mx-8 bg-danger-50 border border-danger-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-danger-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-danger-800">
                      Error de Google Analytics
                    </h3>
                    <div className="mt-2 text-sm text-danger-700">
                      <p>{gaError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Layout normal para todas las páginas */}
            <div className="w-full">
              <Outlet />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">iMetrics</span>
              </div>
              
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                <div className="flex items-center space-x-4 text-sm">
                  <a
                    href="/privacidad"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/privacidad');
                    }}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Privacidad
                  </a>
                  <a
                    href="/terminos"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/terminos');
                    }}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Términos
                  </a>
                  <a
                    href="/cookies"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/cookies');
                    }}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cookies
                  </a>
                </div>
                <div className="text-gray-500 text-sm">
                  © 2026 iMetrics. Todos los derechos reservados.
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Modal de Ayuda */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setHelpOpen(false)}></div>
            <Help isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;