import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const FACEBOOK_URL = "https://www.facebook.com/share/1DvDRmqAGB/?mibextid=wwXIfr";

const LABELS = ["", "Podría mejorar", "Regular", "Bien", "Muy bien", "¡Excelente!"];

const Gracias = () => {
  const [searchParams] = useSearchParams();
  const nombre = searchParams.get("nombre") || "amiga";
  const nino = searchParams.get("nino") || "";
  const edad = searchParams.get("edad") || "";

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [texto, setTexto] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isHighRating = rating >= 4;

  const nombreFirma = nino.trim()
    ? `${nombre}${edad.trim() ? `, mamá de ${nino} (${edad} años)` : `, mamá de ${nino}`}`
    : nombre;

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    await (supabase as any).from("resenas").insert({
      nombre: nombreFirma,
      rating,
      texto: texto.trim() || null,
      visible: isHighRating && texto.trim().length > 0,
    });
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-7xl mb-5">💕</div>
          <h1 className="font-heading text-3xl font-bold mb-3">¡Muchas gracias!</h1>
          <p className="text-muted-foreground leading-relaxed">
            Tu opinión significa mucho para nosotras. ¡Esperamos verte pronto en otra fiesta especial!
          </p>
          <p className="text-sm text-primary font-semibold mt-5">— Equipo Pequesaurios</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white">
      <div className="container mx-auto px-4 py-14 max-w-md">

        {/* Header */}
        <div className="text-center mb-10">
          <img src={logo} alt="Pequesaurios" className="h-16 w-16 rounded-2xl object-cover mx-auto mb-4 shadow-md" />
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
            ¡Gracias, {nombre}!
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {nino
              ? `Fue un placer ser parte de la fiesta de ${nino}.`
              : "Fue un placer ser parte de la fiesta especial de su pequeño."}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-border/50 p-8">
          <p className="font-heading text-lg font-bold text-center mb-2">
            ¿Cómo fue tu experiencia?
          </p>
          <p className="text-xs text-muted-foreground text-center mb-6">
            Tu opinión nos ayuda a seguir mejorando
          </p>

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  size={48}
                  className={`transition-colors duration-150 ${
                    (hover || rating) >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm font-semibold text-primary h-5 mb-6">
            {LABELS[hover || rating]}
          </p>

          {/* Content after rating */}
          {rating > 0 && (
            <div className="space-y-5 animate-fade-in">
              {isHighRating ? (
                <>
                  <div className="text-center bg-green-50 border border-green-100 rounded-2xl p-4">
                    <p className="font-semibold text-sm mb-1 text-green-800">¡Qué alegría escucharlo! 💕</p>
                    <p className="text-xs text-green-700">
                      ¿Nos dejas una reseña rápida? Solo toma un minuto y nos ayuda a llegar a más familias.
                    </p>
                  </div>

                  <a
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-blue-400 text-gray-700 font-semibold text-sm py-3 rounded-2xl hover:bg-blue-50 transition-all w-full"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Dejar reseña en Facebook
                  </a>

                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground mb-2">
                      O escribe tu reseña aquí y la compartimos en nuestra página:
                    </p>
                    <textarea
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      placeholder="¡El servicio fue increíble! Los niños estuvieron entretenidos toda la fiesta..."
                      className="w-full border border-input rounded-xl px-3 py-2 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center bg-amber-50 border border-amber-100 rounded-2xl p-4">
                    <p className="font-semibold text-sm mb-1 text-amber-800">Lamentamos que no haya sido perfecto.</p>
                    <p className="text-xs text-amber-700">
                      Tu opinión es solo para nosotras — nos ayuda a mejorar para la próxima.
                    </p>
                  </div>
                  <textarea
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Me hubiera gustado que..."
                    className="w-full border border-input rounded-xl px-3 py-2 text-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </>
              )}

              <Button
                variant="hero"
                className="w-full"
                onClick={handleSubmit}
                disabled={submitting || (!isHighRating && !texto.trim())}
              >
                {submitting
                  ? "Enviando..."
                  : isHighRating
                  ? "Enviar mi opinión"
                  : "Enviar comentario privado"}
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Pequesaurios · Monterrey, N.L.
        </p>
      </div>
    </div>
  );
};

export default Gracias;
