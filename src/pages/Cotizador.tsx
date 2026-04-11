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
  // Baby Play Zone
  { id: "bpz-inflable",       name: "Baby Play Zone · Inflable Castillo (solo)",              price: 800,  unit: "renta 5hrs",  category: "Baby Play Zone" },
  { id: "bpz-basico",         name: "Baby Play Zone · Paquete Básico (inflable + mesita)",    price: 1200, unit: "renta 5hrs",  category: "Baby Play Zone" },
  { id: "bpz-plus",           name: "Baby Play Zone · Paquete Plus (inflable + mesita arte)", price: 1400, unit: "renta 5hrs",  category: "Baby Play Zone" },
  // Inflables
  { id: "inflable",           name: "Inflable Castillo Blanco",                               price: 1300, unit: "pieza",       category: "Inflables" },
  // Mesas
  { id: "mesa-pastel",        name: "Mesa Infantil Pastel (6 sillas)",                        price: 500,  unit: "mesa", min: 2, category: "Mesas" },
  { id: "mesa-blanca",        name: "Mesita Blanca (8 sillas madera)",                        price: 750,  unit: "mesa", min: 2, category: "Mesas" },
  // Yesitos
  { id: "yesito-basico",      name: "Kit Yesitos Básico (1 yesito)",                          price: 20,   unit: "kit",  min: 10, category: "Yesitos" },
  { id: "yesito-intermedio",  name: "Kit Yesitos Intermedio (2 yesitos)",                     price: 25,   unit: "kit",  min: 10, category: "Yesitos" },
  { id: "yesito-completo",    name: "Kit Yesitos Completo (3 yesitos)",                       price: 30,   unit: "kit",  min: 10, category: "Yesitos" },
  // Extras
  { id: "arte",               name: "Arte en Mesa",                                           price: 150,  unit: "complemento", category: "Extras" },
  { id: "globos",             name: "Guirnalda de Globos",                                    price: 200,  unit: "pieza",       category: "Extras" },
  // Servicios
  { id: "pintacaritas",       name: "Pintacaritas (1.5 hrs)",                                 price: 800,  unit: "servicio",    category: "Servicios" },
];

// IDs que incluyen mesita (activan la opción de mesa extra)
const IDS_CON_MESITA = new Set(["mesa-pastel", "mesa-blanca", "bpz-basico", "bpz-plus"]);
const MESA_EXTRA: Item = { id: "mesa-extra", name: "Mesa extra adicional", price: 350, unit: "mesa", category: "Mesas" };

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

  // ¿Tiene algún item con mesita seleccionado?
  const tieneMesita = Object.keys(selected).some((id) => IDS_CON_MESITA.has(id));

  // Si pierde la mesita, limpia la mesa-extra del selected
  const selectedSinExtraHuerfana = tieneMesita
    ? selected
    : Object.fromEntries(Object.entries(selected).filter(([id]) => id !== "mesa-extra"));

  const allItems = tieneMesita
    ? [...items, MESA_EXTRA]
    : items.filter((i) => i.id !== "mesa-extra");

  const total = Object.entries(selectedSinExtraHuerfana).reduce((sum, [id, qty]) => {
    const item = allItems.find((i) => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const categories = [...new Set(items.map((i) => i.category))];
  const haySeleccion = Object.keys(selectedSinExtraHuerfana).length > 0;

  const handleReservar = () => {
    const resumen = Object.entries(selectedSinExtraHuerfana)
      .map(([id, qty]) => {
        const item = allItems.find((i) => i.id === id);
        return item ? `${qty}x ${item.name}` : "";
      })
      .filter(Boolean)
      .join(", ");
    localStorage.setItem("cotizador_seleccion", resumen);
    navigate("/reservaciones");
  };

  const renderItem = (item: Item) => {
    const qty = selectedSinExtraHuerfana[item.id] || 0;
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
            {items.filter((i) => i.category === cat).map(renderItem)}

            {/* Mesa extra — aparece solo en categoría Mesas cuando hay mesita seleccionada */}
            {cat === "Mesas" && tieneMesita && (
              <div className="border-t border-dashed border-primary/30 pt-3 mt-1">
                <p className="text-xs text-primary font-semibold mb-2 pl-1">+ Agrega mas mesas</p>
                {renderItem(MESA_EXTRA)}
              </div>
            )}
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
              {Object.entries(selectedSinExtraHuerfana).map(([id, qty]) => {
                const item = allItems.find((i) => i.id === id);
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
