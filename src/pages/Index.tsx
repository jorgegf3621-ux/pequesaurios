import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Sparkles, Shield, Clock, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-party.jpg";
import bpzImg from "@/assets/baby-play-zone.jpg";
import catalogInflableImg from "@/assets/catalog-inflable.jpg";
import catalogMesitaImg from "@/assets/catalog-mesita.jpg";
import paquetePlusImg from "@/assets/paquete-plus.jpg";

type ServicioCard = {
  id: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  desde: string;
  img_url: string | null;
  href: string;
  orden: number;
  activa: boolean;
};

const defaultServicios: ServicioCard[] = [
  { id: "1", titulo: "Baby Play Zone", subtitulo: "Inflable Castillo", descripcion: "Inflable blanco con resbaladilla y alberca de pelotas. Seguro y divertido para bebés de 1 a 5 años.", desde: "Desde $1,000", img_url: catalogInflableImg, href: "/servicios", orden: 1, activa: true },
  { id: "2", titulo: "Mobiliario Infantil", subtitulo: "Mesita & sillas", descripcion: "Mesita de madera blanca con 8 sillas infantiles arcoíris y conejito. Perfecta para snacks y actividades.", desde: "Desde $500", img_url: catalogMesitaImg, href: "/servicios", orden: 2, activa: true },
  { id: "3", titulo: "Actividad Creativa", subtitulo: "Caballetes", descripcion: "Llevamos los caballetes a tu fiesta para que los peques pinten y se lleven su obra de arte como recuerdo.", desde: "Desde $900", img_url: paquetePlusImg, href: "/actividad-creativa", orden: 3, activa: true },
  { id: "4", titulo: "Pintacaritas", subtitulo: "Arte en carita", descripcion: "Diseños en cara y mano, glitter tattoos y glitter para cabello. 1.5 horas de pura magia.", desde: "$800 · 1.5 hrs", img_url: null, href: "/pintacaritas", orden: 4, activa: true },
];

const testimonials = [
  {
    name: "Daniela H.",
    role: "Mamá de Mateo · 3 años",
    text: "El inflable fue el centro de atención. Los niños no querían salirse. Súper limpio y puntual.",
    rating: 5,
    initial: "D",
  },
  {
    name: "Paola M.",
    role: "Mamá de Sofía · 2 años",
    text: "Rentamos el paquete básico y quedó increíble. La mesita y las sillitas se veían hermosas.",
    rating: 5,
    initial: "P",
  },
  {
    name: "Karen R.",
    role: "Mamá de Luna · 4 años",
    text: "El paquete plus fue la mejor decisión. El área de arte mantuvo a los niños toda la fiesta.",
    rating: 5,
    initial: "K",
  },
];

const features = [
  { icon: Shield, label: "100% Seguro", desc: "Materiales certificados para bebés" },
  { icon: Clock, label: "Entrega puntual", desc: "Instalamos antes de tu evento" },
  { icon: Sparkles, label: "Todo incluido", desc: "Setup y retiro sin costo extra" },
];

type FotoGaleria = { id: string; url: string; alt: string; orden: number };


