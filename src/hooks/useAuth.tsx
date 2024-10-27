import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Asegúrate de tener el cliente de supabase configurado

const useAuth = () => {
  const [user, setUser] = useState<any>(null); // Guardamos el estado del usuario
  const navigate = useNavigate();

  useEffect(() => {
    // Verificamos la sesión actual del usuario
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      console.log('session', session);
      console.log('user', session?.user);
    };

    checkUserSession();

    // Escuchar cambios de estado de autenticación
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('event', event);
      console.log('session', session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/login');  // Redirige a la página de login si no hay usuario
      }
    });

    // Limpieza del listener al desmontar el componente
    return () => {
      subscription.subscription?.unsubscribe();
    };
  }, [navigate]);

  return user;
};

export default useAuth;
