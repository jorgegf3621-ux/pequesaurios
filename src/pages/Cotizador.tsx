import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Minus, Plus } from "lucide-react";

interface Item {
  id: string;
  name: string;
  price: number;
  unit: string;
  min?: number;
  category: string;
}

const items: Item[] = [
  { id: "inflable",     name: "Inflable Castillo Blanco",        price: 1300, unit: "pieza",       category: "Inflables" },
  { id: "mesa-pastel",  name: "Mesa Infantil Pastel (6 sillas)",  price: 500,  unit: "mesa", min: 2, category: "Mesas" },
  { id: "mesa-blanca",  name: "Mesita Blanca (8 sillas madera)",  price: 750,  unit: "mesa", min: 2, category: "Mesas" },
  { id: "arte",         name: "Arte en Mesa",                     price: 150,  unit: "complemento", category: "Extras" },
  { id: "yesitos",      name: "Kit de Yesitos",                   price: 20,   unit: "kit",         category: "Extras" },
  { id: "pintacaritas", name: "Pintacaritas (1.5 hrs)",           price: 800,  unit: "servicio",    category: "Servicios" },
  { id: "globos",       name: "Guirnalda de Globos",              price: 200,  unit: "pieza",       category: "Extras" },
];

const Cotizador = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Record<string, number>>({});

  const toggle = (id: string, delta: number) => {
    setSelected((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      if (next === 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: next };
    });
  };

  const total = Object.entries(selected).reduce((sum, [id, qty]) => {
    const item = items.find((i) => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const categories = [...new Set(items.map((i) => i.category))];
  const haySeleccion = Object.keys(selected).length > 0;

  const handleReservar = () => {
    const resumen = Object.entries(selected)
      .map(([id, qty]) => {
        const item = items.find((i) => i.id === id);
        return item ? `${qty}x ${item.name}` : "";
      })
      .filter(Boolean)
      .join(", ");
    localStorage.setItem("cotizador_seleccion", resumen);
    navigate("/reservaciones");
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-heading text-4xl font-bold text-center mb-2">Cotizador Interactivo</h1>
      <p className="text-muted-foreground text-center mb-12">
        Arma tu paquete ideal y reserva tu fecha
      </p>

      {categories.map((cat) => (
        <div key={cat} className="mb-8">
          <h2 className="font-heading text-xl font-bold mb-4 text-primary">{cat}</h2>
          <div className="space-y-3">
            {items.filter((i) => i.category === cat).map((item) => {
              const qty = selected[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                    qty > 0 ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-body font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ${item.price.toLocaleString()} / {item.unit}
                      {item.min ? ` · Mín. ${item.min}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggle(item.id, -1)}
                      disabled={qty === 0}
                      className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-bold text-sm">{qty}</span>
                    <button
                      onClick={() => toggle(item.id, 1)}
                      className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Resumen sticky */}
      <div className="sticky bottom-20 bg-card border-2 border-primary rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-bold">Tu Cotización</h3>
          {haySeleccion && (
            <p className="font-heading text-2xl font-bold text-primary">
              ${total.toLocaleString()} <span className="text-sm text-muted-foreground">MXN</span>
            </p>
          )}
        </div>

        {haySeleccion ? (
          <>
            <ul className="space-y-1 mb-4">
              {Object.entries(selected).map(([id, qty]) => {
                const item = items.find((i) => i.id === id);
                if (!item) return null;
                return (
                  <li key={id} className="flex items-center gap-2 text-sm text-foreground/80">
                    <Check size={14} className="text-primary flex-shrink-0" />
                    {qty}x {item.name} — ${(item.price * qty).toLocaleString()}
                  </li>
                );
              })}
            </ul>
            <Button variant="hero" className="w-full" size="lg" onClick={handleReservar}>
              Reservar ahora
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Selecciona los elementos para tu evento</p>
        )}
      </div>
    </div>
  );
};

export default Cotizador;
