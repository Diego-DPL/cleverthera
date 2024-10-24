import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Mic, FileText, Brain, Clock, CheckCircle } from "lucide-react"

const Login: React.FC = () => {


  return (
    <>
    <div className="flex flex-col w-screen min-h-screen bg-background text-foreground">
    <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Revoluciona tus sesiones de terapia
                </h1>
                <p className="mx-auto max-w-[700px] text-lg sm:text-xl/relaxed">
                  Transcripción en tiempo real, resúmenes automáticos y asistencia en diagnóstico para psicólogos.
                </p>
              </div>
              <div className="space-x-4">
                <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Prueba gratuita
                </Button>
                <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10">
                  Saber más
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Características principales</h2>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <Mic className="w-12 h-12 text-primary mb-4" />
                  <CardTitle className="text-2xl">Transcripción en tiempo real</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Convierte el diálogo de la sesión en texto al instante, permitiéndote concentrarte en tu paciente.</p>
                </CardContent>
              </Card>
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <FileText className="w-12 h-12 text-primary mb-4" />
                  <CardTitle className="text-2xl">Resúmenes automáticos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Genera resúmenes concisos de cada sesión, destacando los puntos clave y temas importantes.</p>
                </CardContent>
              </Card>
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <Brain className="w-12 h-12 text-primary mb-4" />
                  <CardTitle className="text-2xl">Asistencia en diagnóstico</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Utiliza IA avanzada para sugerir posibles diagnósticos basados en el contenido de la sesión.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Beneficios para tu práctica</h2>
                <ul className="grid gap-4">
                  {[
                    "Ahorra tiempo en la toma de notas y transcripción",
                    "Mejora la precisión de tus registros",
                    "Obtén insights valiosos con el análisis de IA",
                    "Aumenta la eficiencia de tus sesiones"
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="text-primary flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center">
                <img
                  alt="Beneficios de PsicoTranscribe"
                  className="aspect-video rounded-xl object-cover object-center overflow-hidden"
                  height="310"
                  src="/placeholder.svg?height=310&width=550"
                  width="550"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Lo que dicen nuestros usuarios</h2>
                <p className="mx-auto max-w-[900px] text-muted-foreground text-lg sm:text-xl/relaxed">
                  "PsicoTranscribe ha transformado mi práctica. Ahora puedo concentrarme completamente en mis pacientes,
                  sabiendo que cada detalle importante será capturado y analizado. Es como tener un asistente siempre presente."
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <img
                  alt="Avatar"
                  className="rounded-full"
                  height="40"
                  src="/placeholder.svg?height=40&width=40"
                  style={{
                    aspectRatio: "40/40",
                    objectFit: "cover",
                  }}
                  width="40"
                />
                <div className="text-left">
                  <p className="text-sm font-medium">Dra. María Rodríguez</p>
                  <p className="text-sm text-muted-foreground">Psicóloga Clínica</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Planes y precios</h2>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              {[
                {
                  title: "Básico",
                  description: "Para profesionales independientes",
                  price: "$29/mes",
                  features: [
                    "Hasta 20 horas de transcripción al mes",
                    "Resúmenes automáticos",
                    "Soporte por email"
                  ]
                },
                {
                  title: "Pro",
                  description: "Para clínicas pequeñas",
                  price: "$79/mes",
                  features: [
                    "Hasta 50 horas de transcripción al mes",
                    "Resúmenes y análisis avanzados",
                    "Asistencia en diagnóstico",
                    "Soporte prioritario"
                  ]
                },
                {
                  title: "Empresarial",
                  description: "Para grandes instituciones",
                  price: "Personalizado",
                  features: [
                    "Horas ilimitadas de transcripción",
                    "Integración con sistemas existentes",
                    "Funciones personalizadas",
                    "Soporte 24/7"
                  ]
                }
              ].map((plan, index) => (
                <Card key={index} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{plan.title}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-4xl font-bold mb-4">{plan.price}</p>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  {/* <CardFooter>
                    <Button className="w-full">{plan.title === "Empresarial" ? "Contactar ventas" : "Empezar ahora"}</Button>
                  </CardFooter> */}
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      </div>
    </>
  );
};

export default Login;
