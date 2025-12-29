import { createClient } from '@supabase/supabase-js';

// CREDENCIALES DIRECTAS - SOLUCIÓN DEFINITIVA
const SUPABASE_URL = 'https://uwbxyaszdqwypbebogvw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3Ynh5YXN6ZHF3eXBiZWJvZ3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDIyOTgsImV4cCI6MjA4MTIxODI5OH0.F7ZKl7pYtZDWQ0g6RRKtUm_PKqT5mJ7jjpLdXB5Lxmc';

console.log('🚀 NUEVA CONFIGURACIÓN SUPABASE - SIN ERRORES');
console.log('✅ URL:', SUPABASE_URL);
console.log('✅ Key:', 'DEFINIDA (oculta por seguridad)');

// Crear cliente directamente
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Cliente de Supabase creado exitosamente - NUEVA VERSIÓN');

export { supabase };