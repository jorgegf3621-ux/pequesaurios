import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, X } from "lucide-react";

export interface AddressResult {
  shortDisplay: string;
  coords: { lat: number; lng: number };
  municipio: string | null;
}

interface Props {
  value: string;
  onSelect: (result: AddressResult) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string;
const MTY_CENTER = { lat: 25.6866, lng: -100.3161 };

const MUNICIPIOS_MAP: [string, string][] = [
  ["san pedro garza", "San Pedro Garza García"],
  ["san pedro", "San Pedro Garza García"],
  ["san nicolás de los garza", "San Nicolás de los Garza"],
  ["san nicolás", "San Nicolás de los Garza"],
  ["san nicolas", "San Nicolás de los Garza"],
  ["monterrey", "Monterrey"],
  ["general escobedo", "General Escobedo"],
  ["escobedo", "General Escobedo"],
  ["guadalupe", "Guadalupe"],
];

function detectMunicipio(components: google.maps.GeocoderAddressComponent[]): string | null {
  const priority = ["locality", "sublocality_level_1", "administrative_area_level_2"];
  for (const type of priority) {
    const comp = components.find((c) => c.types.includes(type));
    if (comp) {
      const lower = comp.long_name.toLowerCase();
      for (const [key, value] of MUNICIPIOS_MAP) {
        if (lower.includes(key)) return value;
      }
    }
  }
  return null;
}

// Carga el script de Google Maps una sola vez
let scriptPromise: Promise<void> | null = null;
function loadGoogleMaps(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if ((window as any).google?.maps?.places) { resolve(); return; }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&language=es&region=MX`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

interface Suggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  prediction: google.maps.places.AutocompletePrediction;
}

export const AddressAutocomplete = ({ value, onSelect, onClear, placeholder, className }: Props) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(!!value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svcRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const detailsRef = useRef<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (!value) { setQuery(""); setSelected(false); setSuggestions([]); setOpen(false); }
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const ensureServices = async () => {
    if (svcRef.current) return;
    await loadGoogleMaps();
    svcRef.current = new google.maps.places.AutocompleteService();
    const div = document.createElement("div");
    detailsRef.current = new google.maps.places.PlacesService(div);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    setSelected(false);
    if (onClear) onClear();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 4) { setSuggestions([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        await ensureServices();
        svcRef.current!.getPlacePredictions(
          {
            input: text,
            componentRestrictions: { country: "mx" },
            locationBias: { center: MTY_CENTER, radius: 60000 } as google.maps.CircleLiteral,
          },
          (results, status) => {
            if (status === "OK" && results) {
              setSuggestions(results.map((p) => ({
                placeId: p.place_id,
                mainText: p.structured_formatting.main_text,
                secondaryText: p.structured_formatting.secondary_text ?? "",
                prediction: p,
              })));
              setOpen(true);
            } else {
              setSuggestions([]);
              setOpen(false);
            }
            setLoading(false);
          }
        );
      } catch {
        setLoading(false);
      }
    }, 350);
  };

  const handleSelect = (s: Suggestion) => {
    const display = s.mainText + (s.secondaryText ? `, ${s.secondaryText}` : "");
    setQuery(display);
    setSelected(true);
    setOpen(false);
    setSuggestions([]);
    setLoading(true);

    detailsRef.current!.getDetails(
      { placeId: s.placeId, fields: ["geometry", "address_components"] },
      (place, status) => {
        setLoading(false);
        if (status !== "OK" || !place?.geometry?.location) return;
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        const municipio = detectMunicipio(place.address_components ?? []);
        onSelect({ shortDisplay: display, coords, municipio });
      }
    );
  };

  const handleClear = () => {
    setQuery("");
    setSelected(false);
    setSuggestions([]);
    setOpen(false);
    if (onClear) onClear();
  };

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <div className="relative">
        <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder ?? "Ej. Av. Constitución 450, Col. Centro"}
          className={`w-full border rounded-lg pl-9 pr-9 py-2 text-sm bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            selected ? "border-green-400" : "border-border"
          }`}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading && <Loader2 size={14} className="text-muted-foreground animate-spin" />}
          {!loading && query && (
            <button type="button" onClick={handleClear} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 top-full mt-1 w-full bg-white border border-border rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-primary/5 border-b border-border/50 last:border-0 flex items-start gap-2"
              >
                <MapPin size={13} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium leading-tight">{s.mainText}</p>
                  {s.secondaryText && <p className="text-xs text-muted-foreground">{s.secondaryText}</p>}
                </div>
              </button>
            </li>
          ))}
          <li className="px-3 py-1.5 text-[10px] text-muted-foreground/50 text-right">
            Powered by Google
          </li>
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
