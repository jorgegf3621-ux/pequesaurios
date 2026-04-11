import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Lock, LogOut, CalendarOff, Trash2, RefreshCw, FileText, MessageCircle, Mail, CheckCheck, Copy, Fuel, PlusCircle, ScrollText } from "lucide-react";
import NotaPago from "@/components/NotaPago";
import Contrato from "@/components/Contrato";
import ReservacionManual, { type NotaData } from "@/components/ReservacionManual";
import { isSameDay } from "date-fns";

const ADMIN_PASSWORD = "Chapis3621$";

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

const statusColors: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmada: "bg-green-100 text-green-800 border-green-300",
  cancelada: "bg-red-100 text-red-800 border-red-300",
};

const packageLabels: Record<string, string> = {
  inflable: "Inflable Castillo",
  mobiliario: "Mobiliario Infantil",
  pintacaritas: "Pintacaritas",
  yesitos: "Kit de Yesitos",
  "paquete-completo": "Paquete Completo",
  bloqueado: "🔒 Fecha Bloqueada",
};

// ─── Calculadora de Flete ────────────────────────────────────────────────────
const FleteCalculator = () => {
  const [km, setKm] = useState("");
  const [gasolinaPrecio, setGasolinaPrecio] = useState(24.5);  // precio actual Magna Monterrey
  const [rendimiento, setRendimiento] = useState(14);           // Yaris 2016 ciudad
  const [margen, setMargen] = useState(20);
  const [copiado, setCopiado] = useState(false);

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

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary/10 rounded-full p-2">
          <Fuel size={22} className="text-primary" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-lg">Calculadora de Flete</h2>
          <p className="text-xs text-muted-foreground">Yaris 2016 · ida y vuelta · {margen}% ganancia</p>
        </div>
      </div>

      {/* Distancia */}
      <div className="bg-white rounded-2xl border border-border p-5 space-y-4 shadow-sm">
        <div>
          <Label>Distancia al destino (km, solo ida)</Label>
          <Input
            type="number"
            min={0}
            value={km}
            onChange={(e) => setKm(e.target.value)}
            placeholder="Ej: 18"
            className="mt-1 text-lg"
            autoFocus
          />
          {kmNum > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Recorrido total: {kmTotal} km (ida y vuelta)
            </p>
          )}
        </div>
      </div>

      {/* Parámetros editables */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Parámetros del vehículo</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-xs">Precio gasolina ($/L)</Label>
            <Input
              type="number"
              min={1}
              step={0.5}
              value={gasolinaPrecio}
              onChange={(e) => setGasolinaPrecio(parseFloat(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Rendimiento (km/L)</Label>
            <Input
              type="number"
              min={1}
              step={0.5}
              value={rendimiento}
              onChange={(e) => setRendimiento(parseFloat(e.target.value) || 1)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Ganancia (%)</Label>
            <Input
              type="number"
              min={0}
              value={margen}
              onChange={(e) => setMargen(parseFloat(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Resultado */}
      {kmNum > 0 && (
        <div className="bg-primary/5 border-2 border-primary/30 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-4">Desglose</p>
          <div className="space-y-2 text-sm mb-5">
            <div className="flex justify-between text-muted-foreground">
              <span>{kmTotal} km ÷ {rendimiento} km/L</span>
              <span>{litros.toFixed(2)} litros</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{litros.toFixed(2)} L × ${gasolinaPrecio}/L</span>
              <span>${costoGasolina.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>+ {margen}% ganancia</span>
              <span>+ ${(costoGasolina * margen / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-primary/20">
              <span>Flete sugerido</span>
              <span className="text-primary text-xl">${flete.toLocaleString()}</span>
            </div>
          </div>
          <Button variant="hero" className="w-full" onClick={copiar}>
            <Copy size={15} />
            {copiado ? "¡Copiado!" : "Copiar monto"}
          </Button>
        </div>
      )}
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
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm border border-border">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-primary/10 rounded-full p-4 mb-3">
            <Lock size={28} className="text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold">Admin Pequesaurios</h1>
          <p className="text-sm text-muted-foreground mt-1">Acceso restringido</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="••••••••"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-xs mt-1">Contraseña incorrecta</p>
            )}
          </div>
          <Button type="submit" variant="hero" className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
};

// ─── Main Admin ───────────────────────────────────────────────────────────────
const Admin = () => {
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem("admin_auth") === "true");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [contacts, setContacts] = useState<Record<string, unknown>[]>([]);
  const [quotes, setQuotes] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
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
    const { error, data } = await supabase
      .from("reservations")
      .update({ status: newStatus })
      .eq("id", id)
      .select();

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else if (!data || data.length === 0) {
      toast.error("No se actualizó. Revisa los permisos RLS en Supabase.");
    } else {
      toast.success("Estado actualizado");
      fetchReservations();
    }
  };

  const notifyClient = (r: Reservation, tipo: "confirmada" | "cancelada") => {
    const packageLabels: Record<string, string> = {
      inflable: "Inflable Castillo Blanco",
      mobiliario: "Mobiliario Infantil",
      pintacaritas: "Pintacaritas",
      yesitos: "Kit de Yesitos",
      "paquete-completo": "Paquete Completo",
    };
    const [year, month, day] = r.event_date.split("-");
    const fecha = `${day}/${month}/${year}`;
    const nombre = r.customer_name.split(" ")[0];
    const paquete = packageLabels[r.package] ?? r.package;

    const mensaje = tipo === "confirmada"
      ? `¡Hola ${nombre}! Queremos confirmarte que tu reservación con *Pequesaurios* está *confirmada*.\n\n*Fecha:* ${fecha}\n*Paquete:* ${paquete}\n\nSi tienes alguna duda o cambio, escríbenos aquí mismo. ¡Nos vemos pronto!`
      : `Hola ${nombre}, te informamos que tu reservación del *${fecha}* con *Pequesaurios* ha sido *cancelada*.\n\nSi deseas reagendar o tienes alguna pregunta, con gusto te ayudamos. 😊`;

    const phone = r.customer_phone.replace(/\D/g, "");
    const phoneWithCode = phone.startsWith("52") ? phone : `52${phone}`;
    window.open(`https://wa.me/${phoneWithCode}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  const deleteReservation = async (id: string) => {
    const { error } = await supabase
      .from("reservations")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error al eliminar");
    } else {
      toast.success("Eliminado correctamente");
      fetchReservations();
    }
  };

  const handleReservacionCreada = (notaData: NotaData) => {
    fetchReservations();
    setNotaReservation(notaData.reservation);
    setNotaPrefill({
      address: notaData.address,
      hora: notaData.hora,
      paqueteNombre: notaData.paqueteNombre,
      servicios: notaData.servicios,
      flete: notaData.flete,
      metodoPago: notaData.metodoPago,
      skipToPreview: Object.values(notaData.servicios).some((v) => v > 0),
    });
  };

  const addBlockedDate = async () => {
    if (!blockedDate) {
      toast.error("Selecciona una fecha");
      return;
    }

    const alreadyBlocked = reservations.some(
      (r) =>
        isSameDay(parseISO(r.event_date + "T12:00:00"), blockedDate) &&
        r.package === "bloqueado"
    );

    if (alreadyBlocked) {
      toast.error("Esa fecha ya está bloqueada");
      return;
    }

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

  // Separate actual reservations from admin-blocked dates
  const realReservations = reservations.filter((r) => r.package !== "bloqueado");
  const blockedDates = reservations.filter((r) => r.package === "bloqueado");
  const bookedDatesForCalendar = reservations
    .filter((r) => r.status === "pendiente" || r.status === "confirmada")
    .map((r) => new Date(r.event_date + "T12:00:00"));

  if (!authenticated) {
    return <LoginScreen onLogin={() => { localStorage.setItem("admin_auth", "true"); setAuthenticated(true); }} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold">Panel de Admin</h1>
          <p className="text-muted-foreground text-sm">Pequesaurios — Gestión interna</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchReservations} disabled={loading}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { localStorage.removeItem("admin_auth"); setAuthenticated(false); }}
          >
            <LogOut size={15} /> Salir
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: realReservations.length, color: "text-foreground" },
          { label: "Pendientes", value: realReservations.filter((r) => r.status === "pendiente").length, color: "text-yellow-600" },
          { label: "Confirmadas", value: realReservations.filter((r) => r.status === "confirmada").length, color: "text-green-600" },
          { label: "Canceladas", value: realReservations.filter((r) => r.status === "cancelada").length, color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-border p-4 text-center shadow-sm">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="reservaciones">
        <TabsList className="mb-6">
          <TabsTrigger value="reservaciones">Reservaciones</TabsTrigger>
          <TabsTrigger value="bloquear">Bloquear Fechas</TabsTrigger>
          <TabsTrigger value="mensajes" className="relative">
            Mensajes
            {contacts.filter((c) => !c.read).length > 0 && (
              <span className="ml-2 bg-primary text-white text-xs rounded-full px-1.5 py-0.5">
                {contacts.filter((c) => !c.read).length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="cotizaciones" className="relative">
            Cotizaciones
            {quotes.filter((q) => !q.read).length > 0 && (
              <span className="ml-2 bg-primary text-white text-xs rounded-full px-1.5 py-0.5">
                {quotes.filter((q) => !q.read).length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="flete">Flete</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Reservaciones ── */}
        <TabsContent value="reservaciones">
          <div className="flex justify-end mb-4">
            <Button variant="hero" size="sm" onClick={() => setReservacionManualOpen(true)}>
              <PlusCircle size={15} /> Nueva reservación manual
            </Button>
          </div>
          {realReservations.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              {loading ? "Cargando..." : "No hay reservaciones aún"}
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Fecha evento</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Paquete</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {realReservations.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {format(parseISO(r.event_date + "T12:00:00"), "dd MMM yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>{r.customer_name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <a href={`tel:${r.customer_phone}`} className="text-primary hover:underline block">
                            {r.customer_phone}
                          </a>
                          {r.customer_email && (
                            <a href={`mailto:${r.customer_email}`} className="text-muted-foreground hover:underline text-xs block">
                              {r.customer_email}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {packageLabels[r.package] ?? r.package}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                        {r.notes ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Select value={r.status} onValueChange={(val) => updateStatus(r.id, val)}>
                          <SelectTrigger className={`w-32 text-xs border ${statusColors[r.status] ?? ""}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="confirmada">Confirmada</SelectItem>
                            <SelectItem value="cancelada">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-500 hover:text-green-700"
                          title="Avisar confirmación por WhatsApp"
                          onClick={() => notifyClient(r, "confirmada")}
                        >
                          <MessageCircle size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary hover:text-primary/80"
                          title="Crear nota de pago"
                          onClick={() => { setNotaPrefill(undefined); setNotaReservation(r); }}
                        >
                          <FileText size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-purple-500 hover:text-purple-700"
                          title="Generar contrato de renta"
                          onClick={() => { setContratoPrefill(undefined); setContratoReservation(r); }}
                        >
                          <ScrollText size={16} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600">
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar reservación?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se eliminará permanentemente la reservación de <strong>{r.customer_name}</strong> para el {format(parseISO(r.event_date + "T12:00:00"), "dd 'de' MMMM", { locale: es })}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => deleteReservation(r.id)}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ── Tab 2: Bloquear Fechas ── */}
        <TabsContent value="bloquear">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Calendar */}
            <div>
              <h2 className="font-heading font-bold text-lg mb-4">Selecciona una fecha para bloquear</h2>
              <Calendar
                mode="single"
                selected={blockedDate}
                onSelect={setBlockedDate}
                locale={es}
                disabled={(day) => day < new Date(new Date().setHours(0, 0, 0, 0))}
                modifiers={{ booked: bookedDatesForCalendar }}
                modifiersClassNames={{
                  booked: "bg-primary/30 text-primary line-through",
                }}
                className="rounded-2xl border border-border shadow-sm p-4"
              />

              {blockedDate && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-primary">
                    Fecha seleccionada: {format(blockedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                  <div>
                    <Label htmlFor="reason">Motivo (opcional)</Label>
                    <Input
                      id="reason"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="Ej: Evento privado, mantenimiento..."
                    />
                  </div>
                  <Button onClick={addBlockedDate} className="w-full" variant="hero">
                    <CalendarOff size={16} /> Bloquear esta fecha
                  </Button>
                </div>
              )}
            </div>

            {/* Blocked dates list */}
            <div>
              <h2 className="font-heading font-bold text-lg mb-4">Fechas bloqueadas manualmente</h2>
              {blockedDates.length === 0 ? (
                <p className="text-muted-foreground text-sm">No hay fechas bloqueadas manualmente.</p>
              ) : (
                <div className="space-y-2">
                  {blockedDates.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {format(parseISO(b.event_date + "T12:00:00"), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                        {b.notes && (
                          <p className="text-xs text-muted-foreground">{b.notes}</p>
                        )}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600">
                            <Trash2 size={16} />
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
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => deleteReservation(b.id)}
                            >
                              Desbloquear
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 3: Mensajes ── */}
        <TabsContent value="mensajes">
          {contacts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No hay mensajes aún</div>
          ) : (
            <div className="space-y-3">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className={`rounded-xl border p-5 transition-colors ${
                    c.read ? "border-border bg-white" : "border-primary/30 bg-primary/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {!c.read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                        <span className="font-semibold text-sm">{c.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(c.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 break-words">{c.message}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>📧 {c.email}</span>
                        {c.phone && <span>📞 {c.phone}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-500 hover:text-blue-700"
                        title="Responder por email"
                        onClick={() => {
                          if (!c.read) markContactRead(c.id);
                          window.open(
                            `mailto:${c.email}?subject=Re: Tu mensaje a Pequesaurios&body=Hola ${c.name.split(" ")[0]},%0A%0AGracias por contactarnos. `,
                            "_blank"
                          );
                        }}
                      >
                        <Mail size={16} />
                      </Button>
                      {c.phone && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-500 hover:text-green-700"
                          title="Responder por WhatsApp"
                          onClick={() => {
                            if (!c.read) markContactRead(c.id);
                            const phone = c.phone.replace(/\D/g, "");
                            const phoneWithCode = phone.startsWith("52") ? phone : `52${phone}`;
                            const msg = encodeURIComponent(`¡Hola ${c.name.split(" ")[0]}! 👋 Gracias por contactar a *Pequesaurios*. `);
                            window.open(`https://wa.me/${phoneWithCode}?text=${msg}`, "_blank");
                          }}
                        >
                          <MessageCircle size={16} />
                        </Button>
                      )}
                      {!c.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground"
                          title="Marcar como leído"
                          onClick={() => markContactRead(c.id)}
                        >
                          <CheckCheck size={16} />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600">
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar mensaje?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Se eliminará el mensaje de <strong>{c.name}</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => deleteContact(c.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Tab 4: Cotizaciones ── */}
        <TabsContent value="cotizaciones">
          {quotes.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No hay cotizaciones aún</div>
          ) : (
            <div className="space-y-3">
              {quotes.map((q) => {
                const qItems = q.items as { name: string; qty: number; subtotal: number }[];
                return (
                  <div
                    key={q.id as string}
                    className={`rounded-xl border p-5 transition-colors ${
                      q.read ? "border-border bg-white" : "border-primary/30 bg-primary/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          {!q.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(q.created_at as string), "dd MMM yyyy, HH:mm", { locale: es })}
                          </span>
                        </div>
                        <ul className="space-y-1 mb-3">
                          {qItems.map((item, i) => (
                            <li key={i} className="flex justify-between text-sm">
                              <span className="text-foreground/80">{item.qty}x {item.name}</span>
                              <span className="font-medium">${item.subtotal.toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex justify-between font-bold text-primary border-t border-border pt-2">
                          <span>Total estimado</span>
                          <span>${(q.total as number).toLocaleString()} MXN</span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {!q.read && (
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" title="Marcar como leída" onClick={() => markQuoteRead(q.id as string)}>
                            <CheckCheck size={16} />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600">
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
                              <AlertDialogDescription>Se eliminará permanentemente esta cotización.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => deleteQuote(q.id as string)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Tab 5: Flete ── */}
        <TabsContent value="flete">
          <FleteCalculator />
        </TabsContent>
      </Tabs>

      {/* Nota de pago */}
      <NotaPago
        reservation={notaReservation}
        open={!!notaReservation}
        onClose={() => { setNotaReservation(null); setNotaPrefill(undefined); }}
        prefill={notaPrefill}
      />

      {/* Contrato de renta */}
      <Contrato
        reservation={contratoReservation}
        open={!!contratoReservation}
        onClose={() => { setContratoReservation(null); setContratoPrefill(undefined); }}
        prefill={contratoPrefill}
      />

      {/* Reservación manual */}
      <ReservacionManual
        open={reservacionManualOpen}
        onClose={() => setReservacionManualOpen(false)}
        bookedDates={bookedDatesForCalendar}
        onCreated={handleReservacionCreada}
      />
    </div>
  );
};

export default Admin;
