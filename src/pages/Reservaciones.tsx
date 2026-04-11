import { useState, useEffect } from "react";
import { format, isSameDay, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, PartyPopper, Phone, User, Mail, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const packages = [
  { value: "inflable", label: "Inflable Castillo Blanco" },
  { value: "mobiliario", label: "Mobiliario Infantil" },
  { value: "pintacaritas", label: "Pintacaritas" },
  { value: "yesitos", label: "Kit de Yesitos" },
  { value: "paquete-completo", label: "Paquete Completo (Todo incluido)" },
];

const Reservaciones = () => {
  const [date, setDate] = useState<Date>();
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookedDates();
  }, []);

  const fetchBookedDates = async () => {
    const { data } = await supabase
      .from("reservations")
      .select("event_date")
      .in("status", ["pendiente", "confirmada"]);

    if (data) {
      setBookedDates(data.map((r) => new Date(r.event_date + "T12:00:00")));
    }
  };

  const isDateBooked = (day: Date) => {
    return bookedDates.some((d) => isSameDay(d, day));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !name || !phone || !selectedPackage) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("reservations").insert({
      customer_name: name,
      customer_phone: phone,
      customer_email: email || null,
      event_date: format(date, "yyyy-MM-dd"),
      package: selectedPackage,
      notes: notes || null,
    });

    setLoading(false);

    if (error) {
      toast.error("Hubo un error al enviar tu reservación. Intenta de nuevo.");
      return;
    }

    toast.success("¡Reservación enviada! Te contactaremos pronto para confirmar. 🎉");

    // Reset form
    setDate(undefined);
    setName("");
    setPhone("");
    setEmail("");
    setSelectedPackage("");
    setNotes("");
    fetchBookedDates();
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="font-heading text-4xl font-bold text-center mb-2">Reserva tu Fecha 🗓️</h1>
      <p className="text-muted-foreground text-center mb-12">
        Selecciona la fecha de tu evento y completa el formulario. Las fechas en rosa ya están reservadas.
      </p>

      {/* Calendar */}
      <div className="flex justify-center mb-10">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={es}
          disabled={(day) =>
            isBefore(day, startOfDay(new Date())) || isDateBooked(day)
          }
          modifiers={{ booked: bookedDates }}
          modifiersClassNames={{
            booked: "bg-primary/30 text-primary line-through",
          }}
          className="rounded-2xl border border-border shadow-sm p-4 pointer-events-auto"
        />
      </div>

      {date && (
        <div className="bg-primary/10 rounded-xl p-4 mb-8 text-center">
          <p className="font-heading font-bold text-primary">
            📅 Fecha seleccionada: {format(date, "EEEE d 'de' MMMM, yyyy", { locale: es })}
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

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <PartyPopper size={16} /> Paquete o servicio *
          </Label>
          <Select value={selectedPackage} onValueChange={setSelectedPackage}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un paquete" />
            </SelectTrigger>
            <SelectContent>
              {packages.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          {loading ? "Enviando..." : "Enviar Reservación 🎉"}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground text-center mt-6">
        * Tu reservación quedará como "pendiente" hasta que la confirmemos por WhatsApp o llamada.
      </p>
    </div>
  );
};

export default Reservaciones;
