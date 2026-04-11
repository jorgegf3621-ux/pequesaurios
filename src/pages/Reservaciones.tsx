import { useState, useEffect } from "react";
import { format, isSameDay, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { PartyPopper, Phone, User, Mail, MessageSquare, Check, TableProperties } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const packages = [
  { group: "Baby Play Zone", value: "bpz-inflable",      label: "Inflable Castillo (solo)" },
  { group: "Baby Play Zone", value: "bpz-basico",        label: "Paquete Básico (inflable + mesita)" },
  { group: "Baby Play Zone", value: "bpz-plus",          label: "Paquete Plus (inflable + mesita arte)" },
  { group: "Inflables",      value: "inflable",           label: "Inflable Castillo Blanco" },
  { group: "Mesas",          value: "mesa-pastel",        label: "Mesa Infantil Pastel (6 sillas)" },
  { group: "Mesas",          value: "mesa-blanca",        label: "Mesita Blanca (8 sillas madera)" },
  { group: "Mesas",          value: "mesa-extra",         label: "Mesa extra adicional" },
  { group: "Yesitos",        value: "yesito-basico",      label: "Kit Yesitos Básico (1 yesito)" },
  { group: "Yesitos",        value: "yesito-intermedio",  label: "Kit Yesitos Intermedio (2 yesitos)" },
  { group: "Yesitos",        value: "yesito-completo",    label: "Kit Yesitos Completo (3 yesitos)" },
  { group: "Extras",         value: "arte",               label: "Arte en Mesa" },
  { group: "Extras",         value: "globos",             label: "Guirnalda de Globos" },
  { group: "Servicios",      value: "pintacaritas",       label: "Pintacaritas (1.5 hrs)" },
];

const groups = [...new Set(packages.map((p) => p.group))];

const Reservaciones = () => {
  const [date, setDate] = useState<Date>();
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMesaPrompt, setShowMesaPrompt] = useState(false);

  useEffect(() => {
    fetchBookedDates();
    const pre = localStorage.getItem("cotizador_seleccion");
    const ids = localStorage.getItem("cotizador_ids");
    if (pre) { localStorage.removeItem("cotizador_seleccion"); setNotes(pre); }
    if (ids) {
      localStorage.removeItem("cotizador_ids");
      try { setSelectedPackages(JSON.parse(ids)); } catch {}
    }
  }, []);

  const fetchBookedDates = async () => {
    const { data } = await supabase
      .from("reservations")
      .select("event_date")
      .in("status", ["pendiente", "confirmada"]);
    if (data) setBookedDates(data.map((r) => new Date(r.event_date + "T12:00:00")));
  };

  const isDateBooked = (day: Date) => bookedDates.some((d) => isSameDay(d, day));

  const IDS_CON_MESITA = new Set(["mesa-pastel", "mesa-blanca", "bpz-basico", "bpz-plus"]);

  const togglePackage = (value: string) => {
    setSelectedPackages((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value);
      // Al agregar un item con mesita, preguntar si quiere segunda mesa (si no la tiene ya)
      if (IDS_CON_MESITA.has(value) && !prev.includes("mesa-extra")) {
        setTimeout(() => setShowMesaPrompt(true), 50);
      }
      return [...prev, value];
    });
  };

  const agregarMesaExtra = () => {
    setSelectedPackages((prev) =>
      prev.includes("mesa-extra") ? prev : [...prev, "mesa-extra"]
    );
    setShowMesaPrompt(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !name || !phone || selectedPackages.length === 0) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    setLoading(true);

    const packageLabel = selectedPackages
      .map((v) => packages.find((p) => p.value === v)?.label ?? v)
      .join(", ");

    const { data: inserted, error } = await supabase
      .from("reservations")
      .insert({
        customer_name: name,
        customer_phone: phone,
        customer_email: email || null,
        event_date: format(date, "yyyy-MM-dd"),
        package: packageLabel,
        notes: notes || null,
      })
      .select("id")
      .single();

    setLoading(false);

    if (error || !inserted) {
      toast.error("Hubo un error al enviar tu reservación. Intenta de nuevo.");
      return;
    }

    toast.success("Reservacion enviada. Te contactaremos pronto para confirmar.");

    setDate(undefined);
    setName("");
    setPhone("");
    setEmail("");
    setSelectedPackages([]);
    setNotes("");
    fetchBookedDates();
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="font-heading text-4xl font-bold text-center mb-2">Reserva tu Fecha</h1>
      <p className="text-muted-foreground text-center mb-12">
        Selecciona la fecha de tu evento y completa el formulario. Las fechas en rosa ya estan reservadas.
      </p>

      {/* Calendar */}
      <div className="flex justify-center mb-10">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={es}
          disabled={(day) => isBefore(day, startOfDay(new Date())) || isDateBooked(day)}
          modifiers={{ booked: bookedDates }}
          modifiersClassNames={{ booked: "bg-primary/30 text-primary line-through" }}
          className="rounded-2xl border border-border shadow-sm p-4 pointer-events-auto"
        />
      </div>

      {date && (
        <div className="bg-primary/10 rounded-xl p-4 mb-8 text-center">
          <p className="font-heading font-bold text-primary">
            Fecha seleccionada: {format(date, "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User size={16} /> Nombre completo *
          </Label>
          <Input
            id="name"
            placeholder="Ej: María García"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone size={16} /> Teléfono / WhatsApp *
          </Label>
          <Input
            id="phone"
            placeholder="Ej: 81 1234 5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail size={16} /> Correo electrónico (opcional)
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Ej: maria@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Paquetes multi-selección */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <PartyPopper size={16} /> Paquete o servicio * (puedes elegir varios)
          </Label>
          {groups.map((group) => (
            <div key={group}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {group}
              </p>
              <div className="flex flex-wrap gap-2">
                {packages.filter((p) => p.group === group).map((pkg) => {
                  const active = selectedPackages.includes(pkg.value);
                  return (
                    <button
                      key={pkg.value}
                      type="button"
                      onClick={() => togglePackage(pkg.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {active && <Check size={13} />}
                      {pkg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {selectedPackages.length === 0 && (
            <p className="text-xs text-muted-foreground">Selecciona al menos un servicio</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="flex items-center gap-2">
            <MessageSquare size={16} /> Notas adicionales (opcional)
          </Label>
          <Textarea
            id="notes"
            placeholder="Ej: Es para una fiesta de 20 niños, necesito 3 mesitas..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="w-full"
          disabled={loading || !date}
        >
          {loading ? "Enviando..." : "Enviar Reservacion"}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground text-center mt-6">
        * Tu reservación quedará como "pendiente" hasta que la confirmemos por WhatsApp o llamada.
      </p>
    </div>
  );
};

export default Reservaciones;
