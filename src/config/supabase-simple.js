import { createClient } from '@supabase/supabase-js';

// CREDENCIALES DIRECTAS - SIN LÓGICA COMPLEJA
const SUPABASE_URL = 'https://uwbxyaszdqwypbebogvw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3Ynh5YXN6ZHF3eXBiZWJvZ3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDIyOTgsImV4cCI6MjA4MTIxODI5OH0.F7ZKl7pYtZDWQ0g6RRKtUm_PKqT5mJ7jjpLdXB5Lxmc';

console.log('🚀 CONFIGURACIÓN SIMPLE DE SUPABASE');
console.log('✅ URL:', SUPABASE_URL);
console.log('✅ Key:', 'DEFINIDA (oculta por seguridad)');

// Crear cliente directamente sin validaciones complejas
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Cliente de Supabase creado exitosamente');

export { supabase };