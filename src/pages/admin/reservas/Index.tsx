import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Reserva = {
  id: number;
  pasajero: string;
  habitacion: string;
  fechaEntrada: Date;
  fechaSalida: Date;
  estado: 'confirmada' | 'pendiente' | 'cancelada' | 'completada';
  total: number;
};

const ReservasIndex = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de ejemplo - reemplazar con llamada a API
  const [reservas, setReservas] = useState<Reserva[]>([
    { 
      id: 1, 
      pasajero: 'Juan Pérez', 
      habitacion: '101', 
      fechaEntrada: new Date(2024, 10, 15),
      fechaSalida: new Date(2024, 10, 18),
      estado: 'confirmada',
      total: 4500
    },
    { 
      id: 2, 
      pasajero: 'María González', 
      habitacion: '102', 
      fechaEntrada: new Date(2024, 10, 20),
      fechaSalida: new Date(2024, 10, 25),
      estado: 'pendiente',
      total: 7500
    },
    { 
      id: 3, 
      pasajero: 'Carlos Rodríguez', 
      habitacion: '201', 
      fechaEntrada: new Date(2024, 10, 10),
      fechaSalida: new Date(2024, 10, 12),
      estado: 'completada',
      total: 5000
    },
  ]);

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de cancelar esta reserva?')) {
      setReservas(reservas.filter(r => r.id !== id));
      // Aquí iría la llamada a la API para eliminar
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      case 'completada': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReservas = reservas.filter(reserva => 
    Object.values(reserva).some(
      value => value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Reservas</h1>
          <p className="text-gray-500 mt-1">Administra las reservas del hotel</p>
        </div>
        <Button onClick={() => navigate('/admin/reservas/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Reserva
        </Button>
      </div>

      <div className="flex items-center py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por pasajero, habitación..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Pasajero</TableHead>
              <TableHead>Habitación</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Salida</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReservas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p>No se encontraron reservas</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredReservas.map((reserva) => (
                <TableRow key={reserva.id}>
                  <TableCell className="font-medium">#{reserva.id}</TableCell>
                  <TableCell>{reserva.pasajero}</TableCell>
                  <TableCell>{reserva.habitacion}</TableCell>
                  <TableCell>
                    {format(reserva.fechaEntrada, 'dd MMM yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    {format(reserva.fechaSalida, 'dd MMM yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>${reserva.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getEstadoColor(reserva.estado)}>
                      {reserva.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/admin/reservas/edit/${reserva.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(reserva.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReservasIndex;
