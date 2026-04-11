import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus, ImageIcon, X, Star, GripVertical } from "lucide-react";

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
  active: boolean;
  sort_order: number;
};

type Extra = {
  id: string;
  name: string;
  price: string;
  price_number: number;
  description: string | null;
  image_url: string | null;
  active: boolean;
  sort_order: number;
};

const COLORS = [
  { value: "border-primary",       label: "Rosa" },
  { value: "border-lavender",      label: "Lavanda" },
  { value: "border-mint",          label: "Menta" },
  { value: "border-peach",         label: "Durazno" },
  { value: "border-pastel-yellow", label: "Amarillo" },
];

// ── Subida de imagen ──────────────────────────────────────────────────────────
const ImageUploader = ({
  currentUrl, bucket, folder, onUploaded,
}: { currentUrl: string | null; bucket: string; folder: string; onUploaded: (url: string) => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) { toast.error("Error al subir imagen"); setUploading(false); return; }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onUploaded(data.publicUrl);
    setUploading(false);
    toast.success("Imagen subida");
  };

  return (
    <div className="space-y-2">
      <Label>Imagen</Label>
      <div
        className="relative border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
        style={{ height: 140 }}
        onClick={() => inputRef.current?.click()}
      >
        {currentUrl ? (
          <img src={currentUrl} alt="producto" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <ImageIcon size={28} />
            <span className="text-xs">{uploading ? "Subiendo..." : "Clic para subir foto"}</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-sm font-medium text-primary">
            Subiendo...
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      {currentUrl && (
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => onUploaded("")}>
          <X size={12} /> Quitar imagen
        </Button>
      )}
    </div>
  );
};

