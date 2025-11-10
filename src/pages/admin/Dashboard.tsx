import { useNavigate } from 'react-router-dom';
import { Users, Bed, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Pasajeros',
      value: '3',
      description: 'Clientes registrados',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      route: '/admin/pasajeros'
    },
    {
      title: 'Habitaciones',
      value: '3',
      description: '2 disponibles, 1 ocupada',
      icon: Bed,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      route: '/admin/habitaciones'
    },
    {
      title: 'Reservas',
      value: '3',
      description: '1 confirmada, 1 pendiente, 1 completada',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      route: '/admin/reservas'
    },
    {
      title: 'Ingresos',
      value: '$17,000',
      description: 'Total de reservas',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      route: '/admin/reservas'
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="text-gray-500 mt-2">Bienvenido al sistema de gestión hotelera</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(stat.route)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestión de Pasajeros
            </CardTitle>
            <CardDescription>
              Administra los clientes y huéspedes del hotel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full" 
              onClick={() => navigate('/admin/pasajeros')}
            >
              Ver Pasajeros
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/admin/pasajeros/create')}
            >
              Nuevo Pasajero
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Gestión de Habitaciones
            </CardTitle>
            <CardDescription>
              Administra las habitaciones del hotel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full"
              onClick={() => navigate('/admin/habitaciones')}
            >
              Ver Habitaciones
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/admin/habitaciones/create')}
            >
              Nueva Habitación
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Gestión de Reservas
            </CardTitle>
            <CardDescription>
              Administra las reservas del hotel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full"
              onClick={() => navigate('/admin/reservas')}
            >
              Ver Reservas
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/admin/reservas/create')}
            >
              Nueva Reserva
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
