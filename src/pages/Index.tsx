import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Sparkles, Shield, Clock, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-party.jpg";
import bpzImg from "@/assets/baby-play-zone.jpg";
import catalogInflableImg from "@/assets/catalog-inflable.jpg";
import catalogMesitaImg from "@/assets/catalog-mesita.jpg";
import paquetePlusImg from "@/assets/paquete-plus.jpg";

const servicios = [
  {
    titulo: "Baby Play Zone",
    subtitulo: "Inflable Castillo",
    desc: "Inflable blanco con resbaladilla y alberca de pelotas. Seguro y divertido para bebés de 1 a 5 años.",
    desde: "Desde $800",
    img: catalogInflableImg,
    href: "/servicios",
    accent: "from-lavender/50 to-pink-50",
    badge: "bg-lavender/30 text-purple-700",
  },
  {
    titulo: "Mobiliario Infantil",
    subtitulo: "Mesita & sillas",
    desc: "Mesita de madera blanca con 8 sillas infantiles arcoíris y conejito. Perfecta para snacks y actividades.",
    desde: "Desde $500",
    img: catalogMesitaImg,
    href: "/servicios",
    accent: "from-peach/50 to-orange-50",
    badge: "bg-peach/40 text-orange-700",
  },
  {
    titulo: "Actividad Creativa",
    subtitulo: "Kit de Yesitos",
    desc: "Los peques pintan su propia figura de yeso y se la llevan de recuerdo. Bolsas personalizadas.",
    desde: "Desde $20 c/u",
    img: paquetePlusImg,
    href: "/actividad-creativa",
    accent: "from-yellow-100/70 to-amber-50",
    badge: "bg-yellow-100 text-yellow-700",
  },
  {
    titulo: "Pintacaritas",
    subtitulo: "Arte en carita",
    desc: "Diseños en cara y mano, glitter tattoos y glitter para cabello. 1.5 horas de pura magia.",
    desde: "$800 · 1.5 hrs",
    img: null,
    href: "/pintacaritas",
    accent: "from-purple-100/60 to-violet-50",
    badge: "bg-purple-100 text-purple-700",
  },
];

