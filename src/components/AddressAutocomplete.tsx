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
const MTY_CENTER = { latitude: 25.6866, longitude: -100.3161 };

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

function detectMunicipio(components: { types: string[]; longText: string }[]): string | null {
  const priority = ["locality", "sublocality_level_1", "administrative_area_level_2"];
  for (const type of priority) {
    const comp = components.find((c) => c.types.includes(type));
    if (comp) {
      const lower = comp.longText.toLowerCase();
      for (const [key, value] of MUNICIPIOS_MAP) {
        if (lower.includes(key)) return value;
      }
    }
  }
  return null;
}

interface Suggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
}

async function fetchSuggestions(input: string): Promise<Suggestion[]> {
  if (!API_KEY || API_KEY === "undefined") return [];
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
      },
      body: JSON.stringify({
        input,
        languageCode: "es",
        includedRegionCodes: ["mx"],
        locationBias: {
          circle: { center: MTY_CENTER, radius: 60000.0 },
        },
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.suggestions ?? [])
      .map((s: any) => ({
        placeId: s.placePrediction?.placeId ?? "",
        mainText: s.placePrediction?.structuredFormat?.mainText?.text ?? s.placePrediction?.text?.text ?? "",
        secondaryText: s.placePrediction?.structuredFormat?.secondaryText?.text ?? "",
      }))
      .filter((s: Suggestion) => s.placeId);
  } catch {
    return [];
  }
}

async function fetchPlaceDetails(placeId: string): Promise<{ coords: { lat: number; lng: number }; municipio: string | null } | null> {
  if (!API_KEY || API_KEY === "undefined") return null;
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=location,addressComponents&languageCode=es`,
      { headers: { "X-Goog-Api-Key": API_KEY } }
    );
    if (!res.ok) return null;
    const place = await res.json();
    const coords = {
      lat: place.location?.latitude ?? 0,
      lng: place.location?.longitude ?? 0,
    };
    const municipio = detectMunicipio(place.addressComponents ?? []);
    return { coords, municipio };
  } catch {
    return null;
  }
}

export const AddressAutocomplete = ({ value, onSelect, onClear, placeholder, className }: Props) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(!!value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    setSelected(false);
    if (onClear) onClear();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 4) { setSuggestions([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const results = await fetchSuggestions(text);
      setSuggestions(results);
      setOpen(results.length > 0);
      setLoading(false);
    }, 350);
  };

  const handleSelect = async (s: Suggestion) => {
    const display = s.mainText + (s.secondaryText ? `, ${s.secondaryText}` : "");
    setQuery(display);
    setSelected(true);
    setOpen(false);
    setSuggestions([]);
    setLoading(true);
    const detail = await fetchPlaceDetails(s.placeId);
    setLoading(false);
    if (!detail) return;
    onSelect({ shortDisplay: display, coords: detail.coords, municipio: detail.municipio });
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
