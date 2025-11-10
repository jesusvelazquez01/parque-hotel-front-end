
import React from 'react';
import ContactForm from '@/components/ContactForm';
import { Toaster } from "@/components/ui/toaster";

const Contact: React.FC = () => {
  return (
    <>
      <div className="w-full min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-hotel-midnight">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-hotel-gold mb-2">
            Contáctanos
          </h1>
          <p className="text-center text-white mb-8 max-w-2xl mx-auto">
            ¿Tienes alguna pregunta o comentario? Estamos aquí para ayudarte. 
            Completa el formulario y nos pondremos en contacto contigo lo antes posible.
          </p>
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <ContactForm />
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default Contact;
