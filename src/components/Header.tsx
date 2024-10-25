import React from 'react';
import { Link } from 'react-router-dom';
import { Mic } from "lucide-react"
import useAuth from '../hooks/useAuth'; // Hook de autenticación
import { supabase } from '../supabaseClient'; // Cliente de Supabase


const Header: React.FC = () => {

    const user = useAuth();  // Obtenemos el usuario autenticado

    const handleLogout = async () => {
      await supabase.auth.signOut();
    };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
            <Link to="/" className="flex items-center justify-center ml-8 space-x-2" >
                <Mic className="h-6 w-6 text-primary" />
                <span className="text-2xl font-bold text-primary">CleverThera</span>
            </Link>
            <nav className="ml-auto flex gap-4 sm:gap-6">
                {user ? (
                  <>
                    <Link to="/transcripcion" className="text-sm font-medium hover:text-primary">
                      Transcripción
                    </Link>
                    <button onClick={handleLogout} className="text-sm font-medium hover:text-primary">
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/transcripcion" className="text-sm font-medium hover:text-primary">
                      Características
                    </Link>
                    <Link to="/transcripcion" className="text-sm font-medium hover:text-primary">
                      Precios
                    </Link>
                    <Link to="/transcripcion" className="text-sm font-medium hover:text-primary">
                      Contacto
                    </Link>
                    <Link to="/login" className="text-sm font-medium hover:text-primary">
                      Iniciar sesión
                    </Link>
                  </>
                )}
            </nav>
        </div>
    </header>
  );
};

export default Header;
