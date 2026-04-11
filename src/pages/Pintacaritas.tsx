import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const incluye = [
  "Diseños en cara y mano de variados personajes",
  "Glitter tattoos infantiles",
  "Glitter para cabello",
  "Materiales profesionales hipoalergénicos",
  "Servicio de 1.5 horas continuas",
];

const personajes = [
  "Mariposas", "Flores", "Spiderman", "Batman", "Princesas",
  "Unicornio", "Estrellas", "Corazones", "Dinosaurios", "Superhéroes",
  "Animales", "Calaveras de azúcar", "Arcoíris", "Caritas felices",
];

const faqs = [
  {
    q: "¿Para qué edades es apto?",
    a: "Desde los 3 años en adelante. Para niños muy pequeños se recomienda supervisión de los padres.",
  },
  {
    q: "¿Las pinturas son seguras?",
    a: "Sí, usamos pinturas faciales hipoalergénicas y aprobadas para uso en piel infantil.",
  },
  {
    q: "¿Cuántos niños puede atender en 1.5 hrs?",
    a: "Aproximadamente 15–20 niños dependiendo de la complejidad del diseño.",
  },
  {
    q: "¿Se puede extender el tiempo?",
    a: "Sí, con costo adicional. Consultanos disponibilidad el día del evento.",
  },
];

const Pintacaritas = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-purple-50 via-pink-50 to-white py-20 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase mb-3">
            Servicio artístico
          </p>
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4">
            Pintacaritas
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Transformamos las caritas de los peques en obras de arte. Diseños divertidos,
            glitter y mucha magia para hacer tu fiesta inolvidable.
          </p>
          <div className="mt-8 inline-block bg-primary text-primary-foreground rounded-full px-6 py-2 font-heading font-bold text-2xl">
            $800 MXN · 1.5 horas
          </div>
        </div>
      </section>

      {/* Qué incluye */}
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-heading text-3xl font-bold mb-6">¿Qué incluye?</h2>
            <ul className="space-y-3">
              {incluye.map((item) => (
                <li key={item} className="flex items-start gap-3 text-foreground/80">
                  <Check size={18} className="text-primary mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { emoji: "🎨", label: "Cara y mano" },
              { emoji: "✨", label: "Glitter tattoos" },
              { emoji: "💫", label: "Glitter cabello" },
              { emoji: "🌈", label: "Variedad de diseños" },
            ].map((f) => (
              <div
                key={f.label}
                className="bg-gradient-to-b from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-5 text-center shadow-sm"
              >
                <div className="text-3xl mb-2">{f.emoji}</div>
                <p className="font-semibold text-sm">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personajes */}
      <section className="bg-gradient-to-b from-pink-50 to-white py-14 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-2xl font-bold mb-2">Algunos diseños populares</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Muchos más disponibles — ¡preguntanos por tu personaje favorito!
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {personajes.map((p) => (
              <span
                key={p}
                className="bg-white border border-pink-200 rounded-full px-3 py-1 text-sm font-medium shadow-sm"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="container mx-auto px-4 py-14 max-w-3xl">
        <h2 className="font-heading text-2xl font-bold text-center mb-8">¿Cómo funciona?</h2>
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          {[
            { step: "1", title: "Reserva tu fecha", desc: "Agenda el servicio con anticipación junto con tu evento." },
            { step: "2", title: "El día del evento", desc: "La pintacaritas llega a tu domicilio lista para empezar." },
            { step: "3", title: "1.5 horas de magia", desc: "Los niños hacen fila y salen transformados con su diseño favorito." },
          ].map((s) => (
            <div key={s.step} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-heading font-bold text-lg flex items-center justify-center mx-auto mb-3">
                {s.step}
              </div>
              <h3 className="font-heading font-bold mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 py-14 px-4">
        <div className="container mx-auto max-w-2xl">
          <h2 className="font-heading text-2xl font-bold text-center mb-8">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <p className="font-semibold mb-1">{faq.q}</p>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-purple-100 to-pink-100 py-14 px-4 text-center">
        <h2 className="font-heading text-2xl font-bold mb-3">
          Agrega pintacaritas a tu fiesta
        </h2>
        <p className="text-muted-foreground mb-6">$800 MXN · 1.5 horas · A domicilio</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="whatsapp" size="lg" asChild>
            <a
              href={`https://wa.me/528180540369?text=${encodeURIComponent(
                "Hola! Me interesa el servicio de Pintacaritas para mi fiesta ($800 MXN)"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contratar por WhatsApp
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

export default Pintacaritas;
