// hooks/useAuth.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Asegúrate de que tienes configurado tu cliente Supabase
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Esta función debe ser asíncrona ya que estás llamando a métodos asíncronos
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession(); // Ahora es asíncrono
      setUser(session?.user ?? null);

      // Listener para los cambios de autenticación
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Cambio de estado de autenticación:', event, session);
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate('/login');  // Redirigir si no hay un usuario autenticado
        }
      });

      return () => {
        listener?.subscription.unsubscribe();
      };
    };

    checkSession();
  }, [navigate]);

  return user;
};

export default useAuth;
