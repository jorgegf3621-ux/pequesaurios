import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Minus, Plus, TableProperties, MapPin, Loader2, Navigation, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AddressAutocomplete, { type AddressResult } from "@/components/AddressAutocomplete";

interface Item {
  id: string;
  name: string;
  price: number;
  unit: string;
  min?: number;
  category: string;
}

type FleteConfig = {
  precio_gasolina: number;
  rendimiento_kmpl: number;
  margen_pct: number;
  direccion_base: string;
};

const items: Item[] = [
  // Baby Play Zone
  { id: "bpz-inflable",       name: "Baby Play Zone · Inflable Castillo (solo)",              price: 1000, unit: "renta 5hrs",  category: "Baby Play Zone" },
  { id: "bpz-basico",         name: "Baby Play Zone · Paquete Básico (inflable + mesita)",    price: 1400, unit: "renta 5hrs",  category: "Baby Play Zone" },
  { id: "bpz-plus",           name: "Baby Play Zone · Paquete Plus (inflable + mesita arte)", price: 1550, unit: "renta 5hrs",  category: "Baby Play Zone" },
  // Caballetes
  { id: "cab-dino-baby",      name: "Caballetes · Paquete Dino Baby",                         price: 900,  unit: "1.5 hrs",     category: "Caballetes" },
  { id: "cab-dino-creativo",  name: "Caballetes · Paquete Dino Creativo (+ yesitos)",         price: 1300, unit: "1.5 hrs",     category: "Caballetes" },
  { id: "cab-dino-fun",       name: "Caballetes · Paquete Dino Fun (+ pintacaritas)",         price: 1700, unit: "1.5 hrs",     category: "Caballetes" },
  // Yesitos
  { id: "yesito-basico",      name: "Kit Yesitos Básico (1 yesito + 1 pintura)",              price: 20,   unit: "kit", min: 10, category: "Yesitos" },
  { id: "yesito-intermedio",  name: "Kit Yesitos Intermedio (2 yesitos + 2 pinturas)",        price: 25,   unit: "kit", min: 10, category: "Yesitos" },
  { id: "yesito-completo",    name: "Kit Yesitos Completo (3 yesitos + 3 pinturas)",          price: 30,   unit: "kit", min: 10, category: "Yesitos" },
  // Mesas
  { id: "mesa-pastel",        name: "Mesa Infantil Pastel (6 sillas)",                        price: 500,  unit: "mesa",        category: "Mesas" },
  { id: "mesa-blanca",        name: "Mesita Blanca (8 sillas madera)",                        price: 750,  unit: "mesa",        category: "Mesas" },
  // Extras
  { id: "globos",             name: "Guirnalda de Globos",                                    price: 200,  unit: "pieza",       category: "Extras" },
  // Servicios
  { id: "pintacaritas",       name: "Pintacaritas (1.5 hrs)",                                 price: 800,  unit: "servicio",    category: "Servicios" },
];


const IDS_ENTREGA_FISICA = ["bpz-inflable", "bpz-basico", "bpz-plus", "mesa-pastel", "mesa-blanca", "cab-dino-baby", "cab-dino-creativo", "cab-dino-fun"];
const IDS_CON_MESITA = new Set(["mesa-pastel", "mesa-blanca", "bpz-basico", "bpz-plus"]);
const MESA_EXTRA: Item = { id: "mesa-extra", name: "Mesa extra (segunda mesa)", price: 450, unit: "mesa", category: "Mesas" };

// ─── Geocodificación base + distancia real ───────────────────────────────────

type Coords = [number, number]; // [lon, lat]

// Solo para la dirección base del admin (carga única al inicio)
async function geocodeBase(address: string): Promise<Coords | null> {
  try {
    const q = encodeURIComponent(address + ", Nuevo León, México");
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { "User-Agent": "Pequesaurios-Cotizador/1.0" } }
    );
    const data = await res.json();
    if (!data.length) return null;
    return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
  } catch {
    return null;
  }
}

function haversineKm(from: Coords, to: Coords): number {
  const [lon1, lat1] = from;
  const [lon2, lat2] = to;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.35;
}

