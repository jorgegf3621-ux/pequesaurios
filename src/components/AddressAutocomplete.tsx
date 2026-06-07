import { useState, useEffect, useRef, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";
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

// Monterrey metro center — bias de búsqueda
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
  const types = ["locality", "sublocality", "administrative_area_level_2"];
  for (const type of types) {
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

// Singleton loader — no carga dos veces
const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY as string,
  libraries: ["places"],
  language: "es",
  region: "MX",
});

let autocompleteService: google.maps.places.AutocompleteService | null = null;
let placesService: google.maps.places.PlacesService | null = null;
let mapsLoaded = false;

async function ensureLoaded() {
  if (mapsLoaded) return;
  await loader.load();
  autocompleteService = new google.maps.places.AutocompleteService();
  // PlacesService requiere un elemento DOM
  const div = document.createElement("div");
  placesService = new google.maps.places.PlacesService(div);
  mapsLoaded = true;
}

export const AddressAutocomplete = ({ value, onSelect, onClear, placeholder, className }: Props) => {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(!!value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) { setQuery(""); setSelected(false); setPredictions([]); setOpen(false); }
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

  const search = useCallback(async (text: string) => {
    if (text.trim().length < 4) { setPredictions([]); setOpen(false); return; }
    setLoading(true);
    try {
      await ensureLoaded();
      autocompleteService!.getPlacePredictions(
        {
          input: text,
          componentRestrictions: { country: "mx" },
          locationBias: new google.maps.Circle({
            center: MTY_CENTER,
            radius: 60000,
          }),
          types: ["address", "establishment", "geocode"],
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results);
            setOpen(true);
          } else {
            setPredictions([]);
            setOpen(false);
          }
          setLoading(false);
        }
      );
    } catch {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    setSelected(false);
    if (onClear) onClear();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(text), 350);
  };

  const handleSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    setQuery(prediction.structured_formatting.main_text);
    setSelected(true);
    setOpen(false);
    setPredictions([]);
    setLoading(true);

    placesService!.getDetails(
      { placeId: prediction.place_id, fields: ["geometry", "address_components", "formatted_address"] },
      (place, status) => {
        setLoading(false);
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place?.geometry?.location) return;
        const coords = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
        const municipio = detectMunicipio(place.address_components ?? []);
        const short = prediction.structured_formatting.main_text +
          (prediction.structured_formatting.secondary_text ? ", " + prediction.structured_formatting.secondary_text : "");
        setQuery(short);
        onSelect({ shortDisplay: short, coords, municipio });
      }
    );
  };

  const handleClear = () => {
    setQuery("");
    setSelected(false);
    setPredictions([]);
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
          onFocus={() => predictions.length > 0 && setOpen(true)}
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

      {open && predictions.length > 0 && (
        <ul className="absolute z-50 top-full mt-1 w-full bg-white border border-border rounded-xl shadow-lg overflow-hidden">
          {predictions.map((p) => (
            <li key={p.place_id}>
              <button
                type="button"
                onClick={() => handleSelect(p)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-primary/5 border-b border-border/50 last:border-0 flex items-start gap-2"
              >
                <MapPin size={13} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium leading-tight">{p.structured_formatting.main_text}</p>
                  <p className="text-xs text-muted-foreground">{p.structured_formatting.secondary_text}</p>
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
