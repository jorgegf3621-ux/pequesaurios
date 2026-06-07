import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Servicios = () => (
  <div className="min-h-screen flex items-center justify-center py-24 px-4 bg-background">
    <div className="text-center max-w-md mx-auto">
      <p className="font-script text-3xl text-primary mb-4">¿lista para cotizar?</p>
      <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
        Arma tu paquete <em className="italic font-normal">perfecto.</em>
      </h1>
      <p className="text-foreground/55 mb-10 leading-relaxed">
        Combina servicios, revisa precios y cotiza al instante — o escríbenos directo por WhatsApp.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="hero" size="lg" asChild className="rounded-full px-8">
          <Link to="/cotizador">Usar el cotizador</Link>
        </Button>
        <Button variant="whatsapp" size="lg" asChild className="rounded-full px-8">
          <a href="https://wa.me/528180540369" target="_blank" rel="noopener noreferrer">
            Cotizar por WhatsApp
          </a>
        </Button>
      </div>
      <div className="mt-10">
        <Link to="/#servicios" className="text-sm text-foreground/40 hover:text-primary transition-colors underline underline-offset-4">
          ← Ver todos los servicios
        </Link>
      </div>
    </div>
  </div>
);

export default Servicios;
