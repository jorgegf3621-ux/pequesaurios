import { Instagram, Phone, MapPin, Clock, Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => (
  <footer className="relative mt-24 overflow-hidden">
    {/* Decorative top gradient bar */}
    <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

    <div className="bg-gradient-to-b from-muted/40 to-background">
      <div className="container mx-auto px-4 pt-14 pb-10 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Brand */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Pequesaurios" className="h-14 w-14 rounded-2xl object-cover shadow-md" />
            <div>
              <p className="font-heading text-xl font-bold text-gradient-brand leading-tight">Pequesaurios</p>
              <p className="text-xs text-muted-foreground">Renta de mobiliario para fiestas · Monterrey</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
            Creamos momentos mágicos para los invitados más pequeños de tu fiesta.
          </p>
        </div>

        {/* Contacto */}
        <div className="flex flex-col gap-3">
          <h4 className="font-heading font-bold text-foreground text-base mb-1">Contáctanos</h4>
          <a
            href="tel:8180540369"
            className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
          >
            <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
              <Phone size={14} className="text-primary" />
            </span>
            818 054 0369
          </a>
          <a
            href="https://instagram.com/pequesaurioss"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
          >
            <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
              <Instagram size={14} className="text-primary" />
            </span>
            @pequesaurioss
          </a>
          <a
            href="https://www.facebook.com/share/1DvDRmqAGB/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
          >
            <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
              <Facebook size={14} className="text-primary" />
            </span>
            Pequesaurios
          </a>
          <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin size={14} className="text-primary" />
            </span>
            Monterrey, Nuevo León
          </p>
        </div>

        {/* Horario + links */}
        <div className="flex flex-col gap-3">
          <h4 className="font-heading font-bold text-foreground text-base mb-1">Horario</h4>
          <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock size={14} className="text-primary" />
            </span>
            Lun – Vie: 9:00 – 18:00 (solo cotizaciones)
          </p>
          <p className="text-sm text-muted-foreground pl-9">Sáb y Dom: Eventos</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 pl-9">
            {[
              { to: "/servicios", label: "Servicios" },
              { to: "/cotizador", label: "Cotizador" },
              { to: "/contacto", label: "Contacto" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/60 py-5">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Pequesaurios · Todos los derechos reservados
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
