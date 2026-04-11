import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Minus, Plus, TableProperties } from "lucide-react";

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
  { id: "mesa-pastel",        name: "Mesa Infantil Pastel (6 sillas)",                        price: 500,  unit: "mesa",        category: "Mesas" },
  { id: "mesa-blanca",        name: "Mesita Blanca (8 sillas madera)",                        price: 750,  unit: "mesa",        category: "Mesas" },
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

const IDS_CON_MESITA = new Set(["mesa-pastel", "mesa-blanca", "bpz-basico", "bpz-plus"]);
const MESA_EXTRA: Item = { id: "mesa-extra", name: "Mesa extra (segunda mesa)", price: 350, unit: "mesa", category: "Mesas" };

const Cotizador = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [showMesaPrompt, setShowMesaPrompt] = useState(false);

  const toggle = (id: string, delta: number) => {
    setSelected((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);

      // Limitar mesa-extra a 1
      if (id === "mesa-extra" && next > 1) return prev;

      // Mostrar prompt de segunda mesa al seleccionar por primera vez un item con mesita
      if (delta > 0 && current === 0 && IDS_CON_MESITA.has(id) && !prev["mesa-extra"]) {
        setTimeout(() => setShowMesaPrompt(true), 50);
      }

      if (next === 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: next };
    });
  };

  const agregarMesaExtra = () => {
    setSelected((prev) => ({ ...prev, "mesa-extra": 1 }));
    setShowMesaPrompt(false);
  };

  // ¿Tiene algún item con mesita seleccionado?
  const tieneMesita = Object.keys(selected).some((id) => IDS_CON_MESITA.has(id));

  const selectedFinal = tieneMesita
    ? selected
    : Object.fromEntries(Object.entries(selected).filter(([id]) => id !== "mesa-extra"));

  const allItems = tieneMesita ? [...items, MESA_EXTRA] : items;

  const total = Object.entries(selectedFinal).reduce((sum, [id, qty]) => {
    const item = allItems.find((i) => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const categories = [...new Set(items.map((i) => i.category))];
  const haySeleccion = Object.keys(selectedFinal).length > 0;

  const handleReservar = () => {
    // Si tiene mesita y NO tiene mesa-extra, preguntar antes de avanzar
    if (tieneMesita && !selectedFinal["mesa-extra"]) {
      setShowMesaPrompt(true);
      return;
    }
    const resumen = Object.entries(selectedFinal)
      .map(([id, qty]) => {
        const item = allItems.find((i) => i.id === id);
        return item ? `${qty}x ${item.name}` : "";
      })
      .filter(Boolean)
      .join(", ");
    localStorage.setItem("cotizador_seleccion", resumen);
    localStorage.setItem("cotizador_ids", JSON.stringify(Object.keys(selectedFinal)));
    navigate("/reservaciones");
  };

  const handleConfirmarSinMesa = () => {
    setShowMesaPrompt(false);
    // Si el prompt se abrió desde "Reservar ahora", continuar navegando
    const resumen = Object.entries(selectedFinal)
      .map(([id, qty]) => {
        const item = allItems.find((i) => i.id === id);
        return item ? `${qty}x ${item.name}` : "";
      })
      .filter(Boolean)
      .join(", ");
    localStorage.setItem("cotizador_seleccion", resumen);
    localStorage.setItem("cotizador_ids", JSON.stringify(Object.keys(selectedFinal)));
    navigate("/reservaciones");
  };

  const renderItem = (item: Item) => {
    const qty = selectedFinal[item.id] || 0;
    const maxReached = item.id === "mesa-extra" && qty >= 1;
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
            {item.id === "mesa-extra" ? " · Máx. 1" : ""}
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
            disabled={maxReached}
            className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
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

            {cat === "Mesas" && tieneMesita && (
              <div className="border-t border-dashed border-primary/30 pt-3 mt-1">
                <p className="text-xs text-primary font-semibold mb-2 pl-1">+ Segunda mesa (máx. 1)</p>
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
              {Object.entries(selectedFinal).map(([id, qty]) => {
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

      {/* Prompt segunda mesa */}
      <Dialog open={showMesaPrompt} onOpenChange={setShowMesaPrompt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
              <TableProperties size={22} className="text-primary" />
            </div>
            <DialogTitle className="text-center">¿Agregar una segunda mesa?</DialogTitle>
            <DialogDescription className="text-center">
              Puedes incluir una segunda mesa adicional por solo{" "}
              <span className="font-bold text-primary">$350 MXN</span> más.
              El máximo es 2 mesas en total.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            <Button variant="hero" onClick={agregarMesaExtra} className="w-full">
              Sí, agregar segunda mesa ($350)
            </Button>
            <Button variant="outline" onClick={handleConfirmarSinMesa} className="w-full">
              No, continuar sin ella
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cotizador;
