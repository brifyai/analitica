import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../UI/LoadingSpinner';
import { Mail, Lock, User, AlertCircle, CheckCircle, Eye, EyeOff, BarChart3, Sparkles, ArrowRight, Shield, Zap } from 'lucide-react';

const Register = () => {
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      throw new Error('El correo electrónico es requerido');
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      throw new Error('Por favor ingresa un correo electrónico válido');
    }

    if (!formData.password.trim()) {
      throw new Error('La contraseña es requerida');
    }

    if (!formData.fullName.trim()) {
      throw new Error('El nombre completo es requerido');
    }

    if (formData.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      validateForm();

      await signUpWithEmail(formData.email, formData.password, formData.fullName);
      setSuccess('¡Cuenta creada exitosamente! Revisa tu correo para confirmar tu cuenta.');
      
      // Clear form after successful signup
      setFormData({
        email: '',
        password: '',
        fullName: ''
      });
      
      // Redirect to login after successful signup
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding & Features */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-yellow-800" />
                  </div>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  iMetrics
                </h1>
              </div>
              
              <p className="text-xl lg:text-2xl text-purple-200 font-light">
                Análisis Inteligente de Métricas
              </p>
              
              <p className="text-lg text-slate-300 max-w-lg mx-auto lg:mx-0">
                Transforma tus datos en insights accionables con análisis de video, correlación TV-Web y Radio-Web con métricas en tiempo real.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto lg:mx-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3 mx-auto lg:mx-0">
                  <Zap className="h-5 w-5 text-purple-300" />
                </div>
                <h3 className="font-semibold text-white text-sm">Análisis en Tiempo Real</h3>
                <p className="text-slate-300 text-xs mt-1">Métricas instantáneas</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center mb-3 mx-auto lg:mx-0">
                  <Shield className="h-5 w-5 text-pink-300" />
                </div>
                <h3 className="font-semibold text-white text-sm">Datos Seguros</h3>
                <p className="text-slate-300 text-xs mt-1">Protección garantizada</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-3 mx-auto lg:mx-0">
                  <BarChart3 className="h-5 w-5 text-yellow-300" />
                </div>
                <h3 className="font-semibold text-white text-sm">Insights IA</h3>
                <p className="text-slate-300 text-xs mt-1">Recomendaciones inteligentes</p>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
              
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Crea tu cuenta
                </h2>
                <p className="text-slate-300">
                  Comienza tu análisis inteligente
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-300 mr-3 flex-shrink-0" />
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="mb-6 bg-green-500/20 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-300 mr-3 flex-shrink-0" />
                    <p className="text-sm text-green-200">{success}</p>
                  </div>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleEmailAuth}>
                {/* Full Name Field */}
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-200">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-200">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-300 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    La contraseña debe tener al menos 6 caracteres
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <>
                      <span>Crear Cuenta</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-slate-400">O continúa con</span>
                  </div>
                </div>
              </div>

              {/* Google OAuth Button */}
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 backdrop-blur-sm flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{loading ? 'Conectando...' : 'Gmail'}</span>
              </button>

              {/* Toggle to Login */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/login');
                  }}
                  className="text-sm text-purple-300 hover:text-purple-200 font-medium transition-colors duration-200"
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-400">
                  Después del registro, podrás conectar con Google Analytics 4
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">iMetrics</span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <div className="flex items-center space-x-4 text-sm">
                <a
                  href="/privacidad"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/privacidad');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Privacidad
                </a>
                <a
                  href="/terminos"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/terminos');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Términos
                </a>
                <a
                  href="/cookies"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/cookies');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Cookies
                </a>
              </div>
              <div className="text-slate-400 text-sm">
                © 2026 iMetrics. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Register;