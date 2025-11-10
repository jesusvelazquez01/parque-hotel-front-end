import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Loader2, UserRound, Building, User, Users } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  email: z.string().email('Por favor ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("huesped");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (activeTab === "employee") {
        // Lógica de inicio de sesión de empleado
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('id, email, name, role')
          .eq('email', values.email)
          .single();
        
        if (employeeError || !employeeData) {
          toast({
            title: "Error de inicio de sesión",
            description: "No se encontró un empleado con este correo electrónico",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        
        // Verificar credenciales del empleado
        const { data: authData, error: authError } = await supabase
          .from('employee_auth')
          .select('*')
          .eq('employee_id', employeeData.id)
          .single();
        
        if (authError || !authData) {
          toast({
            title: "Error de autenticación",
            description: "Credenciales inválidas",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        
        // Verificar contraseña
        if (authData.password !== values.password) {
          toast({
            title: "Error de inicio de sesión",
            description: "Contraseña incorrecta",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        
        // Almacenar datos del empleado en localStorage
        localStorage.setItem('employee', JSON.stringify({
          id: employeeData.id,
          name: employeeData.name,
          email: employeeData.email,
          role: employeeData.role
        }));
        
        toast({
          title: "¡Éxito!",
          description: "¡Inicio de sesión exitoso!",
          variant: "default"
        });
        
        // Navigate to employee dashboard
        navigate('/employee-dashboard');
      } 
      else if (activeTab === "admin") {
        // Admin login
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          toast({
            title: "Error de inicio de sesión",
            description: error.message || "Ocurrió un error al iniciar sesión",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }

        // Refresh user data to get role
        await refreshUser();
        
        toast({
          title: "¡Éxito!",
          description: "¡Inicio de sesión exitoso!",
          variant: "default"
        });
        navigate('/admin');
      }
      else {
        // Regular customer login
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          toast({
            title: "Error de inicio de sesión",
            description: error.message || "Ocurrió un error al iniciar sesión",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }

        // Refresh user data
        await refreshUser();
        
        toast({
          title: "¡Éxito!",
          description: "¡Inicio de sesión exitoso!",
          variant: "default"
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Ocurrió un error durante el inicio de sesión',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Maps for icons and placeholders based on the active tab
  const icons = {
    customer: <User className="text-hotel-verde-oscuro" />,
    admin: <UserRound className="text-hotel-verde-oscuro" />,
    employee: <Building className="text-hotel-verde-oscuro" />
  };

  const placeholders = {
    customer: "huesped@ejemplo.com",
    admin: "admin@parquehotel.com",
    employee: "empleado@parquehotel.com"
  };

  const titles = {
    customer: "Inicio de Sesión de Huésped",
    admin: "Panel de Administración",
    employee: "Acceso de Empleado"
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-hotel-verde-claro/20">
      <Tabs 
        value={activeTab}
        className="w-full"
        onValueChange={(value) => setActiveTab(value as "huesped" | "empleado" | "admin")}
      >
        <TabsList className="grid w-full grid-cols-3 bg-hotel-verde-claro/20 mb-6">
          <TabsTrigger value="huesped" className="data-[state=active]:bg-hotel-verde-oscuro data-[state=active]:text-white">
            <User className="w-4 h-4 mr-2" />
            Huésped
          </TabsTrigger>
          <TabsTrigger value="empleado" className="data-[state=active]:bg-hotel-verde-oscuro data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Empleado
          </TabsTrigger>
          <TabsTrigger value="admin" className="data-[state=active]:bg-hotel-verde-oscuro data-[state=active]:text-white">
            <Building className="w-4 h-4 mr-2" />
            Admin
          </TabsTrigger>
        </TabsList>

        <TabsContent value="huesped">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-hotel-gris">Correo Electrónico</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-hotel-verde-oscuro" />
                        <Input
                          placeholder="Ingresa tu correo electrónico"
                          {...field}
                          className="pl-10 border-hotel-verde-oscuro/30 focus-visible:ring-hotel-verde-oscuro"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-hotel-gris">Contraseña</FormLabel>
                      <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-hotel-verde-oscuro hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Ingresa tu contraseña"
                          {...field}
                          className="pr-10 border-hotel-verde-oscuro/30 focus-visible:ring-hotel-verde-oscuro"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-hotel-verde-oscuro/70 hover:text-hotel-verde-oscuro"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-hotel-verde-oscuro hover:bg-hotel-verde-medio text-white font-medium transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              <div className="text-center text-sm text-hotel-gris">
                ¿No tienes una cuenta?{' '}
                <Link
                  to="/register"
                  className="font-medium text-hotel-verde-oscuro hover:underline"
                >
                  Regístrate
                </Link>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="empleado">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-hotel-gris">Correo Electrónico</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-hotel-verde-oscuro" />
                        <Input
                          placeholder="Ingresa tu correo electrónico"
                          {...field}
                          className="pl-10 border-hotel-verde-oscuro/30 focus-visible:ring-hotel-verde-oscuro"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-hotel-gris">Contraseña</FormLabel>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Ingresa tu contraseña"
                          {...field}
                          className="pr-10 border-hotel-verde-oscuro/30 focus-visible:ring-hotel-verde-oscuro"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-hotel-verde-oscuro/70 hover:text-hotel-verde-oscuro"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-hotel-verde-oscuro hover:bg-hotel-verde-medio text-white font-medium transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="admin">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-hotel-gris">Correo Electrónico</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-hotel-verde-oscuro" />
                        <Input
                          placeholder="Ingresa tu correo electrónico"
                          {...field}
                          className="pl-10 border-hotel-verde-oscuro/30 focus-visible:ring-hotel-verde-oscuro"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-hotel-gris">Contraseña</FormLabel>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Ingresa tu contraseña"
                          {...field}
                          className="pr-10 border-hotel-verde-oscuro/30 focus-visible:ring-hotel-verde-oscuro"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-hotel-verde-oscuro/70 hover:text-hotel-verde-oscuro"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-hotel-verde-oscuro hover:bg-hotel-verde-medio text-white font-medium transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoginForm;
