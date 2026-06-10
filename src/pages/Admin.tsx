import { useState, useEffect, useRef } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { isSameDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Lock, Pencil, Image as ImageIcon, ImagePlus, ShoppingBag,
  LayoutTemplate, Fuel, MessageCircle, Copy, PlusCircle, Trash2,
} from "lucide-react";

import AdminProductos from "@/components/AdminProductos";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import NotaPago from "@/components/NotaPago";
import Contrato from "@/components/Contrato";
import ReservacionManual, { type NotaData } from "@/components/ReservacionManual";

import AdminShell, { type AdminSection } from "@/components/admin/AdminShell";
import DashboardInicio from "@/components/admin/DashboardInicio";
import ReservacionesView from "@/components/admin/ReservacionesView";
import CalendarioView from "@/components/admin/CalendarioView";
import HistorialView from "@/components/admin/HistorialView";
import MensajesView from "@/components/admin/MensajesView";
import CotizacionesView from "@/components/admin/CotizacionesView";

const ADMIN_PASSWORD = "Chapis3621$";

type CotizadorData = {
  servicios: Record<string, number>;
  precios: Record<string, number>;
  flete: number;
  direccion: string;
  municipio: string;
};

type Reservation = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  event_date: string;
  package: string;
  notes: string | null;
  status: string;
  created_at: string;
  cotizador_data?: CotizadorData | null;
};

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
  read: boolean;
};

// ─── Flete Calculator ──────────────────────────────────────────────────────────
type MunicipioFlete = { id: string; nombre: string; distancia_km: number };