async function getRoadDistanceKm(from: Coords, to: Coords): Promise<number> {
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 4000);
    const url = `https://router.project-osrm.org/route/v1/driving/${from[0]},${from[1]};${to[0]},${to[1]}?overview=false`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(tid);
    const data = await res.json();
    if (data.code === "Ok" && data.routes?.length) return data.routes[0].distance / 1000;
  } catch {}
  return haversineKm(from, to);
}

// ─── Cotizador ────────────────────────────────────────────────────────────────

const Cotizador = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState<Record<string, number>>(() => {
    const paquete = searchParams.get("paquete");
    return paquete ? { [paquete]: 1 } : {};
  });
  const [showMesaPrompt, setShowMesaPrompt] = useState(false);
  const [intentoReservar, setIntentoReservar] = useState(false);
  const [eventAddress, setEventAddress] = useState<AddressResult | null>(null);
  const [addressInput, setAddressInput] = useState("");

  // Flete data from Supabase
  const [fleteConfig, setFleteConfig] = useState<FleteConfig | null>(null);

  // Real-distance state
  const [baseCoords, setBaseCoords] = useState<Coords | null>(null);
  const [distanciaReal, setDistanciaReal] = useState<number | null>(null);
  const [calculandoFlete, setCalculandoFlete] = useState(false);

  // Fallback si Nominatim falla: centro de San Nicolás de los Garza
  const DEFAULT_BASE: Coords = [-100.3000, 25.7333];

  // Load flete config on mount
  useEffect(() => {
    const load = async () => {
      const { data: cfg } = await (supabase as any).from("flete_config").select("*").eq("id", 1).single();
      if (cfg) {
        setFleteConfig(cfg);
        const coords = await geocodeBase(cfg.direccion_base || "San Nicolás de los Garza, NL");
        setBaseCoords(coords ?? DEFAULT_BASE);
      } else {
        setBaseCoords(DEFAULT_BASE);
      }
    };
    load();
  }, []);

  // Cuando el cliente selecciona una dirección → calcular distancia real
  useEffect(() => {
    setDistanciaReal(null);
    if (!eventAddress?.coords || !baseCoords) return;
    if (eventAddress.municipio === "San Nicolás de los Garza") return;

    setCalculandoFlete(true);
    const from: Coords = [baseCoords[0], baseCoords[1]];
    const to: Coords = [eventAddress.coords.lng, eventAddress.coords.lat];
    getRoadDistanceKm(from, to).then((km) => {
      setDistanciaReal(km);
      setCalculandoFlete(false);
    });
  }, [eventAddress, baseCoords]);

  // Calcular flete con la fórmula del admin
  const calcularFlete = (km: number): number => {
    if (!fleteConfig || km <= 0) return 0;
    const kmTotal = km * 2;
    const litros = kmTotal / fleteConfig.rendimiento_kmpl;
    const costoGas = litros * fleteConfig.precio_gasolina;
    return Math.ceil(costoGas * (1 + fleteConfig.margen_pct / 100));
  };

  const municipio = eventAddress?.municipio ?? "";
  const MUNICIPIOS_COBERTURA = new Set([
    "San Nicolás de los Garza",
    "Monterrey",
    "Guadalupe",
    "San Pedro Garza García",
    "General Escobedo",
    "Apodaca",
  ]);
  const esSanNicolas = municipio === "San Nicolás de los Garza";
  const enZonaCobertura = municipio !== "" && MUNICIPIOS_COBERTURA.has(municipio);
  const fueraDeSanNicolas = enZonaCobertura && !esSanNicolas;
  const fueraDeZona = eventAddress !== null && !enZonaCobertura;
  const tienePintacaritas = !!selected["pintacaritas"];
  const tieneEntregaFisica = IDS_ENTREGA_FISICA.some((id) => selected[id]);

  // Flete: siempre distancia real por OSRM
  const fleteCalculado: number | null = distanciaReal !== null ? calcularFlete(distanciaReal) : null;
  const fletePorCotizar = fueraDeSanNicolas && fleteCalculado === null && !calculandoFlete;

  const toggle = (id: string, delta: number) => {
    setSelected((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (id === "mesa-extra" && next > 1) return prev;
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

  const tieneMesita = Object.keys(selected).some((id) => IDS_CON_MESITA.has(id));
  const selectedFinal = tieneMesita
    ? selected
    : Object.fromEntries(Object.entries(selected).filter(([id]) => id !== "mesa-extra"));
  const allItems = tieneMesita ? [...items, MESA_EXTRA] : items;

  const total = Object.entries(selectedFinal).reduce((sum, [id, qty]) => {
    const item = allItems.find((i) => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const fleteAplicado = (fueraDeSanNicolas || tienePintacaritas) && fleteCalculado !== null
    ? fleteCalculado : 0;
  const totalConFlete = total + fleteAplicado;

  const categories = [...new Set(items.map((i) => i.category))];
  const haySeleccion = Object.keys(selectedFinal).length > 0;

  const saveAndNavigate = () => {
    const resumen = Object.entries(selectedFinal)
      .map(([id, qty]) => {
        const item = allItems.find((i) => i.id === id);
        return item ? `${qty}x ${item.name}` : "";
      })
      .filter(Boolean)
      .join(", ");
    const itemPrices = Object.fromEntries(allItems.map((i) => [i.id, i.price]));
    localStorage.setItem("cotizador_seleccion", resumen);
    localStorage.setItem("cotizador_ids", JSON.stringify(Object.keys(selectedFinal)));
    localStorage.setItem("cotizador_quantities", JSON.stringify(selectedFinal));
    localStorage.setItem("cotizador_item_prices", JSON.stringify(itemPrices));
    localStorage.setItem("cotizador_municipio", municipio);
    localStorage.setItem("cotizador_direccion", eventAddress?.shortDisplay ?? "");
    localStorage.setItem("cotizador_flete", String(fleteAplicado));
    navigate("/reservaciones");
  };

  const handleReservar = () => {
    if (!eventAddress) {
      setIntentoReservar(true);
      document.getElementById("campo-direccion")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (tieneMesita && !selectedFinal["mesa-extra"]) {
      setShowMesaPrompt(true);
      return;
    }
    saveAndNavigate();
  };

  const handleConfirmarSinMesa = () => {
    setShowMesaPrompt(false);
    saveAndNavigate();
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

      {/* ── Ubicación del evento ── */}
      <div className="mb-8">
        <h2 className="font-heading text-xl font-bold mb-4 text-primary flex items-center gap-2">
          <MapPin size={20} /> Ubicación del evento
        </h2>
        <div className="space-y-3">
          {/* Buscador de dirección con Google Places */}
          <div id="campo-direccion" className={`p-4 rounded-xl border bg-card transition-colors ${!eventAddress && haySeleccion ? "border-red-300" : "border-border"}`}>
            <label className="block text-sm font-semibold mb-1">
              Dirección del evento <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Escribe tu calle y colonia — detectamos el municipio y calculamos el flete automáticamente.
            </p>
            <AddressAutocomplete
              value={addressInput}
              onSelect={(result) => {
                setAddressInput(result.shortDisplay);
                setEventAddress(result);
                setIntentoReservar(false);
              }}
              onClear={() => {
                setAddressInput("");
                setEventAddress(null);
                setDistanciaReal(null);
              }}
              placeholder="Ej. Av. Constitución 450, Col. Centro"
            />

            {intentoReservar && !eventAddress && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <AlertCircle size={12} /> Ingresa la dirección del evento para continuar.
              </p>
            )}

            {/* Municipio detectado */}
            {eventAddress && (
              <div className="mt-3">
                {fueraDeZona ? (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-800">
                    <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                    <span>
                      Por el momento no tenemos cobertura en esa zona. Servicio disponible en{" "}
                      <strong>San Nicolás, Monterrey, San Pedro, Guadalupe, Escobedo y Apodaca</strong>.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin size={12} className="text-primary" />
                    Municipio detectado: <strong className="text-foreground">{municipio}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Resultado de distancia */}
            {calculandoFlete && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" /> Calculando distancia...
              </p>
            )}
            {!calculandoFlete && fleteCalculado !== null && (
              <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-800 flex items-center gap-2">
                <Navigation size={13} />
                <span>
                  <strong>{distanciaReal!.toFixed(1)} km</strong> de recorrido ·{" "}
                  Flete: <strong>${fleteCalculado.toLocaleString()} MXN</strong>
                </span>
              </div>
            )}
          </div>

          {/* Banners informativos */}
          {esSanNicolas && tieneEntregaFisica && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              <p className="font-semibold mb-1">Flete incluido</p>
              <p>El Paquete Básico y Plus incluyen flete dentro de San Nicolás. El Inflable solo no incluye flete.</p>
            </div>
          )}
          {tienePintacaritas && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-800">
              <p className="font-semibold mb-1">Pintacaritas · Flete adicional</p>
              <p>El servicio de Pintacaritas incluye un costo de flete según tu ubicación.</p>
            </div>
          )}
          {fletePorCotizar && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">Flete por cotizar</p>
              <p>Ingresa tu dirección completa para calcular el flete, o te lo confirmamos por WhatsApp.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Resumen sticky ── */}
      <div className="sticky bottom-20 bg-card border-2 border-primary rounded-2xl p-6 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-heading text-lg font-bold">Tu Cotización</h3>
          {haySeleccion && (
            <div className="text-right">
              <p className="font-heading text-2xl font-bold text-primary">
                ${totalConFlete.toLocaleString()}{" "}
                <span className="text-sm text-muted-foreground font-normal">MXN</span>
              </p>
              {fleteAplicado > 0 && (
                <p className="text-xs text-muted-foreground">
                  incl. ${fleteAplicado.toLocaleString()} flete
                </p>
              )}
            </div>
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
              {fleteAplicado > 0 && (
                <li className="flex items-center gap-2 text-sm text-foreground/80">
                  <Navigation size={14} className="text-amber-500 flex-shrink-0" />
                  Flete{municipio ? ` (${municipio})` : ""} — ${fleteAplicado.toLocaleString()}
                </li>
              )}
              {calculandoFlete && (
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 size={12} className="animate-spin" /> Calculando flete exacto...
                </li>
              )}
              {fletePorCotizar && !calculandoFlete && (
                <li className="flex items-center gap-2 text-xs text-amber-700">
                  <MapPin size={12} className="flex-shrink-0" /> Flete por cotizar según dirección
                </li>
              )}
            </ul>
            <Button variant="hero" className="w-full" size="lg" onClick={handleReservar}>
              Reservar ahora
            </Button>
            <Button variant="whatsapp" className="w-full mt-2" size="lg" asChild>
              <a
                href={`https://wa.me/528180540369?text=${encodeURIComponent(
                  `¡Hola! Me interesa cotizar:\n${Object.entries(selectedFinal)
                    .map(([id, qty]) => {
                      const item = allItems.find((i) => i.id === id);
                      return item ? `• ${qty}x ${item.name}` : "";
                    })
                    .filter(Boolean)
                    .join("\n")}${fleteAplicado > 0 ? `\n• Flete: $${fleteAplicado.toLocaleString()}` : ""}\n\nTotal estimado: $${totalConFlete.toLocaleString()} MXN`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Preguntar por WhatsApp
              </a>
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Selecciona los elementos para tu evento</p>
        )}
      </div>

      {/* ── Prompt segunda mesa ── */}
      <Dialog open={showMesaPrompt} onOpenChange={setShowMesaPrompt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
              <TableProperties size={22} className="text-primary" />
            </div>
            <DialogTitle className="text-center">¿Agregar una segunda mesa?</DialogTitle>
            <DialogDescription className="text-center">
              Puedes incluir una segunda mesa adicional por solo{" "}
              <span className="font-bold text-primary">$450 MXN</span> más.
              El máximo es 2 mesas en total.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            <Button variant="hero" onClick={agregarMesaExtra} className="w-full">
              Sí, agregar segunda mesa ($450)
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
