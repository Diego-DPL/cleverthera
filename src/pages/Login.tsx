import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para manejar el inicio de sesión
    console.log('Iniciando sesión con:', { email, password });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-3xl text-gray-800 font-bold mb-8">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <div className="mb-4">
          <label className="block text-gray-700">Correo Electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded mt-2 focus:outline-none focus:border-green-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded mt-2 focus:outline-none focus:border-green-500"
          />
        </div>
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-300">
          Iniciar Sesión
        </button>
        <p className="text-gray-600 mt-4">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-green-600 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
