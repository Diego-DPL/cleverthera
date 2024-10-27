import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Asegúrate de tener el cliente de supabase configurado

const useAuth = () => {
  const [user, setUser] = useState<any>(undefined); // Cambiamos null por undefined para diferenciar la carga inicial
  const navigate = useNavigate();

  useEffect(() => {
    // Verificamos la sesión actual del usuario
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      console.log('useAuth 1 session', session);
      console.log('useAuth 1 user', session?.user);
    };

    checkUserSession();

    // Escuchar cambios de estado de autenticación
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('useAuth 2 event', event);
      console.log('useAuth 2 session', session);
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        navigate('/login');  // Redirige a la página de login si el usuario ha cerrado sesión
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