// ── Editor de paquete ─────────────────────────────────────────────────────────
const PaqueteForm = ({ pkg, onSave, onClose }: { pkg: Partial<Package> | null; onSave: () => void; onClose: () => void }) => {
  const [name, setName] = useState(pkg?.name ?? "");
  const [subtitle, setSubtitle] = useState(pkg?.subtitle ?? "");
  const [price, setPrice] = useState(String(pkg?.price ?? ""));
  const [popular, setPopular] = useState(pkg?.popular ?? false);
  const [color, setColor] = useState(pkg?.color ?? "border-primary");
  const [items, setItems] = useState<string[]>(pkg?.items ?? [""]);
  const [note, setNote] = useState(pkg?.note ?? "");
  const [imageUrl, setImageUrl] = useState(pkg?.image_url ?? "");
  const [active, setActive] = useState(pkg?.active ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !price) { toast.error("Nombre y precio son obligatorios"); return; }
    setSaving(true);
    const payload = {
      name, subtitle: subtitle || null, price: parseInt(price),
      popular, color, items: items.filter(Boolean),
      note: note || null, image_url: imageUrl || null, active,
    };
    const { error } = pkg?.id
      ? await (supabase as any).from("packages").update(payload).eq("id", pkg.id)
      : await (supabase as any).from("packages").insert({ ...payload, sort_order: 99 });
    setSaving(false);
    if (error) { toast.error("Error al guardar"); return; }
    toast.success("Paquete guardado");
    onSave();
  };

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Nombre *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Baby Play Zone Plus" />
        </div>
        <div>
          <Label>Subtítulo</Label>
          <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Ej: Inflable + Mesita" />
        </div>
        <div>
          <Label>Precio (MXN) *</Label>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1400" />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Color del borde</Label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button key={c.value} type="button" onClick={() => setColor(c.value)}
              className={`px-3 py-1.5 rounded-lg border-2 text-xs transition-colors ${color === c.value ? "border-primary bg-primary/10 font-semibold" : "border-border"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Qué incluye</Label>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input value={item} onChange={(e) => { const n = [...items]; n[i] = e.target.value; setItems(n); }} placeholder={`Ítem ${i + 1}`} />
              <Button type="button" variant="ghost" size="icon" onClick={() => setItems(items.filter((_, j) => j !== i))} disabled={items.length === 1}>
                <X size={14} />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, ""])}>
            <Plus size={13} /> Agregar ítem
          </Button>
        </div>
      </div>

      <div>
        <Label>Nota (opcional)</Label>
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej: No incluye flete" />
      </div>

      <ImageUploader currentUrl={imageUrl || null} bucket="productos" folder="paquetes" onUploaded={setImageUrl} />

      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={popular} onCheckedChange={setPopular} id="popular" />
          <Label htmlFor="popular">Marcar como popular</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={active} onCheckedChange={setActive} id="active" />
          <Label htmlFor="active">Visible en el sitio</Label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
        <Button variant="hero" className="flex-1" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar paquete"}
        </Button>
      </div>
    </div>
  );
};

// ── Editor de extra ───────────────────────────────────────────────────────────
const ExtraForm = ({ extra, onSave, onClose }: { extra: Partial<Extra> | null; onSave: () => void; onClose: () => void }) => {
  const [name, setName] = useState(extra?.name ?? "");
  const [price, setPrice] = useState(extra?.price ?? "");
  const [priceNum, setPriceNum] = useState(String(extra?.price_number ?? ""));
  const [description, setDescription] = useState(extra?.description ?? "");
  const [imageUrl, setImageUrl] = useState(extra?.image_url ?? "");
  const [active, setActive] = useState(extra?.active ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !price) { toast.error("Nombre y precio son obligatorios"); return; }
    setSaving(true);
    const payload = { name, price, price_number: parseInt(priceNum) || 0, description: description || null, image_url: imageUrl || null, active };
    const { error } = extra?.id
      ? await (supabase as any).from("extras").update(payload).eq("id", extra.id)
      : await (supabase as any).from("extras").insert({ ...payload, sort_order: 99 });
    setSaving(false);
    if (error) { toast.error("Error al guardar"); return; }
    toast.success("Extra guardado");
    onSave();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Nombre *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Pintacaritas" />
        </div>
        <div>
          <Label>Precio (texto) *</Label>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ej: $800 o $20 c/u" />
        </div>
        <div>
          <Label>Precio (número para cotizador)</Label>
          <Input type="number" value={priceNum} onChange={(e) => setPriceNum(e.target.value)} placeholder="800" />
        </div>
      </div>
      <div>
        <Label>Descripción</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: 1.5 horas de servicio" />
      </div>
      <ImageUploader currentUrl={imageUrl || null} bucket="productos" folder="extras" onUploaded={setImageUrl} />
      <div className="flex items-center gap-2">
        <Switch checked={active} onCheckedChange={setActive} id="active-extra" />
        <Label htmlFor="active-extra">Visible en el sitio</Label>
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
        <Button variant="hero" className="flex-1" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar extra"}
        </Button>
      </div>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
const AdminProductos = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [editingPkg, setEditingPkg] = useState<Partial<Package> | null | undefined>(undefined);
  const [editingExtra, setEditingExtra] = useState<Partial<Extra> | null | undefined>(undefined);

  const fetchAll = async () => {
    const [{ data: pkgs }, { data: exts }] = await Promise.all([
      (supabase as any).from("packages").select("*").order("sort_order"),
      (supabase as any).from("extras").select("*").order("sort_order"),
    ]);
    if (pkgs) setPackages(pkgs);
    if (exts) setExtras(exts);
  };

  useEffect(() => { fetchAll(); }, []);

  const deletePkg = async (id: string) => {
    await (supabase as any).from("packages").delete().eq("id", id);
    toast.success("Paquete eliminado");
    fetchAll();
  };

  const deleteExtra = async (id: string) => {
    await (supabase as any).from("extras").delete().eq("id", id);
    toast.success("Extra eliminado");
    fetchAll();
  };

  const toggleActivePkg = async (pkg: Package) => {
    await (supabase as any).from("packages").update({ active: !pkg.active }).eq("id", pkg.id);
    fetchAll();
  };

  const toggleActiveExtra = async (extra: Extra) => {
    await (supabase as any).from("extras").update({ active: !extra.active }).eq("id", extra.id);
    fetchAll();
  };

  return (
    <div>
      <Tabs defaultValue="paquetes">
        <TabsList className="mb-6">
          <TabsTrigger value="paquetes">Paquetes ({packages.length})</TabsTrigger>
          <TabsTrigger value="extras">Extras ({extras.length})</TabsTrigger>
        </TabsList>

        {/* ── Paquetes ── */}
        <TabsContent value="paquetes">
          <div className="flex justify-end mb-4">
            <Button variant="hero" size="sm" onClick={() => setEditingPkg({})}>
              <Plus size={14} /> Nuevo paquete
            </Button>
          </div>
          <div className="space-y-3">
            {packages.map((pkg) => (
              <div key={pkg.id} className={`flex items-center gap-4 rounded-xl border-2 ${pkg.color} bg-white p-4 shadow-sm ${!pkg.active ? "opacity-50" : ""}`}>
                {pkg.image_url ? (
                  <img src={pkg.image_url} alt={pkg.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <ImageIcon size={20} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{pkg.name}</span>
                    {pkg.popular && <Star size={13} className="text-yellow-500 fill-yellow-400" />}
                    {!pkg.active && <span className="text-xs text-muted-foreground">(oculto)</span>}
                  </div>
                  {pkg.subtitle && <p className="text-xs text-muted-foreground">{pkg.subtitle}</p>}
                  <p className="text-primary font-bold text-sm mt-0.5">${pkg.price.toLocaleString()} MXN</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Switch checked={pkg.active} onCheckedChange={() => toggleActivePkg(pkg)} />
                  <Button variant="ghost" size="icon" onClick={() => setEditingPkg(pkg)}>
                    <Pencil size={15} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600">
                        <Trash2 size={15} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar paquete?</AlertDialogTitle>
                        <AlertDialogDescription>Se eliminará <strong>{pkg.name}</strong> del catálogo.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => deletePkg(pkg.id)}>Eliminar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── Extras ── */}
        <TabsContent value="extras">
          <div className="flex justify-end mb-4">
            <Button variant="hero" size="sm" onClick={() => setEditingExtra({})}>
              <Plus size={14} /> Nuevo extra
            </Button>
          </div>
          <div className="space-y-3">
            {extras.map((extra) => (
              <div key={extra.id} className={`flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm ${!extra.active ? "opacity-50" : ""}`}>
                {extra.image_url ? (
                  <img src={extra.image_url} alt={extra.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <ImageIcon size={20} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm">{extra.name}</span>
                  {!extra.active && <span className="text-xs text-muted-foreground ml-2">(oculto)</span>}
                  {extra.description && <p className="text-xs text-muted-foreground">{extra.description}</p>}
                  <p className="text-primary font-bold text-sm mt-0.5">{extra.price}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Switch checked={extra.active} onCheckedChange={() => toggleActiveExtra(extra)} />
                  <Button variant="ghost" size="icon" onClick={() => setEditingExtra(extra)}>
                    <Pencil size={15} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600">
                        <Trash2 size={15} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar extra?</AlertDialogTitle>
                        <AlertDialogDescription>Se eliminará <strong>{extra.name}</strong>.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => deleteExtra(extra.id)}>Eliminar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog paquete */}
      <Dialog open={editingPkg !== undefined} onOpenChange={(v) => { if (!v) setEditingPkg(undefined); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingPkg?.id ? "Editar paquete" : "Nuevo paquete"}</DialogTitle>
          </DialogHeader>
          {editingPkg !== undefined && (
            <PaqueteForm pkg={editingPkg} onSave={() => { setEditingPkg(undefined); fetchAll(); }} onClose={() => setEditingPkg(undefined)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog extra */}
      <Dialog open={editingExtra !== undefined} onOpenChange={(v) => { if (!v) setEditingExtra(undefined); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExtra?.id ? "Editar extra" : "Nuevo extra"}</DialogTitle>
          </DialogHeader>
          {editingExtra !== undefined && (
            <ExtraForm extra={editingExtra} onSave={() => { setEditingExtra(undefined); fetchAll(); }} onClose={() => setEditingExtra(undefined)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProductos;
