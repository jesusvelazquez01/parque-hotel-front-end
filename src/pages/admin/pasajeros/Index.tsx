import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type Pasajero = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  documento: string;
  estado: 'activo' | 'inactivo';
};

const PasajerosIndex = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de ejemplo - reemplazar con llamada a API
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([
    { 
      id: 1, 
      nombre: 'Juan', 
      apellido: 'Pérez', 
      email: 'juan.perez@email.com', 
      telefono: '+52 555 1234', 
      documento: 'ABC123456',
      estado: 'activo' 
    },
    { 
      id: 2, 
      nombre: 'María', 
      apellido: 'González', 
      email: 'maria.gonzalez@email.com', 
      telefono: '+52 555 5678', 
      documento: 'DEF789012',
      estado: 'activo' 
    },
    { 
      id: 3, 
      nombre: 'Carlos', 
      apellido: 'Rodríguez', 
      email: 'carlos.rodriguez@email.com', 
      telefono: '+52 555 9012', 
      documento: 'GHI345678',
      estado: 'inactivo' 
    },
  ]);

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este pasajero?')) {
      setPasajeros(pasajeros.filter(p => p.id !== id));
      // Aquí iría la llamada a la API para eliminar
    }
  };

  const getEstadoColor = (estado: string) => {
    return estado === 'activo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const filteredPasajeros = pasajeros.filter(pasajero => 
    Object.values(pasajero).some(
      value => value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Pasajeros</h1>
          <p className="text-gray-500 mt-1">Administra los clientes y huéspedes del hotel</p>
        </div>
        <Button onClick={() => navigate('/admin/pasajeros/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Pasajero
        </Button>
      </div>

      <div className="flex items-center py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, email, documento..."
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
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPasajeros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  <User className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p>No se encontraron pasajeros</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredPasajeros.map((pasajero) => (
                <TableRow key={pasajero.id}>
                  <TableCell className="font-medium">
                    {pasajero.nombre} {pasajero.apellido}
                  </TableCell>
                  <TableCell>{pasajero.email}</TableCell>
                  <TableCell>{pasajero.telefono}</TableCell>
                  <TableCell>{pasajero.documento}</TableCell>
                  <TableCell>
                    <Badge className={getEstadoColor(pasajero.estado)}>
                      {pasajero.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/admin/pasajeros/edit/${pasajero.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(pasajero.id)}
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

export default PasajerosIndex;
