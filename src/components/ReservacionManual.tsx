import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { isBefore, startOfDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus, CalendarIcon, Save } from "lucide-react";

const SERVICIOS = [
  { id: "inflable",     name: "Inflable Castillo Blanco 3×3 m",          price: 1300 },
  { id: "mesa-pastel",  name: "Mesita Infantil Pastel (6 sillas)",        price: 500  },
  { id: "mesa-blanca",  name: "Mesita Blanca (8 sillas madera)",          price: 750  },
  { id: "arte",         name: "Arte en Mesa",                             price: 150  },
  { id: "yesitos",      name: "Kit de Yesitos",                           price: 20   },
  { id: "pintacaritas", name: "Pintacaritas (1.5 hrs)",                   price: 800  },
  { id: "globos",       name: "Guirnalda de Globos",                      price: 200  },
];

export type NotaData = {
  reservation: { id: string; customer_name: string; customer_phone: string; customer_email: string | null; event_date: string; package: string };
  address: string;
  hora: string;
  horaFin: string;
  paqueteNombre: string;
  servicios: Record<string, number>;
  flete: number;
  metodoPago: string;
  total: number;
  anticipo: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  bookedDates: Date[];
  onCreated: (notaData: NotaData) => void;
};

const ReservacionManual = ({ open, onClose, bookedDates, onCreated }: Props) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [hora, setHora] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [address, setAddress] = useState("");
  const [paqueteNombre, setPaqueteNombre] = useState("");
  const [servicios, setServicios] = useState<Record<string, number>>({});
  const [flete, setFlete] = useState(0);
  const [metodoPago, setMetodoPago] = useState("transferencia");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const cambiarCantidad = (id: string, delta: number) => {
    setServicios((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      if (next === 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: next };
    });
  };

  const totalServicios = SERVICIOS.filter((s) => (servicios[s.id] ?? 0) > 0)
    .reduce((sum, s) => sum + s.price * (servicios[s.id] ?? 0), 0);
  const total = totalServicios + flete;
  const anticipo = Math.round(total * 0.5);

  const hayServicios = Object.values(servicios).some((v) => v > 0);

  const handleGuardar = async () => {
    if (!name || !phone || !date) {
      toast.error("Nombre, teléfono y fecha son obligatorios");
      return;
    }

    setLoading(true);

    const packageId = Object.keys(servicios)[0] ?? "manual";

    const { data: inserted, error } = await supabase
      .from("reservations")
      .insert({
        customer_name: name,
        customer_phone: phone,
        customer_email: email || null,
        event_date: format(date, "yyyy-MM-dd"),
        package: packageId,
        notes: notes || null,
        status: "confirmada",
      })
      .select("id")
      .single();

    setLoading(false);

    if (error || !inserted) {
      toast.error("Error al guardar la reservación");
      return;
    }

    toast.success("Reservación guardada como confirmada");

    const notaData: NotaData = {
      reservation: {
        id: inserted.id,
        customer_name: name,
        customer_phone: phone,
        customer_email: email || null,
        event_date: format(date, "yyyy-MM-dd"),
        package: packageId,
      },
      address,
      hora,
      horaFin,
      paqueteNombre,
      servicios,
      flete,
      metodoPago,
      total,
      anticipo,
    };

    handleClose();
    onCreated(notaData);
  };

  const handleClose = () => {
    onClose();
    setName(""); setPhone(""); setEmail(""); setDate(undefined);
    setHora(""); setHoraFin(""); setAddress(""); setPaqueteNombre("");
    setServicios({}); setFlete(0); setMetodoPago("transferencia"); setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Reservación Manual</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Datos del cliente */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Datos del cliente</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nombre completo *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del cliente" />
              </div>
              <div>
                <Label>Teléfono / WhatsApp *</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="81 1234 5678" />
              </div>
              <div>
                <Label>Correo (opcional)</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
              </div>
            </div>
          </div>

          {/* Fecha */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Fecha del evento *</p>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={es}
                disabled={(day) => isBefore(day, startOfDay(new Date()))}
                modifiers={{ booked: bookedDates }}
                modifiersClassNames={{ booked: "bg-primary/30 text-primary line-through" }}
                className="rounded-2xl border border-border shadow-sm p-3"
              />
            </div>
            {date && (
              <p className="text-sm text-primary text-center mt-2 font-medium">
                {format(date, "EEEE d 'de' MMMM, yyyy", { locale: es })}
              </p>
            )}
          </div>

          {/* Horario y lugar */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Detalles del evento</p>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div><Label>Hora de inicio</Label><Input value={hora} onChange={(e) => setHora(e.target.value)} placeholder="Ej: 2:00 pm" /></div>
              <div><Label>Hora de fin</Label><Input value={horaFin} onChange={(e) => setHoraFin(e.target.value)} placeholder="Ej: 7:00 pm" /></div>
            </div>
            <div><Label>Dirección del evento</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, colonia, municipio" /></div>
          </div>

          {/* Paquete y servicios */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Servicios</p>
            <div className="mb-3">
              <Label>Nombre del paquete</Label>
              <Input value={paqueteNombre} onChange={(e) => setPaqueteNombre(e.target.value)} placeholder="Ej: Paquete Dino Creativo" />
            </div>
            <div className="space-y-2">
              {SERVICIOS.map((s) => {
                const qty = servicios[s.id] ?? 0;
                return (
                  <div key={s.id} className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${qty > 0 ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">${s.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => cambiarCantidad(s.id, -1)} disabled={qty === 0}><Minus size={13} /></Button>
                      <span className="w-5 text-center text-sm font-semibold">{qty}</span>
                      <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => cambiarCantidad(s.id, 1)}><Plus size={13} /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pago */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Flete ($)</Label>
              <Input type="number" min={0} value={flete || ""} onChange={(e) => setFlete(Number(e.target.value) || 0)} placeholder="0" />
            </div>
            <div>
              <Label>Método de pago</Label>
              <div className="flex gap-2 mt-1">
                {["efectivo", "tarjeta", "transferencia"].map((m) => (
                  <button key={m} type="button" onClick={() => setMetodoPago(m)}
                    className={`flex-1 rounded-xl border py-2 text-xs capitalize transition-colors ${metodoPago === m ? "border-primary bg-primary/10 font-semibold text-primary" : "border-border text-muted-foreground"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <Label>Notas adicionales</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas internas sobre el evento..." rows={2} />
          </div>

          {/* Resumen */}
          {hayServicios && (
            <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold">${total.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Anticipo (50%)</span><span className="font-semibold text-green-600">${anticipo.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="font-bold">Saldo restante</span><span className="font-bold text-primary">${anticipo.toLocaleString()}</span></div>
            </div>
          )}

          <Button className="w-full" variant="hero" onClick={handleGuardar} disabled={loading || !name || !phone || !date}>
            <Save size={16} /> {loading ? "Guardando..." : "Guardar y generar nota de pago"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReservacionManual;
