import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const kits = [
  {
    id: "basico",
    nombre: "Kit Básico",
    precio: 20,
    items: ["1 yesito de personaje", "1 pintura", "1 pincel", "Sticker sorpresa", "Bolsa + etiqueta personalizada"],
    color: "border-yellow-200 bg-yellow-50",
    btnVariant: "outline" as const,
  },
  {
    id: "intermedio",
    nombre: "Kit Intermedio",
    precio: 25,
    items: ["2 yesitos de personajes", "2 pinturas", "1 pincel", "Sticker sorpresa", "Bolsa + etiqueta personalizada"],
    color: "border-primary bg-primary/5",
    btnVariant: "hero" as const,
    popular: true,
  },
  {
    id: "completo",
    nombre: "Kit Completo",
    precio: 30,
    items: ["3 yesitos de personajes", "3 pinturas", "1 pincel", "Sticker sorpresa", "Bolsa + etiqueta personalizada"],
    color: "border-purple-200 bg-purple-50",
    btnVariant: "outline" as const,
  },
];

const personajes = [
  "Bluey", "Sonic", "Mario Bros", "Spiderman", "Dinosaurios", "Videojuegos",
  "Capibara", "Plim Plim", "Carros", "Huevitos de Pascua", "Hello Kitty",
  "Kuromi", "Unicornio", "Mickey", "Minnie", "Helados", "Donas",
  "Ositos", "Astronauta",
];

const entrega = [
  "Soriana Fresnos",
  "Soriana Sendero",
  "Escobedo",
  "HEB Sendero",
  "HEB Concordia",
  "HEB Diego Díaz",
  "Colonia Las Brisas",
];

const ActividadCreativa = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-yellow-50 via-pink-50 to-white py-20 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase mb-3">
            Actividad creativa
          </p>
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4">
            Kit de Yesitos
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Una actividad divertida y creativa donde los peques pintan sus propias figuras de yeso
            para llevarse como recuerdo de la fiesta.
          </p>
        </div>
      </section>

      {/* Kits */}
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <h2 className="font-heading text-3xl font-bold text-center mb-2">Elige tu Kit</h2>
        <p className="text-muted-foreground text-center mb-10">
          Precio por pieza · Pedido mínimo 10 piezas
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {kits.map((kit) => (
            <div
              key={kit.id}
              className={`relative rounded-2xl border-2 ${kit.color} shadow-sm hover:shadow-lg transition-shadow flex flex-col p-6`}
            >
              {kit.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                  Más Popular
                </div>
              )}
              <h3 className="font-heading text-xl font-bold mb-1">{kit.nombre}</h3>
              <p className="font-heading text-4xl font-bold text-primary mb-1">
                ${kit.precio}
              </p>
              <p className="text-xs text-muted-foreground mb-5">MXN por pieza</p>
              <ul className="flex-1 space-y-2 mb-6">
                {kit.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check size={15} className="text-primary mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant={kit.btnVariant} className="w-full" asChild>
                <a
                  href={`https://wa.me/528180540369?text=${encodeURIComponent(
                    `Hola! Me interesa el ${kit.nombre} de Yesitos ($${kit.precio} MXN c/u)`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Pedir este kit
                </a>
              </Button>
            </div>
          ))}
        </div>

        {/* Reglas */}
        <div className="mt-8 bg-muted/50 rounded-xl border border-border p-6 text-sm text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground mb-2">Notas importantes:</p>
          <p>• Pedido mínimo de <strong>10 piezas</strong>.</p>
          <p>• Más de <strong>20 piezas</strong>: $1 menos por bolsita.</p>
          <p>• Pedir con <strong>mínimo 7 días de anticipación</strong>.</p>
          <p>• La etiqueta personalizada se diseña según la temática de tu fiesta.</p>
        </div>
      </section>

      {/* Personajes */}
      <section className="bg-gradient-to-b from-pink-50 to-white py-14 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-center mb-2">Personajes disponibles</h2>
          <p className="text-muted-foreground text-center mb-8 text-sm">
            Tenemos una gran variedad — si no ves tu personaje, pregúntanos.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {personajes.map((p) => (
              <span
                key={p}
                className="bg-white border border-border rounded-full px-3 py-1 text-sm font-medium shadow-sm"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Puntos de entrega */}
      <section className="container mx-auto px-4 py-14 max-w-2xl">
        <h2 className="font-heading text-2xl font-bold text-center mb-2">Puntos de entrega</h2>
        <p className="text-muted-foreground text-center mb-8 text-sm">
          Coordinamos la entrega en estos puntos de la zona metropolitana.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {entrega.map((punto) => (
            <div
              key={punto}
              className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 shadow-sm"
            >
              <span className="text-primary text-lg">📍</span>
              <span className="text-sm font-medium">{punto}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-yellow-100 to-pink-100 py-14 px-4 text-center">
        <h2 className="font-heading text-2xl font-bold mb-3">
          ¿Lista para pedir tus Yesitos?
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Recuerda pedirlos con al menos 7 días de anticipación
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="whatsapp" size="lg" asChild>
            <a
              href="https://wa.me/528180540369"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pedir por WhatsApp
            </a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/cotizador">Ver cotizador</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ActividadCreativa;
