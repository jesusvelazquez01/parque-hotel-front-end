
import React from 'react';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

// Imágenes locales del hotel
const galleryImages = [
  {
    src: '/imagenes-hotel/parque-hotel.jpg',
    alt: 'Vista del Parque Hotel',
    title: 'Nuestro Hotel',
    description: 'Ubicado en el corazón de la ciudad, rodeado de naturaleza'
  },
  {
    src: '/imagenes-hotel/techo.jpg',
    alt: 'Arquitectura del hotel',
    title: 'Diseño Arquitectónico',
    description: 'Arquitectura que combina tradición y modernidad'
  },
  {
    src: '/imagenes-hotel/hotel-fondo.jpg',
    alt: 'Fachada del hotel',
    title: 'Bienvenidos',
    description: 'Un espacio diseñado para su comodidad'
  },
  {
    src: '/imagenes-hotel/lobby.jpg',
    alt: 'Lobby principal',
    title: 'Lobby Principal',
    description: 'Recibimiento cálido y elegante'
  },
  {
    src: '/imagenes-hotel/habitacion-1.jpg',
    alt: 'Habitación estándar',
    title: 'Habitaciones Confortables',
    description: 'Diseñadas para su descanso'
  },
  {
    src: '/imagenes-hotel/fondo-parque.jpg',
    alt: 'Áreas verdes',
    title: 'Entorno Natural',
    description: 'Disfrute de nuestros espacios verdes'
  }
];