const testimonials = [
  {
    name: "Daniela Hernández",
    text: "El inflable fue el centro de atención de la fiesta, los niños no querían salirse. Todo muy limpio y puntual. 100% recomendado.",
    rating: 5,
    initial: "D",
  },
  {
    name: "Paola Martínez",
    text: "Rentamos el paquete básico y quedó increíble. La mesita y las sillitas se veían hermosas, perfectas para los más pequeños.",
    rating: 5,
    initial: "P",
  },
  {
    name: "Karen Reyes",
    text: "El paquete plus fue la mejor decisión. El área de arte mantuvo a los niños entretenidos toda la fiesta. ¡Definitivamente volvemos!",
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

/* ── 3D Tilt Card ──────────────────────────────────────── */
const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    const card = ref.current;
    if (!card) return;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) scale(1.025)`;
    card.style.boxShadow = `${-x * 12}px ${y * 12}px 40px -8px hsl(270 40% 50% / 0.16), 0 4px 12px hsl(270 40% 50% / 0.08)`;
  }, []);

  const onLeave = useCallback(() => {
    const card = ref.current;
    if (!card) return;
    card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
    card.style.boxShadow = "var(--shadow-card)";
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`tilt-card ${className ?? ""}`}
    >
      {children}
    </div>
  );
};

/* ── Index Page ────────────────────────────────────────── */
const Index = () => {
  const [galeria, setGaleria] = useState<FotoGaleria[]>([]);
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
            <div className="animate-fade-in inline-flex items-center gap-2 bg-white/70 backdrop-blur-md border border-white/60 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Baby Play Zone · Monterrey N.L.
            </div>

            <h1 className="animate-fade-in animation-delay-200 font-heading text-4xl md:text-6xl font-bold text-foreground mb-5 leading-tight [text-wrap:balance]">
              Un espacio especial para los{" "}
              <span className="text-gradient-brand">más pequeños</span>
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

      {/* ── Servicios — 3D Flip Cards ─────────────────────── */}
      <section className="container mx-auto px-4 py-20">
        <div className="reveal text-center mb-14">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Lo que ofrecemos</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">Nuestros Servicios</h2>
          <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
            Todo lo que necesitas para hacer tu fiesta inolvidable
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {servicios.map((s, i) => (
            <div
              key={s.titulo}
              className={`reveal reveal-delay-${(i % 2) + 1} group h-72 [perspective:1200px]`}
            >
              <div className="relative w-full h-full [transform-style:preserve-3d] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:[transform:rotateY(180deg)]">

                {/* Front */}
                <Link
                  to={s.href}
                  className="absolute inset-0 [backface-visibility:hidden] rounded-2xl overflow-hidden block"
                  tabIndex={-1}
                >
                  {s.img ? (
                    <img src={s.img} alt={s.titulo} className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${s.accent} flex items-center justify-center`}>
                      <Sparkles size={64} className="text-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.badge} mb-2 inline-block`}>
                      {s.subtitulo}
                    </span>
                    <h3 className="font-heading text-2xl font-bold text-white">{s.titulo}</h3>
                    <p className="text-sm font-semibold text-white/85 mt-0.5">{s.desde}</p>
                  </div>
                  <div className="absolute top-3 right-3 hidden sm:flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-full border border-white/20">
                    Voltear
                  </div>
                </Link>

                {/* Back */}
                <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl p-7 flex flex-col bg-gradient-to-br ${s.accent} border border-white/60 shadow-xl`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.badge} mb-3 self-start`}>
                    {s.subtitulo}
                  </span>
                  <h3 className="font-heading text-2xl font-bold mb-3 text-foreground">{s.titulo}</h3>
                  <p className="text-sm text-foreground/70 flex-1 leading-relaxed">{s.desc}</p>
                  <div className="flex items-center justify-between mt-5">
                    <span className="font-heading font-bold text-primary text-xl">{s.desde}</span>
                    <Link
                      to={s.href}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary/90 hover:shadow-lg transition-all"
                    >
                      Ver más <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        <div className="reveal text-center mt-10">
          <Button variant="outline" size="lg" asChild className="rounded-full border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all">
            <Link to="/servicios">Ver todos los servicios</Link>
          </Button>
        </div>
      </section>

      {/* ── Testimonials — 3D Tilt ─────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        {/* BG decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent pointer-events-none" />
        <div className="absolute top-8 left-1/4 w-72 h-72 rounded-full bg-lavender/15 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <div className="reveal text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Reseñas reales</p>
            <h2 className="font-heading text-3xl font-bold">Lo que dicen nuestros clientes</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <TiltCard
                key={t.name}
                className={`reveal reveal-delay-${i + 1} bg-white rounded-2xl p-6 border border-border/60 shadow-[var(--shadow-card)] cursor-default`}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-foreground/75 mb-5 leading-relaxed italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-lavender/60 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {t.initial}
                  </div>
                  <p className="font-heading font-bold text-sm text-foreground">{t.name}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery ────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20">
        <div className="reveal text-center mb-14">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Galería</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">Nuestros eventos</h2>
          <p className="text-muted-foreground text-sm">Momentos reales, fiestas inolvidables</p>
        </div>

        {galeria.length > 0 ? (
          <div className="columns-2 md:columns-3 gap-3 space-y-3">
            {galeria.map((foto, i) => (
              <div
                key={foto.id}
                className={`reveal reveal-delay-${(i % 4) + 1} break-inside-avoid rounded-2xl overflow-hidden`}
              >
                <img
                  src={foto.url}
                  alt={foto.alt || "Foto Pequesaurios"}
                  className="w-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="reveal grid grid-cols-3 gap-3">
            {[
              { src: bpzImg, alt: "Baby Play Zone completo", className: "col-span-2 row-span-2 h-[360px]" },
              { src: catalogInflableImg, alt: "Inflable castillo", className: "h-[175px]" },
              { src: catalogMesitaImg, alt: "Mesita y sillas", className: "h-[175px]" },
              { src: paquetePlusImg, alt: "Paquete plus", className: "col-span-3 h-[200px] mt-0" },
            ].map((img, i) => (
              <div key={i} className={`reveal reveal-delay-${i + 1} rounded-2xl overflow-hidden ${img.className}`}>
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20">
        <div className="reveal reveal-scale relative overflow-hidden rounded-3xl">
          {/* BG gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-lavender/40 via-primary/10 to-peach/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(330_60%_90%/0.5)_0%,_transparent_65%)]" />

          {/* Decorative floating rings */}
          <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full border border-primary/15 animate-spin-slow pointer-events-none" />
          <div className="absolute -right-6 -top-6 w-36 h-36 rounded-full border border-primary/10 animate-spin-slow pointer-events-none" style={{ animationDirection: "reverse", animationDuration: "15s" }} />

          <div className="relative px-8 py-16 md:py-20 text-center">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Fechas limitadas por fin de semana
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 [text-wrap:balance]">
              Asegura tu fecha antes de que se ocupe
            </h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto text-sm leading-relaxed">
              Escríbenos por WhatsApp y te respondemos en menos de 1 hora.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="hero"
                size="lg"
                asChild
                className="rounded-full px-8 shadow-[0_8px_32px_-4px_hsl(330_60%_62%/0.40)] hover:shadow-[0_12px_40px_-4px_hsl(330_60%_62%/0.55)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <Link to="/cotizador">Cotizador Interactivo</Link>
              </Button>
              <Button
                variant="whatsapp"
                size="lg"
                asChild
                className="rounded-full px-8 hover:-translate-y-0.5 transition-all duration-300"
              >
                <a href="https://wa.me/528180540369" target="_blank" rel="noopener noreferrer">
                  WhatsApp · 8180540369
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Index;
