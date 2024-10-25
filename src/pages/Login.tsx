import React, { useState } from 'react';
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { FaGoogle, FaFacebook } from 'react-icons/fa'
import { supabase } from '../supabaseClient' 

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('login');  // Nueva variable de estado para controlar la pestaña seleccionada

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Inicio de sesión con:', email, password);
    // Lógica de inicio de sesión con correo y contraseña
  };

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registro con:', email, password);
    // Lógica de registro con correo y contraseña
  };

  const handleGoogleLogin = async () => {
    const redirectTo = `${window.location.origin}/transcripcion`;  // Redirige según la pestaña activa
    console.log('Redirecting to:', redirectTo);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (error) console.log('Error de inicio de sesión con Google:', error.message);
  };

  const handleGoogleSignup = async () => {
    const redirectTo = `${window.location.origin}/transcripcion`;  // Redirige según la pestaña activa
    console.log('Redirecting to:', redirectTo);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (error) console.log('Error de registro con Google:', error.message);
  };

  const handleFacebookLogin = async () => {
    const redirectTo = `${window.location.origin}/${tab}`;
    console.log('Redirecting to:', redirectTo);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo },
    });

    if (error) console.log('Error de autenticación con Facebook:', error.message);
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Bienvenido a CleverThera</CardTitle>
          <CardDescription>Inicia sesión o crea una cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full" onValueChange={setTab}>  {/* Actualizamos la pestaña activa */}
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
              {/* Mover contenido del CardFooter aquí */}
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
              <form onSubmit={handleEmailSignup}>  {/* Usamos handleEmailSignup aquí */}
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
                    />
                  </div>
                </div>
                <Button className="w-full mt-4" type="submit">Registrarse</Button>
              </form>
              {/* Mover contenido del CardFooter aquí */}
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
    </div>
  );
};

export default Login;
