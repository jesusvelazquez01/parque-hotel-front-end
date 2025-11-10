
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const employeeSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

export function AddEmployeeDialog() {
  const { register } = useAuth();
  const [open, setOpen] = React.useState(false);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "",
    },
  });

  const onSubmit = async (values: EmployeeFormValues) => {
    try {
      // First register the employee in auth system
      await register(values.email, values.password, values.firstName, values.lastName, "employee");

      // Then add employee details to employees table
      const { error: employeeError } = await supabase
        .from('employees')
        .insert([
          {
            name: `${values.firstName} ${values.lastName}`,
            email: values.email,
            role: values.role,
            access_level: 'employee',
            status: 'Active'
          }
        ]);

      if (employeeError) throw employeeError;

      // Add employee credentials to employee_auth table
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('email', values.email)
        .single();

      if (employeeData) {
        const { error: authError } = await supabase
          .from('employee_auth')
          .insert([
            {
              employee_id: employeeData.id,
              password: values.password
            }
          ]);

        if (authError) throw authError;
      }

      setOpen(false);
      toast.success('Employee registered successfully');
      form.reset();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register employee');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight">
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-hotel-slate border-hotel-midnight text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Register New Employee</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        className="bg-hotel-midnight border-hotel-slate text-white focus:ring-hotel-gold focus:border-hotel-gold"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        className="bg-hotel-midnight border-hotel-slate text-white focus:ring-hotel-gold focus:border-hotel-gold"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Role/Position</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Receptionist, Housekeeper"
                      className="bg-hotel-midnight border-hotel-slate text-white focus:ring-hotel-gold focus:border-hotel-gold"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@example.com"
                      className="bg-hotel-midnight border-hotel-slate text-white focus:ring-hotel-gold focus:border-hotel-gold"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-hotel-midnight border-hotel-slate text-white focus:ring-hotel-gold focus:border-hotel-gold"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight"
            >
              Register Employee
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
