// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = useAuth();

  console.log('ProtectedRoute-> user ', user);

  if (user === undefined) {
    // Muestra un indicador de carga mientras se verifica la sesión
    return <div>Loading...</div>;
  }

  if (!user) {
    // Si el usuario no está autenticado, redirigimos a la página de login
    console.log('ProtectedRoute-> Navigate to /login'); 
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está autenticado, renderizamos el contenido de la ruta protegida
  return <>{children}</>;
};

export default ProtectedRoute;
