import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

// Reemplazar con el link real de Google Business cuando lo tengas:
const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=TU_PLACE_ID";
const FACEBOOK_URL = "https://www.facebook.com/share/1DvDRmqAGB/?mibextid=wwXIfr";

const LABELS = ["", "Podría mejorar", "Regular", "Bien", "Muy bien", "¡Excelente!"];

const Gracias = () => {
  const [searchParams] = useSearchParams();
  const nombre = searchParams.get("nombre") || "amiga";

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [texto, setTexto] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isHighRating = rating >= 4;

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    await (supabase as any).from("resenas").insert({
      nombre,
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
            Fue un placer ser parte de la fiesta especial de su pequeño.
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

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={GOOGLE_REVIEW_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center gap-1.5 bg-white border-2 border-gray-200 hover:border-blue-300 text-gray-700 font-semibold text-sm py-3 rounded-2xl hover:bg-blue-50 transition-all"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Reseña Google
                    </a>
                    <a
                      href={FACEBOOK_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center gap-1.5 bg-white border-2 border-gray-200 hover:border-blue-400 text-gray-700 font-semibold text-sm py-3 rounded-2xl hover:bg-blue-50 transition-all"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Reseña Facebook
                    </a>
                  </div>

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
