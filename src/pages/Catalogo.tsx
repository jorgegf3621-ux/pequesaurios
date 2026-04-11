import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Package = {
  id: string;
  name: string;
  subtitle: string | null;
  price: number;
  popular: boolean;
  color: string;
  items: string[];
  note: string | null;
  image_url: string | null;
};

type Extra = {
  id: string;
  name: string;
  price: string;
  description: string | null;
  image_url: string | null;
};

const Catalogo = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: pkgs }, { data: exts }] = await Promise.all([
        (supabase as any).from("packages").select("*").eq("active", true).order("sort_order"),
        (supabase as any).from("extras").select("*").eq("active", true).order("sort_order"),
      ]);
      if (pkgs) setPackages(pkgs);
      if (exts) setExtras(exts);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">
        Cargando catálogo...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading text-4xl font-bold text-center mb-2">Catálogo y Paquetes</h1>
      <p className="text-muted-foreground text-center mb-12">Elige el paquete ideal para tu evento 🎈</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative bg-card rounded-2xl border-2 ${pkg.color} shadow-sm hover:shadow-lg transition-shadow flex flex-col overflow-hidden`}
          >
            {pkg.popular && (
              <Badge className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground">
                ⭐ Más Popular
              </Badge>
            )}

            {/* Imagen */}
            {pkg.image_url && (
              <div className="w-full h-44 overflow-hidden">
                <img src={pkg.image_url} alt={pkg.name} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-heading text-xl font-bold">{pkg.name}</h3>
              {pkg.subtitle && <p className="text-sm text-muted-foreground">{pkg.subtitle}</p>}
              <p className="font-heading text-3xl font-bold text-primary mt-3 mb-4">
                ${pkg.price.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">MXN</span>
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
                  href={`https://wa.me/528180540369?text=${encodeURIComponent(`¡Hola! Me interesa el ${pkg.name} ($${pkg.price.toLocaleString()} MXN)`)}`}
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

      {/* Extras */}
      {extras.length > 0 && (
        <div className="mt-16">
          <h2 className="font-heading text-2xl font-bold text-center mb-8">Extras y Complementos ✨</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {extras.map((e) => (
              <div key={e.id} className="bg-muted/50 rounded-xl border border-border text-center overflow-hidden">
                {e.image_url && (
                  <div className="w-full h-36 overflow-hidden">
                    <img src={e.image_url} alt={e.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <h4 className="font-heading font-bold text-lg">{e.name}</h4>
                  <p className="text-primary font-bold text-xl my-2">{e.price}</p>
                  {e.description && <p className="text-sm text-muted-foreground">{e.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center mt-12">
        <Button variant="outline" size="lg" asChild>
          <Link to="/cotizador">Usar Cotizador Interactivo</Link>
        </Button>
      </div>
    </div>
  );
};

export default Catalogo;
