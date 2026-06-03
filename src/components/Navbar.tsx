import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

const navLinks = [
  { to: "/", label: "Inicio" },
  { to: "/servicios", label: "Servicios" },
  { to: "/cotizador", label: "Cotizador" },
  { to: "/reservaciones", label: "Reservaciones" },
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
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-border/60 shadow-[0_2px_20px_-4px_hsl(270_40%_50%/0.10)]"
          : "bg-card/70 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className={`container mx-auto flex items-center justify-between px-4 transition-all duration-500 ${scrolled ? "h-14" : "h-16"}`}>
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={logo}
            alt="Pequesaurios"
            className={`rounded-full object-cover transition-all duration-500 ${scrolled ? "h-9 w-9" : "h-11 w-11"}`}
          />
          <span className="font-heading text-xl font-bold text-gradient-brand hidden sm:block">
            Pequesaurios
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative font-body font-semibold text-sm px-3 py-2 rounded-lg transition-colors duration-200 ${
                  active ? "text-primary" : "text-foreground/65 hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary transition-all duration-300" />
                )}
              </Link>
            );
          })}
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
          open ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ borderTop: open ? "1px solid hsl(var(--border))" : "none" }}
      >
        <div className="bg-white/90 backdrop-blur-xl px-4 py-3 flex flex-col gap-0.5">
          {navLinks.map((link, i) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
                className={`flex items-center gap-2 py-2.5 px-3 rounded-xl font-body font-semibold text-sm transition-all duration-300 ${
                  active
                    ? "text-primary bg-primary/8"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/60"
                } ${open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
              >
                {active && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
