// src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/ui/Modal'; // Importa el nuevo componente Modal


const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('login');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
    setPassword('');
    setConfirmPassword('');
  }, [tab]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/transcripcion');
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      alert('Registro exitoso. Por favor, verifica tu correo electrónico para confirmar tu cuenta.');
      navigate('/login');
    }
  };

  const handleGoogleLogin = async () => {
    const redirectTo = `${window.location.origin}/transcripcion`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignup = async () => {
    await handleGoogleLogin();
  };

  const handleFacebookLogin = async () => {
    setIsModalOpen(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Bienvenido a CleverThera</CardTitle>
          <CardDescription>Inicia sesión o crea una cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <Tabs defaultValue="login" className="w-full" onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleEmailLogin}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input 
                      id="email" 
                      placeholder="nombre@ejemplo.com" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input 
                      id="password" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button className="w-full mt-4" type="submit">Iniciar Sesión</Button>
              </form>
              <div className="relative w-full my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <Button variant="outline" onClick={handleGoogleLogin}>
                  <FaGoogle className="mr-2 h-4 w-4" /> Google
                </Button>
                <Button variant="outline" onClick={handleFacebookLogin}>
                  <FaFacebook className="mr-2 h-4 w-4" /> Facebook
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleEmailSignup}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="register-email">Correo electrónico</Label>
                    <Input 
                      id="register-email" 
                      placeholder="nombre@ejemplo.com" 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <Input 
                      id="register-password" 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button className="w-full mt-4" type="submit">Registrarse</Button>
              </form>
              <div className="relative w-full my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <Button variant="outline" onClick={handleGoogleSignup}>
                  <FaGoogle className="mr-2 h-4 w-4" /> Google
                </Button>
                <Button variant="outline" onClick={handleFacebookLogin}>
                  <FaFacebook className="mr-2 h-4 w-4" /> Facebook
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Funcionalidad no disponible"
      >
        <p>
          La opción de iniciar sesión con Facebook no está disponible actualmente. Por favor, utiliza otra opción para iniciar sesión.
        </p>
      </Modal>
    </div>
  );
};

export default Login;
