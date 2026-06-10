import { format, parseISO, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarOff, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
};

type Props = {
  reservations: Reservation[];
  blockedDate: Date | undefined;
  setBlockedDate: (d: Date | undefined) => void;
  blockReason: string;
  setBlockReason: (r: string) => void;
  addBlockedDate: () => void;
  deleteReservation: (id: string) => void;
  bookedDatesForCalendar: Date[];
  blockedDates: Reservation[];
};

const statusChip: Record<string, string> = {
  pendiente:  "bg-yellow-50 text-yellow-700",
  confirmada: "bg-green-50 text-green-700",
  cancelada:  "bg-red-50 text-red-700",
  completada: "bg-blue-50 text-blue-700",
};

const packageLabels: Record<string, string> = {
  inflable: "Inflable Castillo",
  mobiliario: "Mobiliario Infantil",
  pintacaritas: "Pintacaritas",
  yesitos: "Kit de Yesitos",
  "paquete-completo": "Paquete Completo",
  bloqueado: "Fecha Bloqueada",
};

const CalendarioView = ({
  reservations, blockedDate, setBlockedDate, blockReason, setBlockReason,
  addBlockedDate, deleteReservation, bookedDatesForCalendar, blockedDates,
}: Props) => {
  const selectedDayEvents = blockedDate
    ? reservations.filter((r) => isSameDay(parseISO(r.event_date + "T12:00:00"), blockedDate))
    : [];

  const confirmedDates = reservations
    .filter((r) => r.status === "confirmada" && r.package !== "bloqueado")
    .map((r) => new Date(r.event_date + "T12:00:00"));

  const pendingDates = reservations
    .filter((r) => r.status === "pendiente")
    .map((r) => new Date(r.event_date + "T12:00:00"));

  const blockedOnlyDates = reservations
    .filter((r) => r.package === "bloqueado")
    .map((r) => new Date(r.event_date + "T12:00:00"));

  return (
    <div className="grid lg:grid-cols-[auto_1fr] gap-6">
      {/* Left: Calendar */}
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-border p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-primary" />
            <h2 className="font-heading font-semibold text-sm">Selecciona una fecha</h2>
          </div>

          <CalendarPicker
            mode="single"
            selected={blockedDate}
            onSelect={setBlockedDate}
            locale={es}
            disabled={(day) => day < new Date(new Date().setHours(0, 0, 0, 0))}
            modifiers={{
              booked: bookedDatesForCalendar,
              confirmed: confirmedDates,
              pending: pendingDates,
              blocked: blockedOnlyDates,
            }}
            modifiersClassNames={{
              booked: "font-bold",
              confirmed: "bg-green-100 text-green-800 font-bold rounded-xl",
              pending: "bg-yellow-100 text-yellow-800 font-bold rounded-xl",
              blocked: "bg-red-100 text-red-700 line-through rounded-xl",
            }}
            className="p-0"
          />

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { color: "bg-green-100 text-green-700", label: "Confirmada" },
              { color: "bg-yellow-100 text-yellow-700", label: "Pendiente" },
              { color: "bg-red-100 text-red-700", label: "Bloqueada" },
            ].map((l) => (
              <span key={l.label} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${l.color}`}>
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Blocked dates list */}
        {blockedDates.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <h2 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
              <CalendarOff size={15} className="text-red-400" /> Fechas bloqueadas
            </h2>
            <div className="space-y-2">
              {blockedDates.map((b) => (
                <div key={b.id} className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-red-800">
                      {format(parseISO(b.event_date + "T12:00:00"), "EEEE d 'de' MMMM", { locale: es })}
                    </p>
                    {b.notes && <p className="text-xs text-red-600 truncate">{b.notes}</p>}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-100 shrink-0">
                        <Trash2 size={13} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Desbloquear fecha?</AlertDialogTitle>
                        <AlertDialogDescription>
                          La fecha {format(parseISO(b.event_date + "T12:00:00"), "dd 'de' MMMM", { locale: es })} quedará disponible nuevamente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => deleteReservation(b.id)}>
                          Desbloquear
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Day panel */}
      <div className="space-y-5">
        {blockedDate ? (
          <>
            {/* Events on selected day */}
            <div className="bg-white rounded-2xl border border-border p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="font-heading font-semibold text-sm mb-1">
                {format(blockedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
              </h2>

              {selectedDayEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">Día libre — sin eventos ni bloqueos</p>
              ) : (
                <div className="space-y-2 mt-3">
                  {selectedDayEvents.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        r.package === "bloqueado" ? "bg-red-400" :
                        r.status === "confirmada" ? "bg-green-400" :
                        r.status === "pendiente" ? "bg-yellow-400" : "bg-blue-400"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {r.package === "bloqueado" ? "Fecha bloqueada" : r.customer_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {packageLabels[r.package] ?? r.package}
                          {r.notes ? ` · ${r.notes}` : ""}
                        </p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusChip[r.status] ?? ""}`}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Block date form */}
            <div className="bg-white rounded-2xl border border-border p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
                <CalendarOff size={15} className="text-red-400" /> Bloquear esta fecha
              </h2>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Motivo (opcional)</Label>
                  <Input
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Ej: Evento privado, mantenimiento..."
                    className="mt-1 text-sm"
                  />
                </div>
                <Button onClick={addBlockedDate} className="w-full" variant="hero">
                  <CalendarOff size={15} /> Bloquear fecha
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-border p-8 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
            <Calendar size={36} className="mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Selecciona un día para ver los eventos o bloquearlo</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarioView;
