import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Info } from "lucide-react";
import mesitaImg from "@/assets/catalog-mesita.jpg";
import mesitaBlancaImg from "@/assets/mesita-blanca.png";

const MobiliarioInfantil = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-pink-50 via-purple-50 to-white py-20 px-4 text-center overflow-hidden">
        <div className="container mx-auto max-w-3xl relative z-10">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase mb-3">
            @pequesaurios
          </p>
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4">
            Mobiliario Infantil
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Mesita de madera blanca con sillas infantiles para que los peques
            estén cómodos durante su fiesta.
          </p>
          <Button
            variant="hero"
            size="lg"
            onClick={() => navigate("/cotizador?paquete=mesa-blanca")}
          >
            Cotizar
          </Button>
        </div>
      </section>

      {/* Producto */}
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="rounded-3xl overflow-hidden shadow-lg aspect-[4/3]">
            <img
              src={mesitaImg}
              alt="Mesita infantil blanca"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
              Favorito Mamás
            </span>
            <h2 className="font-heading text-3xl font-bold mb-2">
              Mesita de Madera Blanca
            </h2>
            <p className="text-muted-foreground mb-6">
              Mesa de madera color blanco acompañada de 8 sillas infantiles a
              juego. Ideal para snacks, pastel, actividades creativas y más.
            </p>

            <ul className="space-y-2 mb-6">
              {[
                "1 mesita de madera color blanco",
                "8 sillas infantiles incluidas",
                "Disponibles hasta 2 mesas",
                "Entrega y recolección incluidas",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-foreground/80"
                >
                  <Check size={15} className="text-primary mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6">
              <p className="font-heading text-4xl font-bold text-primary">
                $500
              </p>
              <p className="text-sm text-muted-foreground">MXN por mesa</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="hero"
                size="lg"
                className="flex-1"
                onClick={() => navigate("/cotizador?paquete=mesa-blanca")}
              >
                Cotizar este servicio
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                asChild
              >
                <a
                  href="https://wa.me/528180540369?text=%C2%A1Hola!%20Me%20interesa%20rentar%20el%20Mobiliario%20Infantil%20(mesita%20blanca)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Preguntar por WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Estilos de sillas */}
      <section className="bg-gradient-to-b from-purple-50 to-white py-14 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-center mb-2">
            Elige el estilo de sillas
          </h2>
          <p className="text-muted-foreground text-center mb-10 text-sm">
            Ambas opciones están incluidas en el mismo precio de $500
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Opción A */}
            <div className="bg-white border-2 border-pink-200 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center gap-4">
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-pink-50 flex items-center justify-center">
                <img
                  src={mesitaBlancaImg}
                  alt="Sillas de colores pasteles"
                  className="w-full h-full object-contain p-4"
                />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg mb-1">
                  Sillas Pasteles
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sillas de colores suaves: rosa, lila, menta y amarillo.
                  Perfectas para cualquier temática.
                </p>
              </div>
            </div>

            {/* Opción B */}
            <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center gap-4">
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-purple-50 flex items-center justify-center">
                <img
                  src={mesitaBlancaImg}
                  alt="Sillas conejito y arcoíris"
                  className="w-full h-full object-contain p-4"
                />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg mb-1">
                  Sillas Conejito & Arcoíris
                </h3>
                <p className="text-sm text-muted-foreground">
                  Figuras blancas en forma de conejito y arcoíris. Adorables
                  para fiestas de bebés y temáticas tiernas.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-start gap-3 bg-muted/50 border border-border rounded-xl p-4 text-sm text-muted-foreground">
            <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
            <p>
              Disponemos de hasta <strong>2 mesas</strong> en simultáneo.
              Menciona cuántas necesitas al cotizar y confirmamos disponibilidad.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-pink-100 to-purple-100 py-14 px-4 text-center">
        <h2 className="font-heading text-2xl font-bold mb-3">
          ¿Lista para apartar la mesita?
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Combínala con un inflable o actividad creativa para una fiesta completa
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="hero"
            size="lg"
            onClick={() => navigate("/cotizador?paquete=mesa-blanca")}
          >
            Cotizar ahora
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="/baby-play-zone">Ver paquetes BPZ</a>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default MobiliarioInfantil;
