import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";

const paquetes = [
  {
    id: "cab-dino-baby",
    nombre: "Paquete Dino Baby",
    subtitulo: "Caballetes dobles",
    descripcion: "Ideal para cumpleaños o reuniones: cada niño pinta y se lleva su obra de arte.",
    precio: 900,
    popular: false,
    nota: "No incluye flete.",
    items: [
      "3 caballetes dobles",
      "6 sillitas y mandiles",
      "Dibujos ilimitados",
      "Pinturas y pinceles",
      "Toallitas húmedas",
      "1.5 hrs de servicio con personal de apoyo",
    ],
    color: "border-yellow-200",
    bg: "from-yellow-50 to-white",
  },
  {
    id: "cab-dino-creativo",
    nombre: "Paquete Dino Creativo",
    subtitulo: "Caballetes & yesitos",
    descripcion: "¡El match perfecto! Pintura en caballete más yesitos para llevarse de recuerdo.",
    precio: 1300,
    popular: false,
    nota: "No incluye flete.",
    items: [
      "3 caballetes dobles",
      "6 sillitas y mandiles",
      "Dibujos ilimitados",
      "Pinturas y pinceles",
      "Toallitas húmedas",
      "1 mesa y 6 sillas",
      "30 yesitos para pintar",
      "1.5 hrs de servicio con personal de apoyo",
    ],
    color: "border-purple-200",
    bg: "from-purple-50 to-white",
  },
  {
    id: "cab-dino-fun",
    nombre: "Paquete Dino Fun",
    subtitulo: "Caballetes & pintacaritas",
    descripcion: "Creatividad + diversión: ¡los niños pintan y se transforman en sus personajes favoritos!",
    precio: 1700,
    popular: true,
    nota: "No incluye flete.",
    items: [
      "3 caballetes dobles",
      "6 sillitas y mandiles",
      "Dibujos ilimitados",
      "Pinturas y pinceles",
      "Toallitas húmedas",
      "Pintacaritas: variedad de personajes",
      "Dibujos en cara y mano",
      "Glitter tattos infantiles",
      "Glitter para cabello",
      "1.5 hrs de servicio con personal de apoyo",
    ],
    color: "border-primary",
    bg: "from-primary/5 to-white",
  },
];

const ActividadCreativa = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-yellow-50 via-pink-50 to-white py-20 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase mb-3">
            @pequesaurios
          </p>
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4">
            Caballetes & Color
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Llevamos los caballetes a tu fiesta para que los peques pinten, creen y se lleven
            su obra de arte como recuerdo.
          </p>
        </div>
      </section>

      {/* Paquetes */}
      <section className="container mx-auto px-4 py-16 max-w-5xl">
        <h2 className="font-heading text-3xl font-bold text-center mb-10">
          Elige tu Paquete
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
                <p className="text-sm text-muted-foreground mb-1">{pkg.subtitulo}</p>
                <p className="text-xs text-foreground/60 italic mb-4">{pkg.descripcion}</p>
                <p className="font-heading text-4xl font-bold text-primary mb-1">
                  ${pkg.precio.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mb-6">MXN · 1.5 horas</p>
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
                  onClick={() => navigate(`/cotizador?paquete=${pkg.id}`)}
                >
                  Cotizar este paquete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Info adicional */}
      <section className="bg-gradient-to-b from-yellow-50 to-white py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-2xl font-bold mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-muted-foreground mb-8">
            Llegamos antes de tu evento, instalamos todo y acompañamos a los niños
            durante la actividad. Al terminar, cada niño se lleva su obra de arte.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            {[
              { emoji: "🎨", label: "Caballetes dobles" },
              { emoji: "🦕", label: "Personal de apoyo" },
              { emoji: "🖼️", label: "Se llevan su obra" },
            ].map((f) => (
              <div key={f.label} className="bg-white rounded-xl p-5 border border-border shadow-sm">
                <div className="text-3xl mb-2">{f.emoji}</div>
                <p className="font-semibold text-sm">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notas */}
      <section className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <h2 className="font-heading text-xl font-bold mb-4">Notas importantes</h2>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Servicio de 1.5 horas con personal de apoyo incluido.</li>
          <li>• Ningún paquete incluye flete — se cotiza según tu ubicación.</li>
          <li>• Fechas limitadas por fin de semana — agenda con anticipación.</li>
          <li>• Para agregar más caballetes o sillas, consúltanos.</li>
        </ul>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-yellow-100 to-pink-100 py-14 px-4 text-center">
        <h2 className="font-heading text-2xl font-bold mb-3">
          Agenda tu Caballetes & Color
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
            <Link to="/cotizador">Ver cotizador</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ActividadCreativa;
