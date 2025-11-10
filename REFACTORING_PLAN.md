# Plan de Refactorización del Panel Administrativo

## 📋 Objetivo
Organizar el panel administrativo enfocándose en 3 funcionalidades principales:
- **Pasajeros** (Clientes/Huéspedes)
- **Reservas** (Bookings)
- **Habitaciones** (Rooms)

## 🗂️ Estructura Actual vs Propuesta

### Estructura Actual en `src/pages/admin/`
```
pages/admin/
├── Dashboard.tsx          ❌ Archivo suelto
├── Clientes.tsx           ❌ Archivo suelto (duplicado con pasajeros)
├── Habitaciones.tsx       ❌ Archivo suelto (duplicado)
├── Reservas.tsx           ❌ Archivo suelto (duplicado)
├── habitaciones/
│   ├── index.tsx         ✅ Lista de habitaciones
│   ├── create.tsx        ✅ Crear habitación
│   └── edit.tsx          ✅ Editar habitación
├── pasajeros/
│   ├── index.tsx         ✅ Lista de pasajeros
│   ├── create.tsx        ✅ Crear pasajero
│   └── edit.tsx          ✅ Editar pasajero
└── reservas/
    ├── index.tsx         ✅ Lista de reservas
    ├── create.tsx        ✅ Crear reserva
    └── edit.tsx          ✅ Editar reserva
```

### Estructura Propuesta (LIMPIA)
```
pages/admin/
├── Dashboard.tsx          ✅ Panel principal con métricas
├── pasajeros/
│   ├── index.tsx         ✅ Lista de pasajeros
│   ├── create.tsx        ✅ Formulario nuevo pasajero
│   └── edit.tsx          ✅ Formulario editar pasajero
├── habitaciones/
│   ├── index.tsx         ✅ Lista de habitaciones
│   ├── create.tsx        ✅ Formulario nueva habitación
│   └── edit.tsx          ✅ Formulario editar habitación
└── reservas/
    ├── index.tsx         ✅ Lista de reservas
    ├── create.tsx        ✅ Formulario nueva reserva
    └── edit.tsx          ✅ Formulario editar reserva
```

## 🔧 Componentes Reutilizables

### Componentes de `components/admin/` que SÍ usaremos:

#### Para el Layout:
- ✅ `AdminLayout.tsx` - Layout principal del admin
- ✅ `layout/AdminHeader.tsx` - Header del panel
- ✅ `layout/AdminSidebar.tsx` - Sidebar de navegación

#### Para Habitaciones:
- ✅ `AddRoomDialog.tsx` - Dialog para agregar habitación
- ✅ `RoomManagement.tsx` - Gestión de habitaciones
- ✅ `RoomSelector.tsx` - Selector de habitaciones
- ✅ `RoomDetailsView.tsx` - Vista de detalles
- ✅ `RoomImagesManager.tsx` - Gestor de imágenes
- ✅ `RoomAvailabilityCalendar.tsx` - Calendario de disponibilidad

#### Para Reservas:
- ✅ `AddBookingDialog.tsx` - Dialog para agregar reserva
- ✅ `BookingManagement.tsx` - Gestión de reservas
- ✅ `BookingForm.tsx` - Formulario de reserva
- ✅ `BookingView.tsx` - Vista de reserva
- ✅ `ViewBookingDialog.tsx` - Dialog para ver reserva
- ✅ `CheckoutDialog.tsx` - Dialog de checkout

#### Para Pasajeros:
- ✅ `CustomerManagement.tsx` - Gestión de clientes/pasajeros

#### Componentes Generales:
- ✅ `AdminDashboardOverview.tsx` - Vista general del dashboard
- ✅ `ReceiptViewer.tsx` - Visor de recibos

### Componentes que NO usaremos (pueden eliminarse o archivarse):
- ❌ `AddEmployeeDialog.tsx` - No gestionamos empleados
- ❌ `ContactManagement.tsx` - No es parte del core
- ❌ `GalleryManagement.tsx` - No es prioritario
- ❌ `OfferForm.tsx`, `OfferPreview.tsx`, `OfferStatus.tsx`, `OffersManagement.tsx` - No gestionamos ofertas
- ❌ `RefundRequestsManagement.tsx` - No es prioritario
- ❌ `TableManagement.tsx` - No gestionamos mesas
- ❌ `UploadPermissionManagement.tsx` - No es necesario

## 📁 Carpetas de Componentes NO Utilizadas

