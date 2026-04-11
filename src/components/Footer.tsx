import { Instagram, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => (
  <footer className="bg-foreground/5 border-t border-border mt-16">
    <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="flex flex-col items-start gap-3">
        <img src={logo} alt="Pequesaurios" className="h-16 w-16 rounded-full" />
        <p className="font-heading text-lg font-bold text-gradient-brand">Pequesaurios</p>
        <p className="text-muted-foreground text-sm">Mobiliario Infantil · Monterrey N.L.</p>
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="font-heading font-bold text-foreground">Contáctanos</h4>
        <a href="tel:8180540369" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <Phone size={16} /> 818 054 0369
        </a>
        <a href="https://instagram.com/pequesaurioss" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <Instagram size={16} /> @pequesaurioss
        </a>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin size={16} /> Monterrey, Nuevo León
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="font-heading font-bold text-foreground">Horario</h4>
        <p className="text-sm text-muted-foreground">Lunes a Viernes: 9:00 - 18:00</p>
        <p className="text-sm text-muted-foreground">Sábado y Domingo: Eventos</p>
        <p className="text-sm text-muted-foreground mt-2">¡Diversión garantizada! 🦕</p>
      </div>
    </div>
    <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} Pequesaurios. Todos los derechos reservados.
    </div>
  </footer>
);

export default Footer;
