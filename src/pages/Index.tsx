import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, PartyPopper, Palette, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-party.jpg";
import inflableImg from "@/assets/inflable-castillo.png";
import pintacaritasImg from "@/assets/pintacaritas.jpg";
import yesitosImg from "@/assets/yesitos.jpg";

import mesitaImg from "@/assets/mesita-blanca.png";
import { Table } from "lucide-react";

const services = [
  { icon: PartyPopper, title: "Inflables", desc: "Castillo inflable blanco con resbaladilla y alberca de pelotas", color: "bg-lavender", img: inflableImg },
  { icon: Table, title: "Mobiliario Infantil", desc: "Mesitas y sillitas en tonos pastel, perfectas para los más pequeños", color: "bg-peach", img: mesitaImg },
  { icon: Palette, title: "Pintacaritas", desc: "Variedad de personajes, glitter tattoos y más diversión", color: "bg-mint", img: pintacaritasImg },
  { icon: Sparkles, title: "Kits de Yesitos", desc: "Figuritas para pintar, perfectas como recuerdos de fiesta", color: "bg-pastel-yellow", img: yesitosImg },
];

const testimonials = [
  { name: "María G.", text: "¡Los niños la pasaron increíble! El inflable y la mesita quedaron hermosos. 100% recomendado.", rating: 5 },
  { name: "Ana L.", text: "Excelente servicio, puntuales y todo muy limpio. Mis hijos no querían que se acabara la fiesta.", rating: 5 },
  { name: "Sofía R.", text: "Los yesitos fueron el hit de la fiesta. Los niños se divirtieron muchísimo pintando.", rating: 5 },
];

const Index = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Fiesta infantil Pequesaurios" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36 text-center">
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-4 animate-fade-in-up">
            ¡Haz de tu fiesta algo <span className="text-gradient-brand">mágico!</span> 🦕
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-8 font-body">
            Renta de mobiliario infantil, inflables y actividades para los más pequeños en Monterrey, N.L.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/catalogo">Ver Catálogo</Link>
            </Button>
            <Button variant="whatsapp" size="lg" asChild>
              <a href="https://wa.me/528180540369?text=%C2%A1Hola!%20Quiero%20cotizar" target="_blank" rel="noopener noreferrer">
                Cotizar por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-2">Nuestros Servicios</h2>
        <p className="text-muted-foreground text-center mb-12">Todo lo que necesitas para una fiesta inolvidable</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((s) => (
            <div key={s.title} className="group rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-lg transition-all">
              <div className="h-48 overflow-hidden">
                <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" width={800} height={800} />
              </div>
              <div className="p-6">
                <div className={`inline-flex p-2 rounded-lg ${s.color} mb-3`}>
                  <s.icon size={24} className="text-foreground" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
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

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-lavender/30 via-mint/30 to-peach/30 rounded-3xl p-12">
          <h2 className="font-heading text-3xl font-bold mb-4">¿Lista para la fiesta? 🎉</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Cotiza tu paquete en minutos o usa nuestro cotizador interactivo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/cotizador">Cotizador Interactivo</Link>
            </Button>
            <Button variant="whatsapp" size="lg" asChild>
              <a href="https://wa.me/528180540369" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
