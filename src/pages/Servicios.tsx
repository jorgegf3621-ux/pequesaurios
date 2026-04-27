import { Palette, Sparkles, Baby, ArrowRight, Armchair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const categorias = [
  {
    icon: Baby,
    title: "Baby Play Zone",
    desc: "Un espacio seguro y divertido para los invitados más pequeños. Incluye inflable castillo con resbaladilla, alberca de pelotas y opciones de mesita.",
    desde: "$800",
    href: "/baby-play-zone",
    color: "from-sky-100 to-green-50",
    border: "border-sky-200",
    iconColor: "text-sky-500",
    tag: "Bebés 1–5 años",
  },
  {
    icon: Armchair,
    title: "Mobiliario Infantil",
    desc: "Mesita de madera blanca con sillas infantiles arcoíris. Perfecta para snacks, manualidades y actividades durante tu fiesta.",
    desde: "$500",
    href: "/servicios",
    color: "from-teal-50 to-green-50",
    border: "border-teal-200",
    iconColor: "text-teal-500",
    tag: "Mesitas & sillas",
  },
  {
    icon: Sparkles,
    title: "Actividad Creativa · Yesitos",
    desc: "Los peques pintan sus propias figuras de yeso y se las llevan como recuerdo. Bolsas personalizadas según la temática de tu fiesta.",
    desde: "$20 c/u",
    href: "/actividad-creativa",
    color: "from-yellow-50 to-pink-50",
    border: "border-yellow-200",
    iconColor: "text-yellow-500",
    tag: "Recuerdos creativos",
  },
  {
    icon: Palette,
    title: "Pintacaritas",
    desc: "Variedad de personajes, dibujos en cara y mano, glitter tattoos y glitter para cabello.",
    desde: "$800",
    href: "/pintacaritas",
    color: "from-purple-50 to-pink-50",
    border: "border-purple-200",
    iconColor: "text-purple-500",
    tag: "1.5 horas",
  },
];


const Servicios = () => (
  <div className="min-h-screen">
    {/* Hero */}
    <section className="bg-gradient-to-b from-[#fff5f8] to-white py-16 px-4 text-center">
      <div className="container mx-auto max-w-2xl">
        <h1 className="font-heading text-4xl font-bold mb-3">Nuestros Servicios</h1>
        <p className="text-muted-foreground text-lg">
          Todo lo que necesitas para crear una experiencia mágica para los más pequeños.
        </p>
      </div>
    </section>

    {/* Categorías principales */}
    <section className="container mx-auto px-4 py-14 max-w-5xl">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categorias.map((cat) => (
          <Link
            key={cat.href}
            to={cat.href}
            className={`group rounded-2xl border-2 ${cat.border} bg-gradient-to-b ${cat.color} p-6 shadow-sm hover:shadow-lg transition-all flex flex-col`}
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-sm mb-4`}>
              <cat.icon size={22} className={cat.iconColor} />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              {cat.tag}
            </span>
            <h2 className="font-heading text-xl font-bold mb-2 group-hover:text-primary transition-colors">
              {cat.title}
            </h2>
            <p className="text-sm text-muted-foreground flex-1 mb-4">{cat.desc}</p>
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-primary text-lg">
                Desde {cat.desde}
              </span>
              <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </section>


    {/* CTA */}
    <section className="py-14 px-4 text-center">
      <div className="container mx-auto max-w-xl">
        <h2 className="font-heading text-2xl font-bold mb-3">¿Listo para reservar?</h2>
        <p className="text-muted-foreground mb-6">
          Arma tu paquete ideal o contáctanos directamente.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="hero" size="lg" asChild>
            <Link to="/cotizador">Usar el cotizador</Link>
          </Button>
          <Button variant="whatsapp" size="lg" asChild>
            <a href="https://wa.me/528180540369" target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  </div>
);

export default Servicios;
