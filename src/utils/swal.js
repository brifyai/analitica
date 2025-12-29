import Swal from 'sweetalert2';

// Configuración por defecto para SweetAlert2
const defaultConfig = {
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Aceptar',
  cancelButtonText: 'Cancelar',
  allowOutsideClick: false,
  allowEscapeKey: false,
  showConfirmButton: true,
  timer: undefined
};

// Función para mostrar alertas de error
export const showError = (message, title = 'Error') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: '#dc3545'
  });
};

// Función para mostrar alertas de éxito
export const showSuccess = (message, title = 'Éxito') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: '#28a745',
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false
  });
};

// Función para mostrar alertas de información
export const showInfo = (message, title = 'Información') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'info',
    title,
    text: message,
    confirmButtonColor: '#17a2b8'
  });
};

// Función para mostrar alertas de advertencia
export const showWarning = (message, title = 'Advertencia') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'warning',
    title,
    text: message,
    confirmButtonColor: '#ffc107'
  });
};

// Función para mostrar alertas de confirmación
export const showConfirm = (message, title = 'Confirmar') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#6c757d'
  });
};

// Función para mostrar alertas de carga
export const showLoading = (message = 'Procesando...') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'info',
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    }
  });
};

// Función para cerrar la alerta actual
export const closeSwal = () => {
  Swal.close();
};

// Función para alertas personalizadas con HTML
export const showCustom = (config) => {
  return Swal.fire({
    ...defaultConfig,
    ...config
  });
};

const swalUtils = {
  showError,
  showSuccess,
  showInfo,
  showWarning,
  showConfirm,
  showLoading,
  closeSwal,
  showCustom
};

export default swalUtils;