// useAuth.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const useAuth = () => {
  const [user, setUser] = useState<any>(undefined); // `undefined` como estado inicial
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      console.log('User session detected:', session);
    };

    checkUserSession();

    // Escucha eventos de autenticación para actualizaciones de estado
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    // Limpia la suscripción al desmontar
    return () => {
      subscription.subscription?.unsubscribe();
    };
  }, [navigate]);

  return user;
};

export default useAuth;