### Carpetas a ARCHIVAR o ELIMINAR:
```
components/
├── superadmin/    ❌ NO SE USA - 0 importaciones encontradas
├── customer/      ❌ NO SE USA - 0 importaciones encontradas
├── employee/      ❌ NO SE USA - 0 importaciones encontradas
└── common/        ⚠️  REVISAR - Puede tener componentes útiles
```

## 🎯 Acciones a Realizar

### Paso 1: Limpiar archivos duplicados en `pages/admin/`
```bash
# Eliminar estos archivos (ya existen en carpetas organizadas):
- Clientes.tsx
- Habitaciones.tsx
- Reservas.tsx
```

### Paso 2: Actualizar `App.tsx` con rutas limpias
```tsx
<Route path="/admin" element={<AdminLayout onLogout={handleLogout} />}>
  <Route index element={<Dashboard />} />
  
  {/* Pasajeros */}
  <Route path="pasajeros">
    <Route index element={<PasajerosIndex />} />
    <Route path="create" element={<PasajerosCreate />} />
    <Route path="edit/:id" element={<PasajerosEdit />} />
  </Route>
  
  {/* Habitaciones */}
  <Route path="habitaciones">
    <Route index element={<HabitacionesIndex />} />
    <Route path="create" element={<HabitacionesCreate />} />
    <Route path="edit/:id" element={<HabitacionesEdit />} />
  </Route>
  
  {/* Reservas */}
  <Route path="reservas">
    <Route index element={<ReservasIndex />} />
    <Route path="create" element={<ReservasCreate />} />
    <Route path="edit/:id" element={<ReservasEdit />} />
  </Route>
</Route>
```

### Paso 3: Crear carpeta `components/shared/` para componentes reutilizables
```
components/shared/
├── DataTable.tsx          # Tabla genérica para listar datos
├── SearchBar.tsx          # Barra de búsqueda reutilizable
├── StatusBadge.tsx        # Badge de estados
├── ConfirmDialog.tsx      # Dialog de confirmación
├── FormField.tsx          # Campo de formulario genérico
└── EmptyState.tsx         # Estado vacío genérico
```

### Paso 4: Organizar componentes de `components/admin/`
```
components/admin/
├── layout/
│   ├── AdminLayout.tsx
│   ├── AdminHeader.tsx
│   └── AdminSidebar.tsx
├── pasajeros/
│   └── CustomerManagement.tsx
├── habitaciones/
│   ├── AddRoomDialog.tsx
│   ├── RoomManagement.tsx
│   ├── RoomSelector.tsx
│   ├── RoomDetailsView.tsx
│   ├── RoomImagesManager.tsx
│   └── RoomAvailabilityCalendar.tsx
├── reservas/
│   ├── AddBookingDialog.tsx
│   ├── BookingManagement.tsx
│   ├── BookingForm.tsx
│   ├── BookingView.tsx
│   ├── ViewBookingDialog.tsx
│   └── CheckoutDialog.tsx
└── dashboard/
    ├── AdminDashboardOverview.tsx
    └── ReceiptViewer.tsx
```

## 🚀 Beneficios de esta Refactorización

1. **Claridad**: Estructura clara y fácil de navegar
2. **Mantenibilidad**: Código organizado por funcionalidad
3. **Escalabilidad**: Fácil agregar nuevas características
4. **Reutilización**: Componentes compartidos evitan duplicación
5. **Performance**: Menos código innecesario cargado

## ⚠️ Precauciones

- ✅ NO tocar `pages/` que ya funcionan (inicio, contacto, restaurante, etc.)
- ✅ Mantener componentes de `components/ui/` (shadcn)
- ✅ Mantener componentes de `components/layout/` (Layout principal)
- ✅ Mantener componentes de `components/auth/` (autenticación)

## 📝 Checklist de Implementación

- [ ] Eliminar archivos duplicados en `pages/admin/`
- [ ] Actualizar rutas en `App.tsx`
- [ ] Crear carpeta `components/shared/`
- [ ] Reorganizar componentes de `components/admin/`
- [ ] Archivar carpetas no utilizadas (superadmin, customer, employee)
- [ ] Actualizar imports en todos los archivos afectados
- [ ] Probar navegación completa del panel admin
- [ ] Verificar que no haya errores de importación
- [ ] Documentar componentes reutilizables

## 🎨 Próximas Mejoras (Opcional)

1. Conectar con API real
2. Agregar validación de formularios con Zod
3. Implementar paginación en listados
4. Agregar filtros avanzados
5. Implementar exportación de datos (Excel/PDF)
6. Agregar gráficos y estadísticas en Dashboard
