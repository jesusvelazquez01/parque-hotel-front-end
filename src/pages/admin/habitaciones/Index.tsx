// src/pages/admin/habitaciones/index.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type Habitacion = {
  id: number;
  numero: string;
  tipo: string;
  precio: number;
  estado: 'disponible' | 'ocupada' | 'mantenimiento';
};

const HabitacionesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de ejemplo - reemplazar con llamada a API
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([
    { id: 1, numero: '101', tipo: 'Individual', precio: 100, estado: 'disponible' },
    { id: 2, numero: '102', tipo: 'Doble', precio: 150, estado: 'ocupada' },
    { id: 3, numero: '201', tipo: 'Suite', precio: 250, estado: 'disponible' },
  ]);

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta habitación?')) {
      setHabitaciones(habitaciones.filter(h => h.id !== id));
      // Aquí iría la llamada a la API para eliminar
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'disponible': return 'bg-green-100 text-green-800';
      case 'ocupada': return 'bg-red-100 text-red-800';
      case 'mantenimiento': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredHabitaciones = habitaciones.filter(habitacion => 
    Object.values(habitacion).some(
      value => value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Habitaciones</h1>
        <Button onClick={() => navigate('/admin/habitaciones/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Habitación
        </Button>
      </div>

      <div className="flex items-center py-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar habitaciones..."
            className="pl-8 sm:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHabitaciones.map((habitacion) => (
              <TableRow key={habitacion.id}>
                <TableCell className="font-medium">{habitacion.numero}</TableCell>
                <TableCell>{habitacion.tipo}</TableCell>
                <TableCell>${habitacion.precio}</TableCell>
                <TableCell>
                  <Badge className={getEstadoColor(habitacion.estado)}>
                    {habitacion.estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/admin/habitaciones/edit/${habitacion.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(habitacion.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default HabitacionesPage;