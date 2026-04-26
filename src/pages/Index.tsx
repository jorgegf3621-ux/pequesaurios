import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Check } from "lucide-react";
import heroImg from "@/assets/hero-party.jpg";
import inflableImg from "@/assets/inflable-castillo.png";
import mesitaImg from "@/assets/mesita-blanca.png";
import bpzImg from "@/assets/baby-play-zone.jpg";
import catalogInflableImg from "@/assets/catalog-inflable.jpg";
import catalogMesitaImg from "@/assets/catalog-mesita.jpg";
import paquetePlusImg from "@/assets/paquete-plus.jpg";

const paquetes = [
  {
    title: "Inflable Castillo",
    subtitulo: "Ideal para bebés y toddlers de 1 a 5 años",
    precio: 800,
    nota: "No incluye flete · Agrega guirnalda de globos por $200",
    items: [
      "Inflable blanco 3×3 × 2.5 m de alto",
      "Resbaladilla incluida",
      "Alberca de pelotas",
      "Renta por 5 horas",
    ],
    img: inflableImg,
    color: "bg-lavender",
    popular: false,
  },
  {
    title: "Paquete Básico",
    subtitulo: "Inflable & mesita",
    precio: 1200,
    nota: "Flete incluido en San Nicolás",
    items: [
      "Inflable blanco 3×3 × 2.5 m de alto",
      "Resbaladilla y alberca de pelotas",
      "Mesita de madera color blanco",
      "8 sillas infantiles (arcoiris y conejito)",
      "Montaje e instalación",
      "Renta por 5 horas",
    ],
    img: mesitaImg,
    color: "bg-peach",
    popular: false,
  },
  {
    title: "Paquete Plus",
    subtitulo: "Inflable & mesita de arte",
    precio: 1400,
    nota: "Flete incluido en San Nicolás",
    items: [
      "Inflable blanco 3×3 × 2.5 m de alto",
      "Resbaladilla y alberca de pelotas",
      "Mesita de madera color blanco",
      "8 sillas infantiles (arcoiris y conejito)",
      "Área creativa: dibujitos, crayolas, papel kraft y stickers",
      "Montaje e instalación",
      "Renta por 5 horas",
    ],
    img: paquetePlusImg,
    color: "bg-mint",
    popular: true,
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

const Index = () => {
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
              <Link to="/catalogo">Ver paquetes</Link>
            </Button>
            <Button variant="whatsapp" size="lg" asChild>
              <a href="https://wa.me/528180540369?text=%C2%A1Hola!%20Quiero%20cotizar%20Baby%20Play%20Zone" target="_blank" rel="noopener noreferrer">
                Cotizar por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Paquetes */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-2">Nuestros Paquetes</h2>
        <p className="text-muted-foreground text-center mb-12">Renta por 5 horas · Bebés y toddlers de 1 a 5 años</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {paquetes.map((p) => (
            <div key={p.title} className={`group rounded-2xl overflow-hidden bg-card border-2 shadow-sm hover:shadow-lg transition-all relative ${p.popular ? "border-primary" : "border-border"}`}>
              {p.popular && (
                <div className="absolute top-3 right-3 z-10 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  Más popular
                </div>
              )}
              <div className="h-52 overflow-hidden">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" width={800} height={600} />
              </div>
              <div className="p-6">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${p.color} mb-3`}>
                  {p.subtitulo}
                </div>
                <h3 className="font-heading text-xl font-bold mb-3">{p.title}</h3>
                <ul className="space-y-1.5 mb-4">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border pt-4">
                  <p className="text-primary font-heading font-bold text-2xl">${p.precio.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">MXN</span></p>
                  <p className="text-xs text-muted-foreground mt-1">{p.nota}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button variant="outline" size="lg" asChild>
            <Link to="/catalogo">Ver catálogo completo</Link>
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