const About = () => {
  const isMobile = useIsMobile();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-hotel-beige/20 to-white">
        {/* Hero Section with integrated header */}
        <div className="relative h-[60vh] w-full overflow-hidden">
          {/* Banner image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: "url('/imagenes-hotel/fondo-parque.jpg')",
              backgroundPosition: "center center",
            }}
          />
          
          {/* Gradient overlay - igual al del restaurante */}
          <div className="absolute inset-0 bg-gradient-to-t from-hotel-verde-oscuro/90 via-hotel-verde-oscuro/50 to-transparent"></div>
          
          {/* Content */}
          <div className="container mx-auto h-full flex items-end pb-16 relative z-10 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 font-['Cormorant_Garamond']">
                SOBRE <span className="text-hotel-verde-claro">NOSOTROS</span>
              </h1>
              
              <div className="h-1 w-24 bg-hotel-gold mb-6"></div>
              
              <p className="text-xl text-hotel-verde-claro">
                Descubre el lujo y la hospitalidad en el corazón de Córdoba, donde la tradición se encuentra con el confort moderno.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto">
            {/* Nuestra Historia */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-20"
            >
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-4xl text-hotel-verde-oscuro font-['Cormorant_Garamond'] mb-4">NUESTRA HISTORIA</h2>
                <div className="w-24 h-1 bg-hotel-gold mx-auto mb-6"></div>
                <p className="text-gray-600 max-w-4xl mx-auto text-lg">
                  El Parque Hotel es un testimonio del paisaje hotelero en evolución de Córdoba, combinando la calidez tradicional con el lujo moderno. Concebido como un santuario tanto para viajeros como para lugareños, nuestro hotel fue fundado con la visión de mostrar el rico patrimonio cultural de la región.
                </p>
              </div>

              {/* Galería de imágenes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {galleryImages.slice(0, 3).map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-xl h-64"
                  >
                    <img 
                      src={img.src} 
                      alt={img.alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <div>
                        <h4 className="text-white text-xl font-bold">{img.title}</h4>
                        <p className="text-white/90 text-sm">{img.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {galleryImages.slice(3).map((img, index) => (
                  <motion.div
                    key={index + 3}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-xl h-80"
                  >
                    <img 
                      src={img.src} 
                      alt={img.alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <div>
                        <h4 className="text-white text-xl font-bold">{img.title}</h4>
                        <p className="text-white/90 text-sm">{img.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Nuestra Visión */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-20"
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-4xl text-hotel-verde-oscuro font-['Cormorant_Garamond'] mb-4">NUESTRA VISIÓN</h2>
                  <div className="w-24 h-1 bg-hotel-gold mx-auto mb-6"></div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-xl text-hotel-verde-oscuro font-medium mb-3">Excelencia en Servicio</h3>
                      <p className="text-gray-600">
                        Ofrecer una experiencia de hospedaje excepcional donde cada detalle esté cuidadosamente pensado para su comodidad y satisfacción.
                      </p>
                    </div>
                    
                    <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-xl text-hotel-verde-oscuro font-medium mb-3">Sostenibilidad</h3>
                      <p className="text-gray-600">
                        Implementar prácticas responsables que respeten nuestro entorno y beneficien a la comunidad local, asegurando un futuro sostenible para todos.
                      </p>
                    </div>
                    
                    <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-xl text-hotel-verde-oscuro font-medium mb-3">Conexión Local</h3>
                      <p className="text-gray-600">
                        Ser el puente entre nuestros huéspedes y la rica cultura, gastronomía y tradiciones de Córdoba, creando experiencias auténticas y memorables.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative h-96 rounded-2xl overflow-hidden">
                    <img 
                      src="/imagenes-hotel/techo.jpg" 
                      alt="Vista arquitectónica del hotel"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-hotel-verde-oscuro/80 to-transparent flex items-end p-8">
                      <div>
                        <h3 className="text-2xl text-white font-bold mb-2">Nuestro Compromiso</h3>
                        <p className="text-white/90">
                          En el Parque Hotel, nos comprometemos a ofrecer una experiencia que combine el lujo con la autenticidad, creando recuerdos que perdurarán mucho después de su partida.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Why Choose Us Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-16"
            >
              <h2 className="text-2xl md:text-3xl text-hotel-verde-oscuro font-['Cormorant_Garamond'] mb-8 text-center">¿POR QUÉ ELEGIRNOS?</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="text-hotel-verde-oscuro text-xl font-medium mb-3">Ubicación Privilegiada</h3>
                  <p className="text-gray-600">
                    Estratégicamente ubicado en el corazón de Córdoba, ofreciendo fácil acceso a distritos comerciales y atracciones turísticas.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="text-hotel-verde-oscuro text-xl font-medium mb-3">Habitaciones de Lujo</h3>
                  <p className="text-gray-600">
                    Alojamientos elegantemente diseñados con comodidades modernas para garantizar su confort y relajación durante su estadía.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="text-hotel-verde-oscuro text-xl font-medium mb-3">Excelencia Culinaria</h3>
                  <p className="text-gray-600">
                    Múltiples opciones gastronómicas que incluyen tanto cocina internacional como auténticos sabores locales preparados por chefs expertos.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="text-hotel-verde-oscuro text-xl font-medium mb-3">Espacios para Eventos</h3>
                  <p className="text-gray-600">
                    Versátiles espacios para celebraciones personales y reuniones corporativas, respaldados por servicios profesionales de eventos.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="text-hotel-verde-oscuro text-xl font-medium mb-3">Servicio Personalizado</h3>
                  <p className="text-gray-600">
                    Personal dedicado comprometido a brindar un servicio atento y personalizado para satisfacer las necesidades individuales de cada huésped.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="text-hotel-verde-oscuro text-xl font-medium mb-3">Compromiso Ambiental</h3>
                  <p className="text-gray-600">
                    Prácticas sostenibles y respetuosas con el medio ambiente en todas nuestras operaciones, contribuyendo a un futuro más verde.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Our Team Section - Responsive grid */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-16"
            >
              <h2 className="text-2xl md:text-3xl text-hotel-verde-claro font-['Cormorant_Garamond'] mb-8 text-center">NUESTRO EQUIPO</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Team Member 1 */}
                <div className="bg-hotel-slate/40 rounded-lg overflow-hidden group">
                  <div className="relative overflow-hidden">
                    <img 
                      src="/lovable-uploads/1fbe2e3f-c747-4ab8-9fff-f44a357b92c5.jpg" 
                      alt="Team Member" 
                      className="w-full h-56 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-hotel-midnight to-transparent opacity-70"></div>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-white text-lg font-semibold">Carlos Gutiérrez</h3>
                    <p className="text-hotel-verde-claro text-sm">Gerente General</p>
                  </div>
                </div>
                
                {/* Team Member 2 */}
                <div className="bg-hotel-slate/40 rounded-lg overflow-hidden group">
                  <div className="relative overflow-hidden">
                    <img 
                      src="/lovable-uploads/ab3775fa-3c12-44ed-a331-47c81f904b39.jpg" 
                      alt="Team Member" 
                      className="w-full h-56 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-hotel-midnight to-transparent opacity-70"></div>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-white text-lg font-semibold">Ana Martínez</h3>
                    <p className="text-hotel-verde-claro text-sm">Chef Ejecutiva</p>
                  </div>
                </div>
                
                {/* Team Member 3 */}
                <div className="bg-hotel-slate/40 rounded-lg overflow-hidden group">
                  <div className="relative overflow-hidden">
                    <img 
                      src="/lovable-uploads/a51bf864-1ca5-4c37-80e9-2ae93f6c0149.jpg" 
                      alt="Team Member" 
                      className="w-full h-56 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-hotel-midnight to-transparent opacity-70"></div>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-white text-lg font-semibold">María López</h3>
                    <p className="text-hotel-verde-claro text-sm">Gerente de Relaciones con Huéspedes</p>
                  </div>
                </div>
                
                {/* Team Member 4 */}
                <div className="bg-hotel-slate/40 rounded-lg overflow-hidden group">
                  <div className="relative overflow-hidden">
                    <img 
                      src="/lovable-uploads/d2a86d9a-0e05-4eb4-80b5-bd15c416c963.jpg" 
                      alt="Team Member" 
                      className="w-full h-56 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-hotel-midnight to-transparent opacity-70"></div>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-white text-lg font-semibold">Sofía Rodríguez</h3>
                    <p className="text-hotel-verde-claro text-sm">Directora de Eventos</p>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
