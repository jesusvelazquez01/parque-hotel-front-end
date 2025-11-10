
import React, { useRef, useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin } from "lucide-react";
import emailjs from '@emailjs/browser';

const ContactForm = () => {
  const form = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!form.current) return;

    try {
      const result = await emailjs.sendForm(
        'service_1rzbsyb',
        'template_fvoj71f',
        form.current,
        'dyNkQISLz0Gz2TDtv'
      );

      if (result.text === 'OK') {
        toast.success("¡Mensaje enviado con éxito!");
        form.current.reset();
      } else {
        throw new Error('Error al enviar el mensaje');
      }
    } catch (error) {
      toast.error("Error al enviar el mensaje. Por favor, intente nuevamente más tarde.");
      console.error('Error de EmailJS:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-hotel-verde-oscuro">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8 bg-hotel-verde-oscuro/50 backdrop-blur-sm p-8 rounded-xl border border-hotel-verde-claro/20">
            <div>
              <h2 className="text-3xl sm:text-4xl font-['Cormorant_Garamond'] font-semibold text-white mb-4">
                Contáctenos
              </h2>
              <p className="text-gray-300 font-['Montserrat'] mb-8">
                Nos encantaría saber de usted. Complete el formulario o contáctenos utilizando la información a continuación.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-hotel-verde-claro/20 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-hotel-verde-claro" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-['Montserrat']">Teléfono</p>
                  <p className="text-white font-['Montserrat']">+54 351 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-hotel-verde-claro/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-hotel-verde-claro" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-['Montserrat']">Correo Electrónico</p>
                  <p className="text-white font-['Montserrat']">info@parquehotel.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-hotel-verde-claro/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-hotel-verde-claro" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-['Montserrat']">Dirección</p>
                  <p className="text-white font-['Montserrat']">Av. Principal 1234, Barrio Parque, Córdoba, Argentina, X5000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-hotel-verde-oscuro/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-hotel-verde-claro/20">
            <form ref={form} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="user_name" className="block text-sm font-medium text-gray-300 mb-2">
Nombre
                  </label>
                  <input
                    type="text"
                    name="user_name"
                    id="user_name"
                    className="w-full px-4 py-3 rounded-lg bg-hotel-verde-oscuro/70 border border-hotel-verde-claro/30 text-white focus:ring-2 focus:ring-hotel-verde-claro focus:border-transparent outline-none transition duration-200 placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-2">
Apellido
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    className="w-full px-4 py-3 rounded-lg bg-hotel-verde-oscuro/70 border border-hotel-verde-claro/30 text-white focus:ring-2 focus:ring-hotel-verde-claro focus:border-transparent outline-none transition duration-200 placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="user_email" className="block text-sm font-medium text-gray-300 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="user_email"
                  id="user_email"
                  className="w-full px-4 py-3 rounded-lg bg-hotel-midnight/50 border border-hotel-gold/20 text-white focus:ring-2 focus:ring-hotel-gold focus:border-transparent outline-none transition duration-200 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
Número de Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  className="w-full px-4 py-3 rounded-lg bg-hotel-midnight/50 border border-hotel-gold/20 text-white focus:ring-2 focus:ring-hotel-gold focus:border-transparent outline-none transition duration-200 placeholder-gray-400"
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
Mensaje
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-hotel-midnight/50 border border-hotel-gold/20 text-white focus:ring-2 focus:ring-hotel-gold focus:border-transparent outline-none transition duration-200 resize-none placeholder-gray-400"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-hotel-verde-claro hover:bg-hotel-verde-medio text-hotel-verde-oscuro font-['Montserrat'] py-3 px-6 rounded-lg transition duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
