import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, Minus, Plus, EyeOff, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Item {
  id: string;
  name: string;
  price: number;
  unit: string;
  min?: number;
  category: string;
}

const items: Item[] = [
  { id: "inflable",     name: "Inflable Castillo Blanco",       price: 1300, unit: "pieza",      category: "Inflables" },
  { id: "mesa-pastel",  name: "Mesa Infantil Pastel (6 sillas)", price: 500,  unit: "mesa", min: 2, category: "Mesas" },
  { id: "mesa-blanca",  name: "Mesita Blanca (8 sillas madera)", price: 750,  unit: "mesa", min: 2, category: "Mesas" },
  { id: "arte",         name: "Arte en Mesa",                    price: 150,  unit: "complemento", category: "Extras" },
  { id: "yesitos",      name: "Kit de Yesitos",                  price: 20,   unit: "kit",         category: "Extras" },
  { id: "pintacaritas", name: "Pintacaritas (1.5 hrs)",          price: 800,  unit: "servicio",    category: "Servicios" },
  { id: "globos",       name: "Guirnalda de Globos",             price: 200,  unit: "pieza",       category: "Extras" },
];

const Cotizador = () => {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [showPrices, setShowPrices] = useState(true);
  const [contacto, setContacto] = useState("");
  const [notas, setNotas] = useState("");
  const [sending, setSending] = useState(false);

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

  const handleEnviar = async () => {
    if (!contacto.trim()) {
      toast.error("Por favor ingresa tu teléfono o correo");
      return;
    }

    setSending(true);

    const itemsGuardar = Object.entries(selected)
      .map(([id, qty]) => {
        const item = items.find((i) => i.id === id);
        return item ? { id, name: item.name, qty, price: item.price, subtotal: item.price * qty } : null;
      })
      .filter(Boolean);

    await (supabase as any).from("quotes").insert({ items: itemsGuardar, total, contacto, notas: notas || null });

    const resumen = Object.entries(selected)
      .map(([id, qty]) => {
        const item = items.find((i) => i.id === id);
        return item
          ? showPrices
            ? `${qty}x ${item.name} ($${(item.price * qty).toLocaleString()})`
            : `${qty}x ${item.name}`
          : "";
      })
      .filter(Boolean)
      .join("\n");

    const msg = [
      `¡Hola! Me gustaría cotizar lo siguiente:`,
      ``,
      resumen,
      showPrices ? `\nTotal estimado: $${total.toLocaleString()} MXN` : `\n(Solicito confirmación de precios)`,
      ``,
      `Contacto: ${contacto}`,
      notas ? `Notas: ${notas}` : "",
    ].filter((l) => l !== undefined).join("\n").trim();

    setSending(false);
    window.open(`https://wa.me/528180540369?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-heading text-4xl font-bold text-center mb-2">Cotizador Interactivo</h1>
      <p className="text-muted-foreground text-center mb-12">
        Arma tu paquete ideal y envíanos tu cotización
      </p>

      {/* Toggle precios */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowPrices((v) => !v)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPrices ? <EyeOff size={15} /> : <Eye size={15} />}
          {showPrices ? "Ocultar precios" : "Mostrar precios"}
        </button>
      </div>

      {/* Ítems */}
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
                    {showPrices && (
                      <p className="text-xs text-muted-foreground">
                        ${item.price.toLocaleString()} / {item.unit}
                        {item.min ? ` · Mín. ${item.min}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggle(item.id, -1)} disabled={qty === 0}
                      className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40">
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-bold text-sm">{qty}</span>
                    <button onClick={() => toggle(item.id, 1)}
                      className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
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
          {showPrices && (
            <p className="font-heading text-2xl font-bold text-primary">
              ${total.toLocaleString()} <span className="text-sm text-muted-foreground">MXN</span>
            </p>
          )}
        </div>

        {haySeleccion ? (
          <div className="space-y-4">
            {/* Lista seleccionada */}
            <ul className="space-y-1">
              {Object.entries(selected).map(([id, qty]) => {
                const item = items.find((i) => i.id === id);
                if (!item) return null;
                return (
                  <li key={id} className="flex items-center gap-2 text-sm text-foreground/80">
                    <Check size={14} className="text-primary flex-shrink-0" />
                    {qty}x {item.name}
                    {showPrices && ` — $${(item.price * qty).toLocaleString()}`}
                  </li>
                );
              })}
            </ul>

            {!showPrices && (
              <p className="text-xs text-muted-foreground italic">Los precios serán confirmados por Pequesaurios.</p>
            )}

            {/* Datos de contacto */}
            <div className="border-t border-border pt-4 space-y-3">
              <div>
                <Label htmlFor="contacto" className="text-sm">Teléfono o correo *</Label>
                <Input
                  id="contacto"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                  placeholder="Ej: 81 1234 5678 o tu@correo.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="notas" className="text-sm">Notas adicionales (opcional)</Label>
                <Textarea
                  id="notas"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Fecha aproximada, número de niños, dudas..."
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>

            <Button variant="whatsapp" className="w-full" size="lg" onClick={handleEnviar} disabled={sending}>
              {sending ? "Enviando..." : "Envíanos tu cotización"}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Selecciona los elementos para tu evento</p>
        )}
      </div>
    </div>
  );
};

export default Cotizador;
