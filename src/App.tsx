
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from "sonner";
import ScrollToTop from '@/components/ScrollToTop';

// Páginas principales
import Inicio from '@/pages/inicio/Index';
import Contacto from '@/pages/contacto';
import Restaurante from '@/pages/restaurante/Index';
import SobreNosotros from '@/pages/sobre-nosotros/Index';
import Habitaciones from '@/pages/habitaciones/Index';

// Páginas de autenticación
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

// Páginas de administración - Dashboard
import AdminDashboard from '@/pages/admin/Dashboard';

// Páginas de administración - Pasajeros
import PasajerosIndex from '@/pages/admin/pasajeros/Index';
import PasajerosCreate from '@/pages/admin/pasajeros/Create';
import PasajerosEdit from '@/pages/admin/pasajeros/Edit';

// Páginas de administración - Habitaciones
import HabitacionesIndex from '@/pages/admin/habitaciones/Index';
import HabitacionesCreate from '@/pages/admin/habitaciones/Create';
import HabitacionesEdit from '@/pages/admin/habitaciones/Edit';

// Páginas de administración - Reservas
import ReservasIndex from '@/pages/admin/reservas/Index';
import ReservasCreate from '@/pages/admin/reservas/Create';
import ReservasEdit from '@/pages/admin/reservas/Edit';

// Componentes de layout
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Página de error
import NotFound from '@/pages/NotFound';

function App() {
  // Estado para manejar la autenticación
  // En una aplicación real, esto vendría de tu contexto de autenticación o estado global
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simulamos un efecto para verificar la autenticación
  useEffect(() => {
    // Aquí iría la lógica para verificar si el usuario está autenticado
    // Por ejemplo, verificando un token en localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Función para manejar el login (simulada)
  const handleLogin = () => {
    // En una aplicación real, aquí iría la lógica de autenticación
    localStorage.setItem('authToken', 'dummy_token');
    setIsAuthenticated(true);
  };

  // Función para manejar el logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <>
      <ScrollToTop />
      <Toaster position="top-right" />
      <Routes>
        {/* Rutas públicas con el layout principal */}
        <Route path="/" element={<Layout><Outlet /></Layout>}>
          <Route index element={<Inicio />} />
          <Route path="sobre-nosotros" element={<SobreNosotros />} />
          <Route path="restaurante" element={<Restaurante />} />
          <Route path="habitaciones" element={<Habitaciones />} />
          <Route path="contacto" element={<Contacto />} />
          
          {/* Rutas de autenticación */}
          <Route 
            path="iniciar-sesion" 
            element={
              isAuthenticated ? (
                <Navigate to="/admin" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } 
          />
          <Route path="registro" element={<Register />} />
          <Route path="recuperar-contrasena" element={<ForgotPassword />} />
          <Route path="restablecer-contrasena" element={<ResetPassword />} />
        </Route>

        {/* Rutas de administración protegidas */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} redirectPath="/iniciar-sesion">
              <AdminLayout onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          {/* Dashboard principal */}
          <Route index element={<AdminDashboard />} />
          
          {/* Gestión de Pasajeros */}
          <Route path="pasajeros">
            <Route index element={<PasajerosIndex />} />
            <Route path="create" element={<PasajerosCreate />} />
            <Route path="edit/:id" element={<PasajerosEdit />} />
          </Route>
          
          {/* Gestión de Habitaciones */}
          <Route path="habitaciones">
            <Route index element={<HabitacionesIndex />} />
            <Route path="create" element={<HabitacionesCreate />} />
            <Route path="edit/:id" element={<HabitacionesEdit />} />
          </Route>
          
          {/* Gestión de Reservas */}
          <Route path="reservas">
            <Route index element={<ReservasIndex />} />
            <Route path="create" element={<ReservasCreate />} />
            <Route path="edit/:id" element={<ReservasEdit />} />
          </Route>
          
          {/* Redirección para rutas no encontradas dentro de admin */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* 404 - Página no encontrada */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
