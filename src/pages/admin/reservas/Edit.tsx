import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ReservasEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [fechaEntrada, setFechaEntrada] = useState<Date>();
  const [fechaSalida, setFechaSalida] = useState<Date>();
  const [formData, setFormData] = useState({
    pasajeroId: '',
    habitacionId: '',
    estado: 'pendiente',
  });

  useEffect(() => {
    // Cargar datos de la reserva
    const reservaEjemplo = {
      pasajeroId: '1',
      habitacionId: '1',
      estado: 'confirmada',
    };
    setFormData(reservaEjemplo);
    setFechaEntrada(new Date(2024, 10, 15));
    setFechaSalida(new Date(2024, 10, 18));
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Actualizando reserva:', { ...formData, fechaEntrada, fechaSalida });
    toast.success('Reserva actualizada exitosamente');
    navigate('/admin/reservas');
  };

  return (
    <div className="space-y-6 p-6">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <div>
        <h1 className="text-2xl font-bold">Editar Reserva #{id}</h1>
        <p className="text-gray-500 mt-1">Actualiza la información de la reserva</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Pasajero *</Label>
            <Select value={formData.pasajeroId} onValueChange={(value) => setFormData(prev => ({ ...prev, pasajeroId: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Juan Pérez</SelectItem>
                <SelectItem value="2">María González</SelectItem>
                <SelectItem value="3">Carlos Rodríguez</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Habitación *</Label>
            <Select value={formData.habitacionId} onValueChange={(value) => setFormData(prev => ({ ...prev, habitacionId: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">101 - Individual</SelectItem>
                <SelectItem value="2">102 - Doble</SelectItem>
                <SelectItem value="3">201 - Suite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha de Entrada *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !fechaEntrada && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaEntrada ? format(fechaEntrada, 'PPP', { locale: es }) : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={fechaEntrada} onSelect={setFechaEntrada} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Fecha de Salida *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !fechaSalida && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaSalida ? format(fechaSalida, 'PPP', { locale: es }) : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={fechaSalida} onSelect={setFechaSalida} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={formData.estado} onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/reservas')}>
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReservasEdit;
