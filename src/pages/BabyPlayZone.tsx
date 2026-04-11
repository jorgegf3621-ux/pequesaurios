import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const paquetes = [
  {
    id: "inflable-solo",
    nombre: "Inflable Castillo",
    subtitulo: "Ideal para bebés y toddlers de 1 a 5 años",
    precio: 800,
    popular: false,
    nota: "No incluye flete. Agrega guirnalda de globos por $200 pesos.",
    items: [
      "Inflable blanco 3×3 × 2.5 m de alto",
      "Resbaladilla incluida",
      "Alberca de pelotas",
      "Renta por 5 horas",
    ],
    color: "border-sky-200",
    bg: "from-sky-50 to-white",
  },
  {
    id: "paquete-basico",
    nombre: "Paquete Básico",
    subtitulo: "Inflable & mesita",
    precio: 1200,
    popular: false,
    nota: "Flete incluido en San Nicolás.",
    items: [
      "Inflable blanco 3×3 × 2.5 m con resbaladilla y alberca de pelotas",
      "Mesita de madera color blanco",
      "8 sillas infantiles de figuras blancas (arcoíris y conejito)",
      "Montaje e instalación",
      "Renta por 5 horas",
    ],
    color: "border-green-200",
    bg: "from-green-50 to-white",
  },
  {
    id: "paquete-plus",
    nombre: "Paquete Plus",
    subtitulo: "Inflable & mesita de arte",
    precio: 1400,
    popular: true,
    nota: "Flete incluido en San Nicolás.",
    items: [
      "Inflable blanco 3×3 × 2.5 m con resbaladilla y alberca de pelotas",
      "Mesita de madera color blanco",
      "8 sillas infantiles de figuras blancas (arcoíris y conejito)",
      "Área creativa: dibujitos, crayolas, papel kraft y stickers",
      "Montaje e instalación",
      "Renta por 5 horas",
    ],
    color: "border-primary",
    bg: "from-primary/5 to-white",
  },
];

const BabyPlayZone = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#fef6ee] to-white py-20 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase mb-3">
            @pequesaurios
          </p>
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-2">
            <span className="text-sky-400">Baby</span>{" "}
            <span className="text-green-400">Play Zone</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
            Creamos un espacio especial para los invitados más pequeños de tu fiesta.
            Seguro, lindo y lleno de diversión.
          </p>
        </div>
      </section>

      {/* Paquetes */}
      <section className="container mx-auto px-4 py-16 max-w-5xl">
        <h2 className="font-heading text-3xl font-bold text-center mb-10">
          Nuestros Paquetes
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {paquetes.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-2xl border-2 ${pkg.color} bg-gradient-to-b ${pkg.bg} shadow-sm hover:shadow-lg transition-shadow flex flex-col`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4">
                  Más Popular
                </Badge>
              )}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-heading text-xl font-bold">{pkg.nombre}</h3>
                <p className="text-sm text-muted-foreground mb-4">{pkg.subtitulo}</p>
                <p className="font-heading text-4xl font-bold text-primary mb-1">
                  ${pkg.precio.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mb-6">MXN · 5 horas</p>
                <ul className="flex-1 space-y-2 mb-6">
                  {pkg.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                {pkg.nota && (
                  <p className="text-xs text-muted-foreground mb-4">* {pkg.nota}</p>
                )}
                <Button
                  variant={pkg.popular ? "hero" : "outline"}
                  className="w-full"
                  asChild
                >
                  <a
                    href={`https://wa.me/528180540369?text=${encodeURIComponent(
                      `Hola! Me interesa el ${pkg.nombre} de Baby Play Zone ($${pkg.precio.toLocaleString()} MXN)`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Cotizar este paquete
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Detalle del inflable */}
      <section className="bg-[#fef6ee] py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-2xl font-bold mb-4">
            El inflable perfecto para los mas chiquitos
          </h2>
          <p className="text-muted-foreground mb-8">
            Nuestro inflable blanco 3×3 es suave, seguro y disenado especialmente para bebes y
            toddlers de 1 a 5 anos. Incluye resbaladilla y alberca de pelotas para horas de
            entretenimiento.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            {[
              { emoji: "🛝", label: "Resbaladilla suave" },
              { emoji: "⚽", label: "Alberca de pelotas" },
              { emoji: "🏰", label: "Castillo 3×3 m" },
            ].map((f) => (
              <div key={f.label} className="bg-white rounded-xl p-5 border border-border shadow-sm">
                <div className="text-3xl mb-2">{f.emoji}</div>
                <p className="font-semibold text-sm">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notas importantes */}
      <section className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <h2 className="font-heading text-xl font-bold mb-4">Notas importantes</h2>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Las fechas son limitadas por fin de semana — agenda con anticipacion.</li>
          <li>• Flete incluido en San Nicolas en paquetes Basico y Plus.</li>
          <li>• Para otras zonas de Monterrey, consultanos el costo de flete.</li>
          <li>• Puedes agregar guirnalda de globos por $200 pesos adicionales.</li>
        </ul>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-sky-100 to-green-100 py-14 px-4 text-center">
        <h2 className="font-heading text-2xl font-bold mb-3">
          Agenda tu Baby Play Zone
        </h2>
        <p className="text-muted-foreground mb-6">
          Fechas limitadas por fin de semana
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="whatsapp" size="lg" asChild>
            <a
              href="https://wa.me/528180540369"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contactar por WhatsApp
            </a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/reservaciones">Reservar fecha</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default BabyPlayZone;
