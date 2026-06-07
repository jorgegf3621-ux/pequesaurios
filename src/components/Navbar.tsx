import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

const navLinks = [
  { to: "/", label: "Inicio" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#galeria", label: "Galería" },
  { href: "/#resenas", label: "Reseñas" },
  { to: "/contacto", label: "Contacto" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 border-t-[3px] border-t-[#2c1810] ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-border/60 shadow-sm"
          : "bg-white/80 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className={`container mx-auto flex items-center justify-between px-4 transition-all duration-500 ${scrolled ? "h-14" : "h-16"}`}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={logo}
            alt="Pequesaurios"
            className={`rounded-full object-cover transition-all duration-500 ${scrolled ? "h-9 w-9" : "h-11 w-11"}`}
          />
          <span className="font-heading text-xl font-bold text-foreground hidden sm:block">
            Pequesaurios
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => {
            const isRoute = "to" in link;
            const active = isRoute && location.pathname === link.to;
            const commonClass = `relative font-body font-semibold text-sm px-3.5 py-2 rounded-lg transition-colors duration-200 ${
              active ? "text-foreground" : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
            }`;
            return isRoute ? (
              <Link key={link.label} to={link.to!} className={commonClass}>
                {link.label}
                {active && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary transition-all duration-300" />
                )}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className={commonClass}>{link.label}</a>
            );
          })}
        </div>

        {/* Cotizar CTA */}
        <div className="hidden md:flex items-center">
          <Link
            to="/cotizador"
            className="bg-primary text-white font-body font-semibold text-sm px-5 py-2 rounded-full hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            Cotizar
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-foreground hover:bg-muted/60 transition-colors"
        >
          <span className={`transition-all duration-300 ${open ? "rotate-90 opacity-0 absolute" : "rotate-0 opacity-100"}`}>
            <Menu size={22} />
          </span>
          <span className={`transition-all duration-300 ${open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0 absolute"}`}>
            <X size={22} />
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ borderTop: open ? "1px solid hsl(var(--border))" : "none" }}
      >
        <div className="bg-white/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-0.5">
          {navLinks.map((link, i) => {
            const isRoute = "to" in link;
            const active = isRoute && location.pathname === link.to;
            const commonClass = `flex items-center gap-2 py-2.5 px-3 rounded-xl font-body font-semibold text-sm transition-all duration-300 ${
              active ? "text-primary bg-primary/8" : "text-foreground/70 hover:text-foreground hover:bg-muted/60"
            } ${open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`;
            return isRoute ? (
              <Link key={link.label} to={link.to!} style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }} className={commonClass}>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }} className={commonClass}>{link.label}</a>
            );
          })}
          <Link
            to="/cotizador"
            className="mt-2 bg-primary text-white font-body font-semibold text-sm px-5 py-2.5 rounded-full text-center hover:bg-primary/90 transition-colors"
          >
            Cotizar
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
