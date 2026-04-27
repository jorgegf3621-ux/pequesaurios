import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
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
    color: "from-lavender/40 to-white",
    textColor: "text-lavender-foreground",
  },
  {
    titulo: "Mobiliario Infantil",
    subtitulo: "Mesita & sillas",
    desc: "Mesita de madera blanca con 8 sillas infantiles arcoíris y conejito. Perfecta para snacks y actividades.",
    desde: "Desde $500",
    img: catalogMesitaImg,
    href: "/servicios",
    color: "from-peach/40 to-white",
    textColor: "text-peach-foreground",
  },
  {
    titulo: "Actividad Creativa",
    subtitulo: "Kit de Yesitos",
    desc: "Los peques pintan su propia figura de yeso y se la llevan de recuerdo. Bolsas personalizadas.",
    desde: "Desde $20 c/u",
    img: paquetePlusImg,
    href: "/actividad-creativa",
    color: "from-yellow-100/60 to-white",
    textColor: "text-yellow-700",
  },
  {
    titulo: "Pintacaritas",
    subtitulo: "Arte en carita",
    desc: "Diseños en cara y mano, glitter tattoos y glitter para cabello. 1.5 horas de pura magia.",
    desde: "$800 · 1.5 hrs",
    img: null,
    href: "/pintacaritas",
    color: "from-purple-100/60 to-white",
    textColor: "text-purple-700",
  },
];

const testimonials = [
  {
    name: "Daniela Hernández",
    text: "El inflable fue el centro de atención de la fiesta, los niños no querían salirse. Todo muy limpio y puntual. 100% recomendado.",
    rating: 5,
  },
  {
    name: "Paola Martínez",
    text: "Rentamos el paquete básico y quedó increíble. La mesita y las sillitas se veían hermosas, perfectas para los más pequeños.",
    rating: 5,
  },
  {
    name: "Karen Reyes",
    text: "El paquete plus fue la mejor decisión. El área de arte mantuvo a los niños entretenidos toda la fiesta. ¡Definitivamente volvemos!",
    rating: 5,
  },
];

type FotoGaleria = { id: string; url: string; alt: string; orden: number };

const Index = () => {
  const [galeria, setGaleria] = useState<FotoGaleria[]>([]);

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
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Baby Play Zone Pequesaurios" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/25 to-background" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36 text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Baby Play Zone</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-4 animate-fade-in-up">
            Un espacio especial para los <span className="text-gradient-brand">más pequeños</span> 🦕
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-8 font-body">
            Creamos un espacio seguro, lindo y divertido para los invitados más pequeños de tu fiesta. Monterrey, N.L.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/servicios">Ver servicios</Link>
            </Button>
            <Button variant="whatsapp" size="lg" asChild>
              <a href="https://wa.me/528180540369?text=%C2%A1Hola!%20Quiero%20cotizar%20Baby%20Play%20Zone" target="_blank" rel="noopener noreferrer">
                Cotizar por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Servicios — 3D Flip Cards */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-2">Nuestros Servicios</h2>
        <p className="text-muted-foreground text-center mb-12">Todo lo que necesitas para hacer tu fiesta inolvidable</p>
        <div className="grid sm:grid-cols-2 gap-6">
          {servicios.map((s) => (
            <div key={s.titulo} className="group h-72 [perspective:1200px]">
              <div className="relative w-full h-full [transform-style:preserve-3d] transition-all duration-700 ease-out group-hover:[transform:rotateY(180deg)]">

                {/* Front — acts as direct link on mobile */}
                <Link
                  to={s.href}
                  className="absolute inset-0 [backface-visibility:hidden] rounded-2xl overflow-hidden block"
                  tabIndex={-1}
                >
                  {s.img ? (
                    <img src={s.img} alt={s.titulo} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                      <span className="text-8xl">✨</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">{s.subtitulo}</p>
                    <h3 className="font-heading text-2xl font-bold text-white">{s.titulo}</h3>
                    <span className="text-sm font-bold text-white/90">{s.desde}</span>
                  </div>
                  <div className="absolute top-3 right-3 hidden sm:flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-full">
                    <span>↻</span> Voltear
                  </div>
                </Link>

                {/* Back */}
                <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl p-6 flex flex-col bg-gradient-to-br ${s.color} border-2 border-primary/20 shadow-xl`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${s.textColor}`}>{s.subtitulo}</p>
                  <h3 className="font-heading text-2xl font-bold mb-3">{s.titulo}</h3>
                  <p className="text-sm text-foreground/70 flex-1">{s.desc}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-heading font-bold text-primary text-xl">{s.desde}</span>
                    <Link
                      to={s.href}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors"
                    >
                      Ver más →
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button variant="outline" size="lg" asChild>
            <Link to="/servicios">Ver todos los servicios</Link>
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-center mb-12">Lo que dicen nuestros clientes ⭐</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} className="fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 mb-4 italic">"{t.text}"</p>
                <p className="font-heading font-bold text-sm text-primary">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-2">Nuestros eventos 📸</h2>
        <p className="text-muted-foreground text-center mb-10">Momentos reales, fiestas inolvidables</p>

        {galeria.length > 0 ? (
          <div className="columns-2 md:columns-3 gap-3 space-y-3">
            {galeria.map((foto) => (
              <div key={foto.id} className="break-inside-avoid rounded-2xl overflow-hidden">
                <img
                  src={foto.url}
                  alt={foto.alt || "Foto Pequesaurios"}
                  className="w-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 h-[460px]">
              <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden">
                <img src={bpzImg} alt="Baby Play Zone completo" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="rounded-2xl overflow-hidden">
                <img src={catalogInflableImg} alt="Inflable castillo" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="rounded-2xl overflow-hidden">
                <img src={catalogMesitaImg} alt="Mesita y sillas infantiles" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
            </div>
            <div className="mt-3 h-[220px] rounded-2xl overflow-hidden">
              <img src={paquetePlusImg} alt="Paquete plus - área creativa" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
            </div>
          </>
        )}
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-lavender/30 via-mint/30 to-peach/30 rounded-3xl p-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Fechas limitadas por fin de semana</p>
          <h2 className="font-heading text-3xl font-bold mb-4">Asegura tu fecha antes de que se ocupe 🎉</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Escríbenos por WhatsApp y te respondemos en menos de 1 hora.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/cotizador">Cotizador Interactivo</Link>
            </Button>
            <Button variant="whatsapp" size="lg" asChild>
              <a href="https://wa.me/528180540369" target="_blank" rel="noopener noreferrer">WhatsApp · 8180540369</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