/* ── Index Page ────────────────────────────────────────── */
const Index = () => {
  const [galeria, setGaleria] = useState<FotoGaleria[]>([]);
  const [serviciosCards, setServiciosCards] = useState<ServicioCard[]>(defaultServicios);
  const heroImgRef = useRef<HTMLImageElement>(null);

  /* Scroll Reveal */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal, .reveal-left, .reveal-scale").forEach((el) =>
      observer.observe(el)
    );
    return () => observer.disconnect();
  }, []);

  /* Hero parallax */
  useEffect(() => {
    const onScroll = () => {
      const img = heroImgRef.current;
      if (img) img.style.transform = `translateY(${window.scrollY * 0.28}px) scale(1.12)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Supabase gallery */
  useEffect(() => {
    (supabase as any)
      .from("galeria")
      .select("id, url, alt, orden")
      .eq("activa", true)
      .order("orden")
      .then(({ data }: { data: FotoGaleria[] | null }) => {
        if (data && data.length > 0) setGaleria(data);
      });
  }, []);

  /* Supabase servicios cards — merge with local fallback images */
  useEffect(() => {
    (supabase as any)
      .from("servicios_cards")
      .select("*")
      .eq("activa", true)
      .order("orden")
      .then(({ data }: { data: ServicioCard[] | null }) => {
        if (data && data.length > 0) {
          const merged = data.map((card) => ({
            ...card,
            img_url: card.img_url ?? defaultServicios.find((d) => d.titulo === card.titulo)?.img_url ?? null,
          }));
          setServiciosCards(merged);
        }
      });
  }, []);

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        {/* Parallax BG */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            ref={heroImgRef}
            src={heroImg}
            alt="Baby Play Zone Pequesaurios"
            className="w-full h-full object-cover scale-110"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-background/30 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-transparent" />
        </div>

        {/* Floating blobs */}
        <div className="absolute top-20 right-16 w-48 h-48 rounded-full bg-lavender/25 blur-3xl animate-blob pointer-events-none" />
        <div className="absolute bottom-24 left-10 w-64 h-64 rounded-full bg-peach/20 blur-3xl animate-blob animation-delay-2000 pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full bg-mint/20 blur-2xl animate-blob animation-delay-4000 pointer-events-none" />

        {/* Content */}
        <div className="relative container mx-auto px-4 py-28 md:py-36">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="animate-fade-in inline-flex items-center gap-2 bg-white/75 backdrop-blur-md border border-white/60 text-foreground/65 text-[10px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e05252] flex-shrink-0 animate-pulse" />
              Monterrey N.L. · Disponible este mes
            </div>

            <h1 className="animate-fade-in animation-delay-200 font-display text-4xl md:text-6xl font-bold text-foreground mb-5 leading-tight [text-wrap:balance]">
              Un espacio especial para los{" "}
              <em className="not-italic text-gradient-brand">más pequeños</em>
            </h1>

            <p className="animate-fade-in animation-delay-400 text-lg md:text-xl text-foreground/75 max-w-xl mb-10 font-body leading-relaxed">
              Creamos el área de bebés perfecta para tu fiesta: segura, linda y llena de diversión.
            </p>

            <div className="animate-fade-in animation-delay-600 flex flex-col sm:flex-row gap-3">
              <Button
                variant="hero"
                size="lg"
                asChild
                className="rounded-full px-8 shadow-[0_8px_32px_-4px_hsl(330_60%_62%/0.40)] hover:shadow-[0_12px_40px_-4px_hsl(330_60%_62%/0.55)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <Link to="/servicios">
                  Ver servicios <ChevronRight size={16} />
                </Link>
              </Button>
              <Button
                variant="whatsapp"
                size="lg"
                asChild
                className="rounded-full px-8 hover:-translate-y-0.5 transition-all duration-300"
              >
                <a
                  href="https://wa.me/528180540369?text=%C2%A1Hola!%20Quiero%20cotizar%20Baby%20Play%20Zone"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cotizar por WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-float opacity-60">
          <span className="text-xs text-foreground/50 font-body">Desliza</span>
          <div className="w-px h-10 bg-gradient-to-b from-primary/60 to-transparent" />
        </div>
      </section>

      {/* ── Features strip ────────────────────────────────── */}
      <section className="container mx-auto px-4 -mt-8 relative z-10 mb-4">
        <div className="reveal grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={f.label}
              className={`reveal-delay-${i + 1} glass rounded-2xl px-6 py-5 flex items-center gap-4 shadow-[var(--shadow-card)]`}
            >
              <span className="w-10 h-10 rounded-xl bg-primary/12 flex items-center justify-center flex-shrink-0">
                <f.icon size={20} className="text-primary" />
              </span>
              <div>
                <p className="font-heading font-bold text-sm text-foreground">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Servicios — Header + Story Cards ────────────────── */}
      <section id="servicios" className="py-20">
        <div className="container mx-auto px-4">
          <div className="reveal flex flex-col md:flex-row md:items-end gap-8 mb-14">
            <div className="md:w-1/2">
              <p className="font-script text-3xl text-primary mb-3">nuestros servicios</p>
              <h2 className="font-display text-5xl md:text-6xl font-bold leading-[1.05] text-foreground">
                Todo lo que necesitas,{" "}
                <em className="italic font-normal">en un solo lugar.</em>
              </h2>
            </div>
            <div className="md:w-1/2 md:pl-8 md:pb-2">
              <p className="text-foreground/55 text-lg leading-relaxed max-w-md">
                Pasa el cursor sobre cada tarjeta para ver detalles. Combina servicios para armar tu paquete perfecto — te lo cotizamos sin compromiso.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-3 pb-4 snap-x snap-mandatory px-4 sm:px-8 w-max mx-auto">
          {serviciosCards.map((s) => (
            <Link
              key={s.id}
              to={s.href}
              className="flex-none w-44 sm:w-52 snap-center rounded-3xl overflow-hidden relative group aspect-[9/16] shadow-lg hover:shadow-2xl transition-shadow duration-300 block"
            >
              {s.img_url ? (
                <img src={s.img_url} alt={s.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-lavender/40 to-pink-100 flex items-center justify-center">
                  <Sparkles size={48} className="text-primary/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {s.subtitulo && (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full mb-1.5 inline-block border border-white/20">
                    {s.subtitulo}
                  </span>
                )}
                <h3 className="font-display text-lg font-bold text-white leading-tight">{s.titulo}</h3>
                {s.desde && <p className="text-xs font-semibold text-white/80 mt-0.5">{s.desde}</p>}
              </div>
            </Link>
          ))}
          </div>
        </div>
      </section>

      {/* ── Tres Pasos ───────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="reveal text-center mb-16">
            <p className="font-script text-3xl text-primary mb-3">así de fácil</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">Tres pasos. Cero estrés.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { num: "01", title: "Cotiza", desc: "Mándanos un WhatsApp con tu fecha y lo que imaginas. Respondemos en menos de 1 hora.", bg: "#FBBDAA", text: "#5c2e18", muted: "#D4906E" },
              { num: "02", title: "Reserva", desc: "Apartas tu fecha con 30%. Coordinamos detalles y te confirmamos por mail.", bg: "#A8DDD7", text: "#1a4540", muted: "#56b5af" },
              { num: "03", title: "Disfruta", desc: "Llegamos antes, montamos contigo, y al final levantamos todo. Tú solo disfrutas.", bg: "#FAE9A0", text: "#4a3800", muted: "#C9AD30" },
            ].map((step, i) => (
              <div
                key={step.num}
                className={`reveal reveal-delay-${i + 1} rounded-3xl p-8 md:p-10 relative overflow-hidden`}
                style={{ backgroundColor: step.bg }}
              >
                <p className="font-display text-[7rem] font-bold leading-none absolute -top-4 -right-2 select-none pointer-events-none" style={{ color: step.muted, opacity: 0.35 }}>
                  {step.num}
                </p>
                <div className="relative">
                  <p className="font-display text-6xl font-bold mb-6" style={{ color: step.muted, opacity: 0.5 }}>{step.num}</p>
                  <h3 className="font-display text-2xl font-bold mb-3" style={{ color: step.text }}>{step.title}</h3>
                  <p className="leading-relaxed text-sm" style={{ color: step.text, opacity: 0.75 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery ──────────────────────────────────────────── */}
      <section id="galeria" className="py-20">
        <div className="container mx-auto px-4">
          <div className="reveal flex items-end justify-between mb-12">
            <div>
              <p className="font-script text-3xl text-primary mb-2">nuestros eventos</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">Momentos reales.</h2>
            </div>
            <a
              href="https://www.instagram.com/pequesaurios/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block text-sm font-body font-semibold text-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Ver más en Instagram →
            </a>
          </div>

          {galeria.length > 0 ? (
            <div className="columns-2 md:columns-3 gap-3 space-y-3">
              {galeria.map((foto, i) => (
                <div key={foto.id} className={`reveal reveal-delay-${(i % 4) + 1} break-inside-avoid rounded-2xl overflow-hidden`}>
                  <img src={foto.url} alt={foto.alt || "Foto Pequesaurios"} className="w-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
              ))}
            </div>
          ) : (
            <div className="reveal grid grid-cols-3 gap-3">
              {[
                { src: bpzImg, alt: "Baby Play Zone completo", className: "col-span-2 row-span-2 h-[360px]" },
                { src: catalogInflableImg, alt: "Inflable castillo", className: "h-[175px]" },
                { src: catalogMesitaImg, alt: "Mesita y sillas", className: "h-[175px]" },
                { src: paquetePlusImg, alt: "Paquete plus", className: "col-span-3 h-[200px]" },
              ].map((img, i) => (
                <div key={i} className={`reveal reveal-delay-${i + 1} rounded-2xl overflow-hidden ${img.className}`}>
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
              ))}
            </div>
          )}

          <div className="sm:hidden reveal text-center mt-8">
            <a href="https://www.instagram.com/pequesaurios/" target="_blank" rel="noopener noreferrer"
              className="text-sm font-body font-semibold text-foreground hover:text-primary transition-colors underline underline-offset-4">
              Ver más en Instagram →
            </a>
          </div>
        </div>
      </section>

      {/* ── Testimonials — Dark ───────────────────────────────── */}
      <section id="resenas" className="py-24 bg-[#14143a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(270_40%_20%/0.6)_0%,_transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <div className="reveal text-center mb-14">
            <p className="font-script text-3xl text-[#F4A07A] mb-3">lo que dicen</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
              Mamás que ya vivieron{" "}
              <em className="italic font-normal text-[#F5D76E]">la magia.</em>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={t.name} className={`reveal reveal-delay-${i + 1} bg-[#1e1e4a] rounded-2xl p-7 border border-white/8`}>
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} className="fill-[#F5D76E] text-[#F5D76E]" />
                  ))}
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {t.initial}
                  </div>
                  <div>
                    <p className="font-body font-bold text-sm text-white">{t.name}</p>
                    <p className="text-xs text-white/45">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-28 text-center bg-background">
        <div className="container mx-auto px-4">
          <div className="reveal">
            <p className="font-script text-3xl text-primary mb-5">¿lista, mamá?</p>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Asegura tu fecha antes<br className="hidden sm:block" />
              {" "}de que <em className="italic font-normal">se ocupe.</em>
            </h2>
            <p className="text-foreground/50 mb-10 max-w-sm mx-auto leading-relaxed">
              Quedan pocos sábados disponibles este mes. Te respondemos en menos de 1 hora por WhatsApp.
            </p>
            <a
              href="https://wa.me/528180540369"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[hsl(142_35%_78%)] text-[hsl(142_35%_22%)] font-body font-semibold text-base px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Cotizar por WhatsApp
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Index;
