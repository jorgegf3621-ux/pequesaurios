import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const packages = [
  {
    name: "Inflable Castillo",
    price: "$1,300",
    popular: false,
    color: "border-lavender",
    items: [
      "Inflable blanco 3x3m",
      "Resbaladilla y alberca de pelotas",
      "Tiro al blanco y canasta",
      "Ideal 1–4 años",
      "5 horas de renta",
    ],
    note: "No incluye flete",
  },
  {
    name: "Paquete Básico",
    subtitle: "Inflable + Mesita",
    price: "$1,500",
    popular: false,
    color: "border-mint",
    items: [
      "Inflable blanco 3x3m completo",
      "Mesita con 6 sillas pastel",
      "Montaje e instalación",
      "5 horas de renta",
    ],
    note: null,
  },
  {
    name: "Baby Play Zone Básico",
    subtitle: "Inflable + Mesita",
    price: "$1,200",
    popular: false,
    color: "border-peach",
    items: [
      "Inflable blanco 3x3m",
      "Resbaladilla y alberca de pelotas",
      "Mesita de madera blanca",
      "8 sillas infantiles (arcoíris y conejito)",
      "Montaje e instalación",
      "Flete incluido en San Nicolás",
      "5 horas de renta",
    ],
    note: null,
  },
  {
    name: "Baby Play Zone Plus",
    subtitle: "Inflable + Mesita de Arte",
    price: "$1,400",
    popular: true,
    color: "border-primary",
    items: [
      "Todo lo del paquete básico",
      "Área creativa: dibujos, crayolas, papel kraft y stickers",
      "Montaje e instalación",
      "Flete incluido en San Nicolás",
      "5 horas de renta",
    ],
    note: "¡Más popular!",
  },
  {
    name: "Paquete Premium",
    subtitle: "Inflable + Mesita Blanca",
    price: "$2,200",
    popular: false,
    color: "border-pastel-yellow",
    items: [
      "Inflable blanco 3x3m completo",
      "Mesita con 8 sillas de madera blancas",
      "Montaje e instalación",
      "5 horas de renta",
    ],
    note: null,
  },
];

const extras = [
  { name: "Arte en Mesa", price: "$150", desc: "30 dibujos, crayolas y stickers" },
  { name: "Kits de Yesitos", price: "$20 c/u", desc: "Figuras de yeso para pintar" },
  { name: "Pintacaritas", price: "$800", desc: "1.5 horas de servicio" },
  { name: "Guirnalda de globos", price: "$200", desc: "Para decorar el inflable" },
];

const Catalogo = () => (
  <div className="container mx-auto px-4 py-12">
    <h1 className="font-heading text-4xl font-bold text-center mb-2">Catálogo y Paquetes</h1>
    <p className="text-muted-foreground text-center mb-12">Elige el paquete ideal para tu evento 🎈</p>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <div
          key={pkg.name}
          className={`relative bg-card rounded-2xl border-2 ${pkg.color} p-6 shadow-sm hover:shadow-lg transition-shadow flex flex-col`}
        >
          {pkg.popular && (
            <Badge className="absolute -top-3 right-4 bg-primary text-primary-foreground">
              ⭐ Más Popular
            </Badge>
          )}
          <h3 className="font-heading text-xl font-bold">{pkg.name}</h3>
          {pkg.subtitle && <p className="text-sm text-muted-foreground">{pkg.subtitle}</p>}
          <p className="font-heading text-3xl font-bold text-primary mt-3 mb-4">
            {pkg.price} <span className="text-sm font-normal text-muted-foreground">MXN</span>
          </p>
          <ul className="flex-1 space-y-2 mb-6">
            {pkg.items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          {pkg.note && <p className="text-xs text-muted-foreground mb-3">* {pkg.note}</p>}
          <Button variant="hero" className="w-full" asChild>
            <a
              href={`https://wa.me/528180540369?text=${encodeURIComponent(`¡Hola! Me interesa el ${pkg.name} (${pkg.price} MXN)`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Cotizar este paquete
            </a>
          </Button>
        </div>
      ))}
    </div>

    {/* Extras */}
    <div className="mt-16">
      <h2 className="font-heading text-2xl font-bold text-center mb-8">Extras y Complementos ✨</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {extras.map((e) => (
          <div key={e.name} className="bg-muted/50 rounded-xl p-5 border border-border text-center">
            <h4 className="font-heading font-bold text-lg">{e.name}</h4>
            <p className="text-primary font-bold text-xl my-2">{e.price}</p>
            <p className="text-sm text-muted-foreground">{e.desc}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="text-center mt-12">
      <Button variant="outline" size="lg" asChild>
        <Link to="/cotizador">Usar Cotizador Interactivo</Link>
      </Button>
    </div>
  </div>
);

export default Catalogo;
