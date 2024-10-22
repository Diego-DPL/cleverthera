import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="w-full top-0 bg-green-600 p-4 flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
            CleverThera
        </Link>
      <div>
        <Link to="/login" className="text-white mr-4 hover:underline">
          Iniciar Sesión
        </Link>
        <Link to="/register" className="text-white hover:underline">
          Registrarse
        </Link>
      </div>
    </header>
  );
};

export default Header;
