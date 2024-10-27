// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = useAuth();

  if (!user) {
    // Si el usuario no está autenticado, redirigimos a la página de login
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está autenticado, renderizamos el contenido de la ruta protegida
  return <>{children}</>;
};

export default ProtectedRoute;
