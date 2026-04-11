import { PartyPopper, Palette, Sparkles, Table, Brush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import inflableImg from "@/assets/catalog-inflable.jpg";
import pintacaritasImg from "@/assets/pintacaritas.jpg";
import yesitosImg from "@/assets/yesitos.jpg";
import mesitaImg from "@/assets/catalog-mesita.jpg";
import babyPlayImg from "@/assets/baby-play-zone.jpg";

const services = [
  {
    icon: PartyPopper,
    title: "Inflable Castillo",
    desc: "Inflable blanco 3x3m con resbaladilla, alberca de pelotas, tiro al blanco y canasta de basketball. Ideal para niños de 1 a 4 años.",
    price: "$1,300 MXN",
    duration: "5 horas",
    img: inflableImg,
    color: "bg-lavender",
  },
  {
    icon: Table,
    title: "Mesa Infantil Pastel",
    desc: "Mesita de madera con 6 sillitas de plástico en tonos pastel (rosa, azul, morado, amarillo).",
    price: "$500 MXN",
    duration: "5 horas · Renta mín. 2",
    img: mesitaImg,
    color: "bg-mint",
  },
  {
    icon: Table,
    title: "Mesita Infantil Blanca",
    desc: "Mesita de madera con 8 sillitas de madera blancas. Figuras disponibles: arcoíris y conejito.",
    price: "$750 MXN",
    duration: "5 horas · Renta mín. 2",
    img: mesitaImg,
    color: "bg-peach",
  },
  {
    icon: Brush,
    title: "Arte en Mesa",
    desc: "30 dibujos, crayolas y stickers al centro para actividades creativas durante la fiesta.",
    price: "$150 MXN",
    duration: "Complemento",
    img: babyPlayImg,
    color: "bg-pastel-yellow",
  },
  {
    icon: Sparkles,
    title: "Kits de Yesitos",
    desc: "Cada kit incluye 2 figuras de yeso, 3 colores de pintura, 1 pincel, 1 sticker sorpresa y bolsa personalizada.",
    price: "$20 MXN c/u",
    duration: "Recuerdos de fiesta",
    img: yesitosImg,
    color: "bg-lavender",
  },
  {
    icon: Palette,
    title: "Pintacaritas",
    desc: "Variedad de personajes, dibujos en cara y mano, glitter tattoos infantiles y glitter para cabello.",
    price: "$800 MXN",
    duration: "1.5 horas",
    img: pintacaritasImg,
    color: "bg-mint",
  },
];

const Servicios = () => (
  <div className="container mx-auto px-4 py-12">
    <h1 className="font-heading text-4xl font-bold text-center mb-2">Nuestros Servicios</h1>
    <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
      Todo lo que necesitas para crear una experiencia mágica para los más pequeños 🌈
    </p>

    <div className="grid md:grid-cols-2 gap-8">
      {services.map((s) => (
        <div key={s.title} className="flex flex-col sm:flex-row bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
          <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
            <img src={s.img} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div className="p-6 flex flex-col justify-between flex-1">
            <div>
              <div className={`inline-flex p-2 rounded-lg ${s.color} mb-2`}>
                <s.icon size={20} className="text-foreground" />
              </div>
              <h3 className="font-heading text-xl font-bold mb-1">{s.title}</h3>
              <p className="text-muted-foreground text-sm mb-3">{s.desc}</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-heading font-bold text-lg text-primary">{s.price}</span>
                <span className="text-xs text-muted-foreground ml-2">{s.duration}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="text-center mt-12">
      <p className="text-muted-foreground mb-4">¿No encuentras lo que buscas? ¡Escríbenos!</p>
      <Button variant="whatsapp" size="lg" asChild>
        <a href="https://wa.me/528180540369" target="_blank" rel="noopener noreferrer">
          Consultar por WhatsApp
        </a>
      </Button>
    </div>
  </div>
);

export default Servicios;
