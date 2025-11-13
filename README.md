# 🏨 Parque Hotel - Sistema de Gestión Hotelera

Sistema completo de gestión hotelera desarrollado con React, TypeScript y Tailwind CSS. Incluye sitio web público y panel administrativo para la gestión integral de reservas, habitaciones y clientes.

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.11-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF?style=flat&logo=vite)](https://vitejs.dev/)

**URL del Proyecto**: https://lovable.dev/projects/cf07259a-d28a-4837-8867-c70061b8b19c

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#️-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Uso](#-uso)
- [Rutas de la Aplicación](#️-rutas-de-la-aplicación)
- [Componentes Principales](#-componentes-principales)
- [Sistema de Autenticación](#-sistema-de-autenticación)
- [Panel Administrativo](#️-panel-administrativo)
- [Tipos de Datos](#-tipos-de-datos)
- [Estado y TODOs](#️-estado-y-todos)
- [Scripts Disponibles](#-scripts-disponibles)
- [Despliegue](#-despliegue)
- [Editar el Código](#-editar-el-código)

---

## ✨ Características

### 🌐 Sitio Web Público

- **Página de Inicio**: Hero slider con 13 imágenes, características, galería, testimonios
- **Sobre Nosotros**: Historia del hotel, misión, visión y valores
- **Habitaciones**: Catálogo con 3 categorías (Estándar, Superior, Suite Ejecutiva)
- **Restaurante**: Información de servicios gastronómicos
- **Contacto**: Formulario de contacto integrado con EmailJS
- **Sistema de Reservas**: Formulario completo con calendario y selección de habitaciones
- **Diseño Responsivo**: Optimizado para móviles, tablets y desktop

### 🔐 Sistema de Autenticación

- Login con validación de credenciales
- Registro de nuevos usuarios
- Recuperación de contraseña
- Roles de usuario: `customer`, `admin`, `employee`, `superadmin`
- Rutas protegidas con redirección automática

### 📊 Panel Administrativo

#### Gestión de Pasajeros
- ✅ Lista con búsqueda y filtros
- ✅ Crear nuevo pasajero
- ✅ Editar información
- ✅ Eliminar registros
- 📋 Campos: Nombre, Apellido, Email, Teléfono, Documento, Estado

#### Gestión de Habitaciones
- ✅ Lista con estados y disponibilidad
- ✅ Crear nueva habitación
- ✅ Editar detalles
- ✅ Actualizar estado
- ✅ Gestión de amenidades
- 📋 Campos: Número, Tipo, Precio, Capacidad, Descripción, Amenidades

#### Gestión de Reservas
- ✅ Lista con fechas y estados
- ✅ Crear nueva reserva
- ✅ Editar reserva existente
- ✅ Calendario integrado
- ✅ Cálculo automático de precios
- ✅ Gestión de check-in/check-out
- 📋 Campos: Cliente, Habitación, Fechas, Huéspedes, Estado de pago

#### Dashboard
- Vista general del sistema
- Métricas y estadísticas (en desarrollo)
- Accesos rápidos a funcionalidades

---

## 🛠️ Tecnologías

### Core
- **React 18.3.1** - Biblioteca UI
- **TypeScript 5.5.3** - Tipado estático
- **Vite 5.4.1** - Build tool y dev server
- **React Router DOM 6.26.2** - Enrutamiento SPA

### UI/Diseño
- **Tailwind CSS 3.4.11** - Framework CSS utility-first
- **shadcn/ui** - Componentes basados en Radix UI
- **Lucide React 0.462.0** - Iconos
- **Framer Motion 11.18.2** - Animaciones
- **Embla Carousel** - Carruseles y sliders

### Formularios y Validación
- **React Hook Form 7.53.0** - Gestión de formularios
- **Zod 3.23.8** - Validación de esquemas
- **@hookform/resolvers 3.9.0** - Integración Zod + React Hook Form

### Estado y Datos
- **TanStack Query 5.56.2** - Server state management
- **Context API** - Estado global (AuthContext)

### Utilidades
- **date-fns 3.6.0** - Manipulación de fechas
- **clsx** + **tailwind-merge** - Manejo de clases CSS
- **html2canvas** - Captura de pantallas
- **jsPDF** - Generación de PDFs
- **qrcode** - Generación de códigos QR
- **@emailjs/browser** - Envío de emails

### Backend (Planificado)
- **Backend Java** - API REST (pendiente integración)
- **Supabase** - Base de datos (actualmente mock)

---

## 📁 Estructura del Proyecto

```
parque-hotel/
├── public/                      # Archivos públicos
│   └── imagenes-hotel/         # Imágenes del hotel
├── src/
│   ├── @types/                 # Declaraciones de tipos globales
│   ├── assets/                 # Recursos estáticos
│   ├── components/             # Componentes React
│   │   ├── ui/                # shadcn/ui components
│   │   ├── admin/             # Componentes administrativos
│   │   ├── auth/              # Componentes de autenticación
│   │   ├── layout/            # Layouts (Layout, AdminLayout)
│   │   ├── gallery/           # Componentes de galería
│   │   └── slider/            # Componentes de sliders
│   ├── context/               # Context API
│   │   └── AuthContext.tsx    # Contexto de autenticación
│   ├── hooks/                 # Custom hooks
│   │   └── useRooms.ts        # Hook para gestión de habitaciones
│   ├── integrations/          # Integraciones externas
│   │   └── supabase/          # Cliente Supabase (mock)
│   ├── lib/                   # Utilidades y configuración
│   │   └── utils.ts           # Funciones auxiliares
│   ├── pages/                 # Páginas de la aplicación
│   │   ├── admin/             # Panel administrativo
│   │   │   ├── Dashboard.tsx
│   │   │   ├── pasajeros/
│   │   │   │   ├── Index.tsx  # Lista de pasajeros
│   │   │   │   ├── Create.tsx # Crear pasajero
│   │   │   │   └── Edit.tsx   # Editar pasajero
│   │   │   ├── habitaciones/
│   │   │   │   ├── Index.tsx  # Lista de habitaciones
│   │   │   │   ├── Create.tsx # Crear habitación
│   │   │   │   └── Edit.tsx   # Editar habitación
│   │   │   └── reservas/
│   │   │       ├── Index.tsx  # Lista de reservas
│   │   │       ├── Create.tsx # Crear reserva
│   │   │       └── Edit.tsx   # Editar reserva
│   │   ├── auth/              # Autenticación
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   └── ResetPassword.tsx
│   │   ├── contacto/          # Página de contacto
│   │   ├── habitaciones/      # Catálogo público
│   │   ├── inicio/            # Página de inicio
│   │   ├── restaurante/       # Información restaurante
│   │   ├── sobre-nosotros/    # Sobre nosotros
│   │   └── NotFound.tsx       # Página 404
│   ├── types/                 # Definiciones TypeScript
│   │   ├── booking.ts         # Tipos de reservas y habitaciones
│   │   ├── promo.ts           # Tipos de promociones
│   │   ├── roomImages.ts      # Tipos de imágenes
│   │   └── testimonial.ts     # Tipos de testimonios
│   ├── utils/                 # Funciones auxiliares
│   ├── App.tsx                # Componente principal
│   ├── main.tsx               # Punto de entrada
│   └── index.css              # Estilos globales
├── .gitignore
├── components.json             # Configuración shadcn/ui
├── eslint.config.js           # Configuración ESLint
├── index.html                 # HTML principal
├── package.json               # Dependencias
├── postcss.config.js          # Configuración PostCSS
├── tailwind.config.ts         # Configuración Tailwind CSS
├── tsconfig.json              # Configuración TypeScript
├── vite.config.ts             # Configuración Vite
└── README.md                  # Este archivo
```

---

## 🚀 Instalación

### Prerrequisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 o **yarn** >= 1.22.0

### Pasos

1. **Clonar el repositorio**

```bash
git clone https://github.com/jesusvelazquez01/reservas_mpeym.git
cd reservas_mpeym
```

2. **Instalar dependencias**

```bash
npm install
# o
yarn install
```

3. **Configurar variables de entorno** (opcional)

Crear archivo `.env` en la raíz:

```env
# Razorpay (Sistema de pagos)
VITE_RAZORPAY_KEY_ID=rzp_test_vTNA6I5tKnusw1

# EmailJS (Formulario de contacto)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# API Backend (cuando esté disponible)
VITE_API_URL=http://localhost:8080/api
```

4. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:8080`

---

## ⚙️ Configuración

### Tailwind CSS - Colores Personalizados

El proyecto utiliza una paleta de colores personalizada:

```typescript
hotel: {
  "verde-oscuro": "#1B4D3E",   // Verde bosque oscuro
  "verde-medio": "#3A7D44",    // Verde bosque medio
  "verde-claro": "#8FB996",    // Verde claro
  "beige": "#D4B483",          // Beige cálido
  "crema": "#F4EBD9",          // Crema suave
  "marron": "#8B5A2B",         // Marrón madera
  "gris": "#4A4A4A",           // Gris oscuro
  "blanco": "#FFFFFF"          // Blanco puro
}
```

### Vite - Configuración

- **Puerto**: 8080
- **Host**: "::" (soporta IPv4 e IPv6)
- **Alias**: `@/` apunta a `./src/`

---

## 📖 Uso

### Iniciar sesión como administrador

```typescript
// Credenciales de prueba (mock)
Email: admin@parquehotel.com
Password: admin123
```

### Navegación del sitio

- **Inicio**: Explorar el hotel y sus servicios
- **Habitaciones**: Ver catálogo y hacer reservas
- **Restaurante**: Información gastronómica
- **Contacto**: Enviar consultas

### Panel administrativo

Accede a `/admin` después de iniciar sesión:

1. **Dashboard**: Vista general
2. **Pasajeros**: CRUD de clientes
3. **Habitaciones**: CRUD de habitaciones
4. **Reservas**: CRUD de reservas

---

## 🗺️ Rutas de la Aplicación

### Rutas Públicas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `Inicio` | Página principal |
| `/sobre-nosotros` | `SobreNosotros` | Historia y valores |
| `/restaurante` | `Restaurante` | Servicios gastronómicos |
| `/habitaciones` | `Habitaciones` | Catálogo de habitaciones |
| `/contacto` | `Contacto` | Formulario de contacto |

### Rutas de Autenticación

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/iniciar-sesion` | `Login` | Inicio de sesión |
| `/registro` | `Register` | Registro de usuarios |
| `/recuperar-contrasena` | `ForgotPassword` | Recuperar contraseña |
| `/restablecer-contrasena` | `ResetPassword` | Resetear contraseña |

### Rutas Administrativas (Protegidas)

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/admin` | `Dashboard` | Panel principal |
| `/admin/pasajeros` | `PasajerosIndex` | Lista de pasajeros |
| `/admin/pasajeros/create` | `PasajerosCreate` | Nuevo pasajero |
| `/admin/pasajeros/edit/:id` | `PasajerosEdit` | Editar pasajero |
| `/admin/habitaciones` | `HabitacionesIndex` | Lista de habitaciones |
| `/admin/habitaciones/create` | `HabitacionesCreate` | Nueva habitación |
| `/admin/habitaciones/edit/:id` | `HabitacionesEdit` | Editar habitación |
| `/admin/reservas` | `ReservasIndex` | Lista de reservas |
| `/admin/reservas/create` | `ReservasCreate` | Nueva reserva |
| `/admin/reservas/edit/:id` | `ReservasEdit` | Editar reserva |

---

## 🧩 Componentes Principales

### Componentes UI (shadcn/ui)

- `Button`, `Input`, `Label`, `Textarea`
- `Select`, `Calendar`, `Popover`
- `Dialog`, `Alert Dialog`, `Toast`
- `Table`, `Badge`, `Avatar`
- `Card`, `Tabs`, `Accordion`
- `Dropdown Menu`, `Navigation Menu`
- Y muchos más...

### Componentes Personalizados

#### Layout
- `Layout` - Layout principal del sitio
- `AdminLayout` - Layout del panel administrativo
- `Header`, `Footer`, `Navbar`

#### Funcionalidades
- `BookingForm` - Formulario de reservas
- `RoomCard` - Tarjeta de habitación
- `TestimonialCard` - Tarjeta de testimonio
- `ContactForm` - Formulario de contacto
- `RoyalSlider` - Slider principal
- `GallerySection` - Galería de imágenes

#### Autenticación
- `ProtectedRoute` - Protección de rutas

---

## 🔐 Sistema de Autenticación

### Context: AuthContext

```typescript
interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}
```

### Roles de Usuario

```typescript
type UserRole = "customer" | "admin" | "employee" | "superadmin"
```

### Uso

```typescript
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useContext(AuthContext);
  
  // ...
}
```

---

## 🎛️ Panel Administrativo

### Dashboard

Vista general con métricas del sistema (en desarrollo).

### Gestión de Pasajeros

**Funcionalidades:**
- Listar todos los pasajeros
- Buscar por nombre, email o documento
- Crear nuevo pasajero
- Editar información existente
- Cambiar estado (activo/inactivo)
- Eliminar registros

**Campos:**
- Nombre, Apellido
- Email, Teléfono
- Tipo de documento, Número
- Estado

### Gestión de Habitaciones

**Funcionalidades:**
- Listar todas las habitaciones
- Filtrar por tipo o estado
- Crear nueva habitación
- Editar detalles
- Actualizar estado y disponibilidad
- Gestionar amenidades

**Campos:**
- Número de habitación
- Tipo (Estándar, Superior, Suite)
- Precio por noche
- Capacidad, Camas, Baños
- Descripción
- Amenidades (WiFi, TV, Minibar, etc.)
- Estado (disponible, ocupada, mantenimiento)

### Gestión de Reservas

**Funcionalidades:**
- Listar todas las reservas
- Filtrar por fecha, estado o cliente
- Crear nueva reserva
- Editar reserva existente
- Cambiar estado (pendiente, confirmada, check-in, check-out, cancelada)
- Calcular precios automáticamente
- Gestionar check-in/check-out

**Campos:**
- Cliente (selector)
- Habitación (selector con disponibilidad)
- Fecha de entrada/salida (calendario)
- Número de huéspedes (adultos/niños)
- Tipo de reserva (online/offline)
- Incluir desayuno
- Estado de la reserva
- Estado del pago
- Precio total

---

## 📊 Tipos de Datos

### Room (Habitación)

```typescript
interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  price_per_night: number;
  image_url: string;
  is_available: boolean;
  status: string;
  capacity: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  category?: string;
  category_type?: 'Royal Deluxe' | 'Royal Executive' | 'Royal Suite';
  breakfast_price?: number;
  created_at?: string;
  updated_at?: string;
}
```

### Booking (Reserva)

```typescript
interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_id?: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  adults?: number;
  children?: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  booking_type: 'online' | 'offline';
  with_breakfast: boolean;
  room?: Room;
  created_at?: string;
  updated_at?: string;
}
```

### ContactMessage (Mensaje de Contacto)

```typescript
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
}
```

---

## ⚠️ Estado y TODOs

### ✅ Completado

- [x] Estructura del proyecto
- [x] Componentes UI (shadcn/ui)
- [x] Sistema de rutas
- [x] Panel administrativo (CRUD completo)
- [x] Sistema de autenticación (mock)
- [x] Diseño responsivo
- [x] Gestión de habitaciones
- [x] Gestión de reservas
- [x] Gestión de pasajeros
- [x] Formularios con validación básica

### 🚧 En Desarrollo

#### Backend Integration
```typescript
// TODO: Reemplazar con llamadas al backend Java
// Archivos afectados:
// - src/integrations/supabase/client.ts
// - src/context/AuthContext.tsx (4 TODOs)
```

#### Pendientes de Implementación

**Alto Prioridad:**
- [ ] Conectar con API backend Java
- [ ] Implementar autenticación real (JWT)
- [ ] Base de datos real (reemplazar Supabase mock)
- [ ] Validación de formularios con Zod schemas
- [ ] Manejo de errores centralizado

**Media Prioridad:**
- [ ] Paginación en listados
- [ ] Filtros avanzados
- [ ] Exportación de datos (Excel/PDF)
- [ ] Sistema de notificaciones push
- [ ] Dashboard con métricas reales
- [ ] Gráficos y estadísticas

**Baja Prioridad:**
- [ ] Historial de cambios (auditoría)
- [ ] Sistema de reseñas
- [ ] Multi-idioma (i18n)
- [ ] PWA (Progressive Web App)
- [ ] Integración con PMS externos

#### Archivos Duplicados (Eliminar)
- [ ] `src/pages/admin/Clientes.tsx`
- [ ] `src/pages/admin/Habitaciones.tsx`
- [ ] `src/pages/admin/Reservas.tsx`

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo (puerto 8080)

# Build
npm run build            # Build de producción
npm run build:dev        # Build en modo desarrollo

# Calidad de código
npm run lint             # Ejecuta ESLint

# Preview
npm run preview          # Preview del build de producción
```

---

## 🚀 Despliegue

### Opción 1: Lovable.dev (Recomendado)

1. Accede a [Lovable](https://lovable.dev/projects/cf07259a-d28a-4837-8867-c70061b8b19c)
2. Ve a **Share → Publish**
3. Configura tu dominio personalizado en **Project > Settings > Domains**

Más información: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

### Opción 2: Vercel

```bash
npm install -g vercel
vercel
```

### Opción 3: Netlify

```bash
npm run build
# Luego arrastra la carpeta dist/ a Netlify
```

### Opción 4: Manual

```bash
npm run build
# Los archivos estarán en dist/
# Sube el contenido a tu servidor web
```

### Variables de Entorno en Producción

Asegúrate de configurar:
- `VITE_RAZORPAY_KEY_ID`
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`
- `VITE_API_URL`

---

## 💻 Editar el Código

### Usar Lovable (Recomendado)

Simplemente visita el [Proyecto en Lovable](https://lovable.dev/projects/cf07259a-d28a-4837-8867-c70061b8b19c) y comienza a hacer cambios mediante prompts.

Los cambios realizados en Lovable se commitean automáticamente a este repositorio.

### Usar tu IDE Preferido

Si quieres trabajar localmente usando tu propio IDE, puedes clonar este repo y hacer push de los cambios. Los cambios pusheados también se reflejarán en Lovable.

**Requisitos**: Node.js & npm instalados - [instalar con nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```bash
# Paso 1: Clonar el repositorio
git clone https://github.com/jesusvelazquez01/reservas_mpeym.git

# Paso 2: Navegar al directorio
cd reservas_mpeym

# Paso 3: Instalar dependencias
npm install

# Paso 4: Iniciar el servidor de desarrollo
npm run dev
```

### Editar Directamente en GitHub

- Navega al archivo deseado
- Click en el botón "Edit" (ícono de lápiz) en la esquina superior derecha
- Haz tus cambios y commitea

### Usar GitHub Codespaces

- Navega a la página principal del repositorio
- Click en el botón "Code" (botón verde) cerca de la esquina superior derecha
- Selecciona la pestaña "Codespaces"
- Click en "New codespace" para lanzar un ambiente Codespace
- Edita archivos directamente dentro del Codespace y commitea/pushea tus cambios

---

## 🤝 Contribuir

### Flujo de Trabajo

1. **Fork** el repositorio
2. **Crea una rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre un Pull Request**

### Convenciones de Código

- Usar TypeScript para nuevos archivos
- Seguir las reglas de ESLint
- Componentes en PascalCase
- Hooks personalizados con prefijo `use`
- Tipos e interfaces en archivos `.ts` separados

### Commits

Seguir [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato, espacios, etc.
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

---

## 📄 Licencia

Este proyecto es propiedad privada. Todos los derechos reservados.

---

## 👥 Equipo

**Repositorio**: [jesusvelazquez01/reservas_mpeym](https://github.com/jesusvelazquez01/reservas_mpeym)

**Plataforma de Desarrollo**: [Lovable.dev](https://lovable.dev/projects/cf07259a-d28a-4837-8867-c70061b8b19c)

---

## 📞 Soporte

Para preguntas o problemas:

- 📧 Email: soporte@parquehotel.com
- 🐛 Issues: [GitHub Issues](https://github.com/jesusvelazquez01/reservas_mpeym/issues)
- 📖 Documentación: Este README

---

## 🎓 Recursos Adicionales

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/latest)

---

## 🔄 Changelog

### [Unreleased]
- Integración con backend Java
- Autenticación real
- Sistema de pagos completo

### [1.0.0] - 2025-11-13
- ✨ Sistema completo de gestión hotelera
- ✨ Panel administrativo funcional
- ✨ Sistema de reservas
- ✨ Gestión de habitaciones y pasajeros
- ✨ Diseño responsivo
- ✨ Autenticación mock

---

<div align="center">

**Hecho con ❤️ para Parque Hotel**

[⬆ Volver arriba](#-parque-hotel---sistema-de-gestión-hotelera)

</div>