const FleteCalculator = () => {
  const [gasolinaPrecio, setGasolinaPrecio] = useState(24.5);
  const [rendimiento, setRendimiento] = useState(14);
  const [margen, setMargen] = useState(20);
  const [direccionBase, setDireccionBase] = useState("San Nicolás de los Garza, Nuevo León, México");
  const [savingConfig, setSavingConfig] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [municipios, setMunicipios] = useState<MunicipioFlete[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingKm, setEditingKm] = useState("");
  const [km, setKm] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [{ data: cfg }, { data: munis }] = await Promise.all([
        (supabase as any).from("flete_config").select("*").eq("id", 1).single(),
        (supabase as any).from("municipios_flete").select("*").order("sort_order"),
      ]);
      if (cfg) {
        setGasolinaPrecio(cfg.precio_gasolina);
        setRendimiento(cfg.rendimiento_kmpl);
        setMargen(cfg.margen_pct);
        if (cfg.direccion_base) setDireccionBase(cfg.direccion_base);
      }
      if (munis) setMunicipios(munis);
      setLoadingConfig(false);
    };
    load();
  }, []);

  const saveConfig = async () => {
    setSavingConfig(true);
    await (supabase as any).from("flete_config").upsert({
      id: 1,
      precio_gasolina: gasolinaPrecio,
      rendimiento_kmpl: rendimiento,
      margen_pct: margen,
      direccion_base: direccionBase,
    });
    setSavingConfig(false);
    toast.success("Configuración guardada — el cotizador ya refleja los nuevos valores");
  };

  const startEdit = (m: MunicipioFlete) => {
    setEditingId(m.id);
    setEditingKm(String(m.distancia_km));
  };

  const saveDistancia = async (id: string) => {
    const kmVal = parseFloat(editingKm);
    if (isNaN(kmVal) || kmVal < 0) { toast.error("Distancia inválida"); return; }
    await (supabase as any).from("municipios_flete").update({ distancia_km: kmVal }).eq("id", id);
    setMunicipios((prev) => prev.map((m) => m.id === id ? { ...m, distancia_km: kmVal } : m));
    setEditingId(null);
    toast.success("Distancia actualizada");
  };

  const calcFlete = (kmDist: number) => {
    if (kmDist === 0) return 0;
    const kmTotal = kmDist * 2;
    const litros = kmTotal / rendimiento;
    const costoGas = litros * gasolinaPrecio;
    return Math.ceil(costoGas * (1 + margen / 100));
  };

  const kmNum = parseFloat(km) || 0;
  const kmTotal = kmNum * 2;
  const litros = kmTotal / rendimiento;
  const costoGasolina = litros * gasolinaPrecio;
  const flete = Math.ceil(costoGasolina * (1 + margen / 100));

  const copiar = () => {
    navigator.clipboard.writeText(String(flete));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (loadingConfig) return <div className="text-center py-10 text-muted-foreground">Cargando configuración...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary/10 rounded-xl p-2.5"><Fuel size={20} className="text-primary" /></div>
        <div>
          <h2 className="font-heading font-bold text-base">Configuración de Flete</h2>
          <p className="text-xs text-muted-foreground">Los cambios se aplican automáticamente en el cotizador del cliente</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-4">Parámetros del vehículo</p>
        <div className="mb-4">
          <Label className="text-xs">Dirección base (tu punto de salida)</Label>
          <div className="mt-1">
            <AddressAutocomplete
              value={direccionBase}
              onSelect={(result) => setDireccionBase(result.shortDisplay)}
              onClear={() => setDireccionBase("")}
              placeholder="Ej: Calle Roble 123, Col. Las Brisas, San Nicolás"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Usada para calcular distancia real con el mapa cuando el cliente ingresa su dirección.</p>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label className="text-xs">Precio gasolina ($/L)</Label>
            <Input type="number" min={1} step={0.5} value={gasolinaPrecio}
              onChange={(e) => setGasolinaPrecio(parseFloat(e.target.value) || 0)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Rendimiento (km/L)</Label>
            <Input type="number" min={1} step={0.5} value={rendimiento}
              onChange={(e) => setRendimiento(parseFloat(e.target.value) || 1)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Ganancia (%)</Label>
            <Input type="number" min={0} value={margen}
              onChange={(e) => setMargen(parseFloat(e.target.value) || 0)} className="mt-1" />
          </div>
        </div>
        <Button variant="hero" className="w-full" onClick={saveConfig} disabled={savingConfig}>
          {savingConfig ? "Guardando..." : "Guardar configuración del vehículo"}
        </Button>
      </div>

      {municipios.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Distancias por municipio (km, solo ida)</p>
          <p className="text-xs text-muted-foreground mb-4">El flete se calcula ida y vuelta automáticamente. San Nicolás = 0 km = sin flete.</p>
          <div className="space-y-0.5">
            {municipios.map((m) => {
              const fleteM = calcFlete(m.distancia_km);
              const isEditing = editingId === m.id;
              return (
                <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                  <span className="flex-1 text-sm font-medium">{m.nombre}</span>
                  {isEditing ? (
                    <>
                      <Input type="number" min={0} step={0.5} value={editingKm}
                        onChange={(e) => setEditingKm(e.target.value)}
                        className="w-24 h-8 text-sm" autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") saveDistancia(m.id); if (e.key === "Escape") setEditingId(null); }}
                      />
                      <Button size="sm" variant="hero" onClick={() => saveDistancia(m.id)}>Guardar</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-muted-foreground w-14 text-right">{m.distancia_km} km</span>
                      <span className={`text-sm font-bold w-20 text-right ${fleteM === 0 ? "text-green-600" : "text-primary"}`}>
                        {fleteM === 0 ? "Incluido" : `$${fleteM}`}
                      </span>
                      <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => startEdit(m)}>
                        <Pencil size={12} />
                      </Button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-4">Calculadora manual (destino no listado)</p>
        <div>
          <Label>Distancia al destino (km, solo ida)</Label>
          <Input type="number" min={0} value={km} onChange={(e) => setKm(e.target.value)}
            placeholder="Ej: 18" className="mt-1" autoFocus />
          {kmNum > 0 && <p className="text-xs text-muted-foreground mt-1">Recorrido total: {kmTotal} km (ida y vuelta)</p>}
        </div>
        {kmNum > 0 && (
          <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="space-y-1.5 text-sm mb-4 text-muted-foreground">
              <div className="flex justify-between">
                <span>{kmTotal} km ÷ {rendimiento} km/L</span>
                <span>{litros.toFixed(2)} L</span>
              </div>
              <div className="flex justify-between">
                <span>{litros.toFixed(2)} L × ${gasolinaPrecio}/L</span>
                <span>${costoGasolina.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>+ {margen}% ganancia</span>
                <span>+${(costoGasolina * margen / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-foreground pt-2 border-t border-primary/20">
                <span>Flete sugerido</span>
                <span className="text-primary text-xl">${flete.toLocaleString()}</span>
              </div>
            </div>
            <Button variant="hero" className="w-full" onClick={copiar}>
              <Copy size={15} /> {copiado ? "¡Copiado!" : "Copiar monto"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Servicios Admin ─────────────────────────────────────────────────────────
type ServicioCard = { id: string; titulo: string; subtitulo: string; descripcion: string; desde: string; img_url: string | null; href: string; orden: number; activa: boolean };
const emptyServicio = () => ({ titulo: "", subtitulo: "", descripcion: "", desde: "", img_url: null as string | null, href: "/servicios" });

const ServiciosAdmin = () => {
  const [cards, setCards] = useState<ServicioCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<ServicioCard | null>(null);
  const [form, setForm] = useState(emptyServicio());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadCards = async () => {
    const { data } = await (supabase as any).from("servicios_cards").select("*").order("orden");
    if (data) setCards(data);
    setLoading(false);
  };
  useEffect(() => { loadCards(); }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const { data, error } = await supabase.storage.from("galeria").upload(`servicios/${Date.now()}.${ext}`, file);
    if (error) { toast.error("Error al subir imagen"); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("galeria").getPublicUrl(data.path);
    setForm((f) => ({ ...f, img_url: publicUrl }));
    setUploading(false);
    toast.success("Imagen subida");
  };

  const save = async () => {
    if (!form.titulo.trim()) { toast.error("El título es requerido"); return; }
    if (editing) {
      const { error } = await (supabase as any).from("servicios_cards").update({ titulo: form.titulo, subtitulo: form.subtitulo, descripcion: form.descripcion, desde: form.desde, img_url: form.img_url, href: form.href }).eq("id", editing.id);
      if (error) { toast.error("Error al guardar: " + error.message); return; }
      toast.success("Servicio actualizado");
    } else {
      const maxOrden = cards.length > 0 ? Math.max(...cards.map((c) => c.orden)) + 1 : 1;
      const { error } = await (supabase as any).from("servicios_cards").insert({ ...form, orden: maxOrden, activa: true });
      if (error) { toast.error("Error al agregar: " + error.message); return; }
      toast.success("Servicio agregado");
    }
    setEditing(null); setIsAdding(false); setForm(emptyServicio());
    await loadCards();
  };

  const deleteCard = async (card: ServicioCard) => {
    await (supabase as any).from("servicios_cards").delete().eq("id", card.id);
    if (card.img_url?.includes("/storage/v1/object/public/galeria/")) {
      const path = card.img_url.split("/storage/v1/object/public/galeria/")[1];
      await supabase.storage.from("galeria").remove([path]);
    }
    setCards((prev) => prev.filter((c) => c.id !== card.id));
    toast.success("Servicio eliminado");
  };

  const toggleActive = async (card: ServicioCard) => {
    await (supabase as any).from("servicios_cards").update({ activa: !card.activa }).eq("id", card.id);
    setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, activa: !c.activa } : c)));
  };

  const startEdit = (card: ServicioCard) => {
    setEditing(card); setIsAdding(true);
    setForm({ titulo: card.titulo, subtitulo: card.subtitulo, descripcion: card.descripcion, desde: card.desde, img_url: card.img_url, href: card.href });
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-xl p-2"><ShoppingBag size={18} className="text-primary" /></div>
          <div>
            <h2 className="font-heading font-bold text-base">Tarjetas de Servicios</h2>
            <p className="text-xs text-muted-foreground">Aparecen como historias en "Nuestros Servicios" en el inicio</p>
          </div>
        </div>
        {!isAdding && (
          <Button variant="hero" size="sm" onClick={() => setIsAdding(true)}><PlusCircle size={14} /> Agregar</Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl border border-border p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-4">{editing ? "Editar servicio" : "Nuevo servicio"}</p>
          <div className="flex gap-4 items-start mb-4">
            <div className="w-20 flex-none rounded-xl overflow-hidden bg-muted border border-border" style={{ aspectRatio: "9/16" }}>
              {form.img_url ? (
                <img src={form.img_url} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ImageIcon size={16} className="text-muted-foreground" /></div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <ImagePlus size={13} /> {uploading ? "Subiendo..." : "Subir imagen (9:16 ideal)"}
              </Button>
              <Input value={form.img_url ?? ""} onChange={(e) => setForm((f) => ({ ...f, img_url: e.target.value || null }))} placeholder="o pegar URL" className="text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><Label className="text-xs">Título *</Label><Input value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} placeholder="Baby Play Zone" className="mt-1 text-sm" /></div>
            <div><Label className="text-xs">Subtítulo / Badge</Label><Input value={form.subtitulo} onChange={(e) => setForm((f) => ({ ...f, subtitulo: e.target.value }))} placeholder="Inflable Castillo" className="mt-1 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><Label className="text-xs">Precio / Desde</Label><Input value={form.desde} onChange={(e) => setForm((f) => ({ ...f, desde: e.target.value }))} placeholder="Desde $800" className="mt-1 text-sm" /></div>
            <div><Label className="text-xs">Enlace</Label><Input value={form.href} onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))} placeholder="/servicios" className="mt-1 text-sm" /></div>
          </div>
          <div className="mb-4">
            <Label className="text-xs">Descripción</Label>
            <textarea value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} placeholder="Describe el servicio..." className="mt-1 w-full text-sm border border-input rounded-xl px-3 py-2 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => { setIsAdding(false); setEditing(null); setForm(emptyServicio()); }}>Cancelar</Button>
            <Button variant="hero" size="sm" onClick={save}>{editing ? "Guardar cambios" : "Agregar servicio"}</Button>
          </div>
        </div>
      )}

      {cards.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
          <ShoppingBag size={32} className="mx-auto mb-2 opacity-25" />
          <p className="text-sm">No hay tarjetas todavía</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {cards.map((card) => (
            <div key={card.id} className={`relative group rounded-2xl overflow-hidden border-2 ${card.activa ? "border-border" : "border-red-200 opacity-60"}`} style={{ aspectRatio: "9/16" }}>
              {card.img_url ? (
                <img src={card.img_url} alt={card.titulo} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-lavender/40 to-pink-100 flex items-center justify-center">
                  <ImageIcon size={20} className="text-primary/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                {card.subtitulo && <p className="text-[8px] text-white/60 uppercase tracking-wide truncate">{card.subtitulo}</p>}
                <p className="text-xs font-bold text-white leading-tight truncate">{card.titulo}</p>
                {card.desde && <p className="text-[9px] text-white/70">{card.desde}</p>}
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                <Button size="sm" className="h-6 text-[10px] px-2 bg-white text-black hover:bg-gray-100 border-0" onClick={() => startEdit(card)}><Pencil size={10} /> Editar</Button>
                <Button size="sm" className="h-6 text-[10px] px-2 bg-white text-black hover:bg-gray-100 border-0" onClick={() => toggleActive(card)}>{card.activa ? "Ocultar" : "Mostrar"}</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" className="h-6 px-2 text-[10px]"><Trash2 size={10} /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar "{card.titulo}"?</AlertDialogTitle>
                      <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteCard(card)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              {!card.activa && <div className="absolute top-1 left-1 bg-red-500 text-white text-[8px] px-1 py-0.5 rounded">Oculta</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Galería ─────────────────────────────────────────────────────────────────
type GaleriaItem = { id: string; url: string; alt: string; orden: number; activa: boolean };

const GaleriaAdmin = () => {
  const [items, setItems] = useState<GaleriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [altInput, setAltInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadGaleria = async () => {
    const { data } = await (supabase as any).from("galeria").select("*").order("orden");
    if (data) setItems(data);
    setLoading(false);
  };
  useEffect(() => { loadGaleria(); }, []);

  const handleFileUpload = async (e: { target: HTMLInputElement }) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
    const { data, error } = await supabase.storage.from("galeria").upload(fileName, file);
    if (error) { toast.error("Error al subir la imagen"); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("galeria").getPublicUrl(data.path);
    const maxOrden = items.length > 0 ? Math.max(...items.map((i) => i.orden)) + 1 : 1;
    await (supabase as any).from("galeria").insert({ url: publicUrl, alt: altInput || file.name, orden: maxOrden });
    setAltInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    await loadGaleria();
    setUploading(false);
    toast.success("Foto agregada");
  };

  const addByUrl = async () => {
    if (!urlInput.trim()) return;
    const maxOrden = items.length > 0 ? Math.max(...items.map((i) => i.orden)) + 1 : 1;
    await (supabase as any).from("galeria").insert({ url: urlInput.trim(), alt: altInput || "Foto Pequesaurios", orden: maxOrden });
    setUrlInput(""); setAltInput("");
    await loadGaleria();
    toast.success("Foto agregada");
  };

  const deleteItem = async (item: GaleriaItem) => {
    await (supabase as any).from("galeria").delete().eq("id", item.id);
    if (item.url.includes("/storage/v1/object/public/galeria/")) {
      const path = item.url.split("/storage/v1/object/public/galeria/")[1];
      await supabase.storage.from("galeria").remove([path]);
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    toast.success("Foto eliminada");
  };

  const toggleActive = async (item: GaleriaItem) => {
    await (supabase as any).from("galeria").update({ activa: !item.activa }).eq("id", item.id);
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, activa: !i.activa } : i)));
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Cargando galería...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 rounded-xl p-2.5"><ImageIcon size={18} className="text-primary" /></div>
        <div>
          <h2 className="font-heading font-bold text-base">Galería de Fotos</h2>
          <p className="text-xs text-muted-foreground">Las fotos activas aparecen en "Nuestros eventos" en la página de inicio</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5 space-y-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <p className="text-xs font-semibold text-muted-foreground uppercase">Agregar foto</p>
        <div>
          <Label className="text-xs">Descripción (opcional)</Label>
          <Input value={altInput} onChange={(e) => setAltInput(e.target.value)}
            placeholder="Ej: Baby Play Zone en fiesta de cumpleaños" className="mt-1 text-sm" />
        </div>
        <div>
          <Label className="text-xs">Subir desde dispositivo</Label>
          <div className="mt-1">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <ImagePlus size={16} /> {uploading ? "Subiendo..." : "Seleccionar imagen (JPG, PNG, WebP)"}
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-muted-foreground">o pegar link</span>
          <div className="flex-1 border-t border-border" />
        </div>
        <div className="flex gap-2">
          <Input value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://..." className="text-sm flex-1"
            onKeyDown={(e) => e.key === "Enter" && addByUrl()} />
          <Button variant="hero" onClick={addByUrl} disabled={!urlInput.trim()}>Agregar</Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
          <ImageIcon size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay fotos en la galería todavía</p>
          <p className="text-xs mt-1">Sube o pega un link arriba para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.id} className={`relative group rounded-2xl overflow-hidden border-2 ${item.activa ? "border-border" : "border-red-200 opacity-60"}`}>
              <img src={item.url} alt={item.alt} className="w-full h-36 object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <Button size="sm" className="h-7 text-xs bg-white text-black hover:bg-gray-100 border-0" onClick={() => toggleActive(item)}>
                  {item.activa ? "Ocultar" : "Mostrar"}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" className="h-7 px-2"><Trash2 size={12} /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar foto?</AlertDialogTitle>
                      <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteItem(item)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              {!item.activa && <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded">Oculta</div>}
              {item.alt && <p className="text-xs text-muted-foreground px-2 py-1 truncate bg-white/90">{item.alt}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Link Generador de Reseña ─────────────────────────────────────────────────
const LinkResena = () => {
  const [nombre, setNombre] = useState("");
  const [tipo,   setTipo]   = useState("");
  const [nino,   setNino]   = useState("");
  const [edad,   setEdad]   = useState("");
  const [copiado, setCopiado] = useState(false);

  const BASE = "https://pequesaurios.pages.dev/gracias";
  const link = nombre.trim() ? `${BASE}?nombre=${encodeURIComponent(nombre.trim())}` : BASE;

  const copiar = () => {
    navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const saludo = nombre.trim() ? `¡Hola ${nombre.trim()}!` : "¡Hola!";
  const festejo = nino.trim() ? `de ${nino.trim()}` : "de tu evento especial";
  const wa = `https://wa.me/?text=${encodeURIComponent(
    `${saludo} Fue un placer ser parte ${festejo}. Te compartimos un link para que nos cuentes cómo te fue:\n\n${link}\n\n¡Solo toma un minuto y nos ayuda muchísimo!\n— Equipo Pequesaurios`
  )}`;

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary/10 rounded-xl p-2.5"><MessageCircle size={18} className="text-primary" /></div>
        <div>
          <h2 className="font-heading font-bold text-base">Generar link de reseña</h2>
          <p className="text-xs text-muted-foreground">El cliente solo ve la página personalizada y deja su opinión</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5 space-y-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <div>
          <Label className="text-xs">Nombre del cliente *</Label>
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Ana, María, Sofía..." className="mt-1" autoFocus />
        </div>
        <div>
          <Label className="text-xs">Tipo de evento</Label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}
            className="mt-1 w-full border border-input rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">Sin especificar</option>
            <option value="cumpleanos">Cumpleaños</option>
            <option value="bautizo">Bautizo</option>
            <option value="sin-motivo">Sin motivo especial</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Festejado (opcional)</Label>
            <Input value={nino} onChange={(e) => setNino(e.target.value)} placeholder="Ej: Emilio, Luna..." className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Edad (opcional)</Label>
            <Input value={edad} onChange={(e) => setEdad(e.target.value)} placeholder="Ej: 3, 4 años..." className="mt-1" />
          </div>
        </div>
        <div className="bg-muted/50 rounded-xl px-3 py-2 text-xs text-muted-foreground break-all font-mono border border-border">
          {link}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full" onClick={copiar}>
            <Copy size={15} /> {copiado ? "¡Copiado!" : "Copiar link"}
          </Button>
          <Button variant="whatsapp" className="w-full" asChild>
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={15} /> Enviar por WhatsApp
            </a>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          La reseña se guarda con el nombre de la mamá y datos del festejado automáticamente.
        </p>
      </div>
    </div>
  );
};

// ─── Mobiliario Admin ─────────────────────────────────────────────────────────
type MobCfg = {
  badge: string; titulo: string; descripcion: string; precio: number;
  features: string[]; img_hero: string | null;
  silla1_titulo: string; silla1_desc: string; silla1_img: string | null;
  silla2_titulo: string; silla2_desc: string; silla2_img: string | null;
};

const MOB_DEFAULT: MobCfg = {
  badge: "Favorito Mamás", titulo: "Mesita de Madera Blanca",
  descripcion: "Mesa de madera color blanco acompañada de 8 sillas infantiles a juego.",
  precio: 500,
  features: ["1 mesita de madera color blanco", "8 sillas infantiles incluidas", "Disponibles hasta 2 mesas", "Entrega y recolección incluidas"],
  img_hero: null,
  silla1_titulo: "Sillas Pasteles", silla1_desc: "Sillas de colores suaves: rosa, lila, menta y amarillo.", silla1_img: null,
  silla2_titulo: "Sillas Conejito & Arcoíris", silla2_desc: "Figuras blancas en forma de conejito y arcoíris.", silla2_img: null,
};

const MobiliarioAdmin = () => {
  const [cfg, setCfg] = useState<MobCfg>(MOB_DEFAULT);
  const [featText, setFeatText] = useState(MOB_DEFAULT.features.join("\n"));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const heroRef = useRef<HTMLInputElement>(null);
  const s1Ref = useRef<HTMLInputElement>(null);
  const s2Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).from("mobiliario_config").select("*").eq("id", 1).single();
      if (data) {
        const features = Array.isArray(data.features) ? data.features : MOB_DEFAULT.features;
        setCfg({ ...MOB_DEFAULT, ...data, features });
        setFeatText(features.join("\n"));
      }
      setLoading(false);
    })();
  }, []);

  const uploadImg = async (file: File, field: keyof MobCfg) => {
    setUploading(field);
    const ext = file.name.split(".").pop();
    const { data, error } = await supabase.storage.from("galeria").upload(`mobiliario/${Date.now()}.${ext}`, file);
    if (error) { toast.error("Error al subir imagen"); setUploading(null); return; }
    const { data: { publicUrl } } = supabase.storage.from("galeria").getPublicUrl(data.path);
    setCfg((c) => ({ ...c, [field]: publicUrl }));
    setUploading(null);
    toast.success("Imagen subida");
  };

  const save = async () => {
    setSaving(true);
    const features = featText.split("\n").map((l) => l.trim()).filter(Boolean);
    const { error } = await (supabase as any).from("mobiliario_config").upsert({ ...cfg, features, id: 1 });
    if (error) toast.error("Error: " + error.message);
    else toast.success("¡Contenido actualizado!");
    setSaving(false);
  };

  const ImgField = ({ field, label, inputRef, src }: { field: keyof MobCfg; label: string; inputRef: React.RefObject<HTMLInputElement>; src: string | null }) => (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1 flex gap-2 items-start">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted border border-border flex items-center justify-center flex-shrink-0">
          {src ? <img src={src} alt={label} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-muted-foreground" />}
        </div>
        <div className="flex-1 space-y-1">
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImg(f, field); }} />
          <Button variant="outline" size="sm" className="w-full text-xs"
            onClick={() => inputRef.current?.click()} disabled={uploading === field}>
            <ImagePlus size={12} /> {uploading === field ? "Subiendo..." : "Subir foto"}
          </Button>
          <Input value={src ?? ""} onChange={(e) => setCfg((c) => ({ ...c, [field]: e.target.value || null }))}
            placeholder="o pegar URL" className="text-xs" />
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="text-center py-8 text-muted-foreground">Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary/10 rounded-xl p-2.5"><LayoutTemplate size={18} className="text-primary" /></div>
        <div>
          <h2 className="font-heading font-bold text-base">Página Mobiliario Infantil</h2>
          <p className="text-xs text-muted-foreground">Edita el contenido y fotos de /mobiliario-infantil</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5 space-y-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <p className="text-xs font-semibold text-muted-foreground uppercase">Información principal</p>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Badge / Etiqueta</Label><Input value={cfg.badge} onChange={(e) => setCfg((c) => ({ ...c, badge: e.target.value }))} className="mt-1 text-sm" /></div>
          <div><Label className="text-xs">Precio por mesa ($)</Label><Input type="number" value={cfg.precio} onChange={(e) => setCfg((c) => ({ ...c, precio: parseInt(e.target.value) || 0 }))} className="mt-1 text-sm" /></div>
        </div>
        <div><Label className="text-xs">Título</Label><Input value={cfg.titulo} onChange={(e) => setCfg((c) => ({ ...c, titulo: e.target.value }))} className="mt-1 text-sm" /></div>
        <div>
          <Label className="text-xs">Descripción</Label>
          <textarea value={cfg.descripcion} onChange={(e) => setCfg((c) => ({ ...c, descripcion: e.target.value }))}
            className="mt-1 w-full text-sm border border-input rounded-xl px-3 py-2 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <Label className="text-xs">Características (una por línea)</Label>
          <textarea value={featText} onChange={(e) => setFeatText(e.target.value)}
            className="mt-1 w-full text-sm border border-input rounded-xl px-3 py-2 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <ImgField field="img_hero" label="Foto principal del producto" inputRef={heroRef} src={cfg.img_hero} />
      </div>

      <div className="bg-white rounded-2xl border border-border p-5 space-y-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <p className="text-xs font-semibold text-muted-foreground uppercase">Estilos de sillas</p>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <p className="text-xs font-bold text-primary">Opción A</p>
            <div><Label className="text-xs">Título</Label><Input value={cfg.silla1_titulo} onChange={(e) => setCfg((c) => ({ ...c, silla1_titulo: e.target.value }))} className="mt-1 text-sm" /></div>
            <div>
              <Label className="text-xs">Descripción</Label>
              <textarea value={cfg.silla1_desc} onChange={(e) => setCfg((c) => ({ ...c, silla1_desc: e.target.value }))}
                className="mt-1 w-full text-sm border border-input rounded-xl px-3 py-2 resize-none h-16 focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <ImgField field="silla1_img" label="Foto Opción A" inputRef={s1Ref} src={cfg.silla1_img} />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-purple-600">Opción B</p>
            <div><Label className="text-xs">Título</Label><Input value={cfg.silla2_titulo} onChange={(e) => setCfg((c) => ({ ...c, silla2_titulo: e.target.value }))} className="mt-1 text-sm" /></div>
            <div>
              <Label className="text-xs">Descripción</Label>
              <textarea value={cfg.silla2_desc} onChange={(e) => setCfg((c) => ({ ...c, silla2_desc: e.target.value }))}
                className="mt-1 w-full text-sm border border-input rounded-xl px-3 py-2 resize-none h-16 focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <ImgField field="silla2_img" label="Foto Opción B" inputRef={s2Ref} src={cfg.silla2_img} />
          </div>
        </div>
      </div>

      <Button variant="hero" className="w-full" onClick={save} disabled={saving}>
        {saving ? "Guardando..." : "Guardar todos los cambios"}
      </Button>
    </div>
  );
};

// ─── Login ───────────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm border border-border" style={{ boxShadow: "var(--shadow-float)" }}>
        <div className="flex flex-col items-center mb-6">
          <div className="bg-primary/10 rounded-2xl p-4 mb-3">
            <Lock size={28} className="text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold">Admin Pequesaurios</h1>
          <p className="text-sm text-muted-foreground mt-1">Acceso restringido</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password" type="password" value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="••••••••" autoFocus className="mt-1"
            />
            {error && <p className="text-red-500 text-xs mt-1">Contraseña incorrecta</p>}
          </div>
          <Button type="submit" variant="hero" className="w-full">Entrar</Button>
        </form>
      </div>
    </div>
  );
};

// ─── Main Admin ───────────────────────────────────────────────────────────────
const Admin = () => {
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem("admin_auth") === "true");
  const [activeSection, setActiveSection] = useState<AdminSection>("inicio");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [contacts, setContacts]   = useState<ContactMessage[]>([]);
  const [quotes, setQuotes]       = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading]     = useState(false);
  const [blockedDate, setBlockedDate] = useState<Date | undefined>();
  const [blockReason, setBlockReason] = useState("");
  const [notaReservation, setNotaReservation] = useState<Reservation | null>(null);
  const [notaPrefill, setNotaPrefill] = useState<Parameters<typeof NotaPago>[0]["prefill"]>(undefined);
  const [contratoReservation, setContratoReservation] = useState<Reservation | null>(null);
  const [contratoPrefill, setContratoPrefill] = useState<import("@/components/Contrato").ContratoPrefill | undefined>(undefined);
  const [reservacionManualOpen, setReservacionManualOpen] = useState(false);

  const fetchContacts = async () => {
    const { data } = await (supabase as any).from("contacts").select("*").order("created_at", { ascending: false });
    if (data) setContacts(data);
  };

  const fetchQuotes = async () => {
    const { data } = await (supabase as any).from("quotes").select("*").order("created_at", { ascending: false });
    if (data) setQuotes(data);
  };

  const markQuoteRead = async (id: string) => {
    await (supabase as any).from("quotes").update({ read: true }).eq("id", id);
    setQuotes((prev) => prev.map((q) => q.id === id ? { ...q, read: true } : q));
  };

  const deleteQuote = async (id: string) => {
    await (supabase as any).from("quotes").delete().eq("id", id);
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  const markContactRead = async (id: string) => {
    await (supabase as any).from("contacts").update({ read: true }).eq("id", id);
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, read: true } : c));
  };

  const deleteContact = async (id: string) => {
    await (supabase as any).from("contacts").delete().eq("id", id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const fetchReservations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("event_date", { ascending: true });
    if (error) {
      toast.error("Error al cargar reservaciones");
    } else {
      setReservations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) {
      fetchReservations();
      fetchContacts();
      fetchQuotes();
    }
  }, [authenticated]);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("reservations").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast.error(`Error al actualizar: ${error.message}`);
      fetchReservations();
    } else {
      const { data: check } = await supabase.from("reservations").select("status").eq("id", id).single();
      if (check?.status === newStatus) {
        toast.success("Estado actualizado");
        fetchReservations();
      } else {
        toast.error("No se pudo actualizar. Verifica las políticas RLS en Supabase.");
        fetchReservations();
      }
    }
  };

  const notifyClient = (r: Reservation, tipo: "confirmada" | "cancelada") => {
    const pkgLabels: Record<string, string> = {
      inflable: "Inflable Castillo Blanco",
      mobiliario: "Mobiliario Infantil",
      pintacaritas: "Pintacaritas",
      yesitos: "Kit de Yesitos",
      "paquete-completo": "Paquete Completo",
    };
    const [year, month, day] = r.event_date.split("-");
    const fecha = `${day}/${month}/${year}`;
    const nombre = r.customer_name.split(" ")[0];
    const paquete = pkgLabels[r.package] ?? r.package;
    const notasLinea = r.notes ? `\n*Detalle:* ${r.notes}` : "";
    const mensaje = tipo === "confirmada"
      ? `¡Hola ${nombre}! Queremos confirmarte que recibimos tu reservación con *Pequesaurios*\n\n*Fecha:* ${fecha}\n*Servicios:* ${paquete}${notasLinea}\n\nPara agendar tu espacio y confirmar la reservación es necesario realizar el anticipo del *50%* a la siguiente cuenta:\n\n*Nombre:* Elena Estefania Saldivar Martinez\n*Banco:* BBVA\n*Tarjeta:* 4152 3141 0801 077\n*Concepto:* ${r.customer_name}\n\nPor favor envianos foto del comprobante de transferencia para confirmar tu lugar.\n\nSi tienes alguna duda o cambio, escribenos aqui mismo. Nos vemos pronto!`
      : `Hola ${nombre}, te informamos que tu reservación del *${fecha}* con *Pequesaurios* ha sido *cancelada*.\n\nSi deseas reagendar o tienes alguna pregunta, con gusto te ayudamos.`;
    const phone = r.customer_phone.replace(/\D/g, "");
    const phoneWithCode = phone.startsWith("52") ? phone : `52${phone}`;
    window.open(`https://wa.me/${phoneWithCode}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  const deleteReservation = async (id: string) => {
    const { error } = await supabase.from("reservations").delete().eq("id", id);
    if (error) { toast.error(`Error al eliminar: ${error.message}`); fetchReservations(); return; }
    const { data: check } = await supabase.from("reservations").select("id").eq("id", id).single();
    if (check) {
      toast.error("No se pudo eliminar. Verifica las políticas RLS en Supabase.");
    } else {
      toast.success("Eliminado correctamente");
    }
    fetchReservations();
  };

  const handleReservacionCreada = (notaData: NotaData) => {
    fetchReservations();
    setNotaReservation(notaData.reservation as Reservation);
    setNotaPrefill({
      address: notaData.address,
      hora: notaData.hora,
      paqueteNombre: notaData.paqueteNombre,
      servicios: notaData.servicios,
      precios: notaData.precios,
      flete: notaData.flete,
      metodoPago: notaData.metodoPago,
      skipToPreview: Object.values(notaData.servicios).some((v) => v > 0),
    });
    setContratoPrefill({
      address: notaData.address,
      hora: notaData.hora,
      horaFin: notaData.horaFin,
      servicios: Object.keys(notaData.servicios).filter((id) => notaData.servicios[id] > 0),
      total: notaData.total,
      anticipo: notaData.anticipo,
    });
    setContratoReservation(notaData.reservation as Reservation);
  };

  const addBlockedDate = async () => {
    if (!blockedDate) { toast.error("Selecciona una fecha"); return; }
    const alreadyBlocked = reservations.some(
      (r) => isSameDay(parseISO(r.event_date + "T12:00:00"), blockedDate) && r.package === "bloqueado"
    );
    if (alreadyBlocked) { toast.error("Esa fecha ya está bloqueada"); return; }
    const { error } = await supabase.from("reservations").insert({
      customer_name: "Bloqueado (Admin)",
      customer_phone: "000",
      event_date: format(blockedDate, "yyyy-MM-dd"),
      package: "bloqueado",
      notes: blockReason || null,
      status: "confirmada",
    });
    if (error) {
      toast.error("Error al bloquear fecha");
    } else {
      toast.success("Fecha bloqueada correctamente");
      setBlockedDate(undefined);
      setBlockReason("");
      fetchReservations();
    }
  };

  const realReservations       = reservations.filter((r) => r.package !== "bloqueado");
  const activeReservations     = realReservations.filter((r) => r.status !== "completada");
  const completedReservations  = realReservations.filter((r) => r.status === "completada");
  const blockedDates           = reservations.filter((r) => r.package === "bloqueado");
  const bookedDatesForCalendar = reservations
    .filter((r) => r.status === "pendiente" || r.status === "confirmada")
    .map((r) => new Date(r.event_date + "T12:00:00"));

  const unreadMessages = contacts.filter((c) => !c.read).length;
  const unreadQuotes   = quotes.filter((q) => !q.read).length;

  if (!authenticated) {
    return <LoginScreen onLogin={() => { localStorage.setItem("admin_auth", "true"); setAuthenticated(true); }} />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case "inicio":
        return (
          <DashboardInicio
            reservations={realReservations}
            contacts={contacts}
            quotes={quotes}
            notifyClient={notifyClient}
            setActiveSection={setActiveSection}
          />
        );
      case "reservaciones":
        return (
          <ReservacionesView
            reservations={activeReservations}
            loading={loading}
            updateStatus={updateStatus}
            notifyClient={notifyClient}
            deleteReservation={deleteReservation}
            setNotaReservation={setNotaReservation}
            setNotaPrefill={setNotaPrefill}
            setContratoReservation={setContratoReservation}
            setContratoPrefill={setContratoPrefill}
            setReservacionManualOpen={setReservacionManualOpen}
          />
        );
      case "calendario":
        return (
          <CalendarioView
            reservations={reservations}
            blockedDate={blockedDate}
            setBlockedDate={setBlockedDate}
            blockReason={blockReason}
            setBlockReason={setBlockReason}
            addBlockedDate={addBlockedDate}
            deleteReservation={deleteReservation}
            bookedDatesForCalendar={bookedDatesForCalendar}
            blockedDates={blockedDates}
          />
        );
      case "historial":
        return (
          <HistorialView
            reservations={completedReservations}
            updateStatus={updateStatus}
            deleteReservation={deleteReservation}
            setNotaReservation={setNotaReservation}
            setNotaPrefill={setNotaPrefill}
          />
        );
      case "mensajes":
        return (
          <MensajesView
            contacts={contacts}
            markContactRead={markContactRead}
            deleteContact={deleteContact}
          />
        );
      case "cotizaciones":
        return (
          <CotizacionesView
            quotes={quotes}
            markQuoteRead={markQuoteRead}
            deleteQuote={deleteQuote}
            setReservacionManualOpen={setReservacionManualOpen}
          />
        );
      case "productos":
        return <AdminProductos />;
      case "galeria":
        return (
          <div className="space-y-8">
            <GaleriaAdmin />
            <div className="border-t border-border pt-8">
              <ServiciosAdmin />
            </div>
          </div>
        );
      case "resenas":
        return <LinkResena />;
      case "mobiliario":
        return <MobiliarioAdmin />;
      case "flete":
        return <FleteCalculator />;
      default:
        return null;
    }
  };

  return (
    <AdminShell
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      onRefresh={() => { fetchReservations(); fetchContacts(); fetchQuotes(); }}
      onLogout={() => { localStorage.removeItem("admin_auth"); setAuthenticated(false); }}
      loading={loading}
      unreadMessages={unreadMessages}
      unreadQuotes={unreadQuotes}
      historialCount={completedReservations.length}
    >
      {renderSection()}

      <NotaPago
        reservation={notaReservation}
        open={!!notaReservation}
        onClose={() => { setNotaReservation(null); setNotaPrefill(undefined); }}
        prefill={notaPrefill}
      />

      <Contrato
        reservation={contratoReservation}
        open={!!contratoReservation}
        onClose={() => { setContratoReservation(null); setContratoPrefill(undefined); }}
        prefill={contratoPrefill}
      />

      <ReservacionManual
        open={reservacionManualOpen}
        onClose={() => setReservacionManualOpen(false)}
        bookedDates={bookedDatesForCalendar}
        onCreated={handleReservacionCreada}
      />
    </AdminShell>
  );
};

export default Admin;
