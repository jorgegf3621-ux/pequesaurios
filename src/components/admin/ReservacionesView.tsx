import { useState } from "react";
import { format, parseISO, isThisWeek } from "date-fns";
import { es } from "date-fns/locale";
import {
  Search, PlusCircle, CheckCircle2, MessageCircle,
  FileText, ScrollText, Trash2, Phone, Mail, CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

type CotizadorData = {
  servicios: Record<string, number>;
  precios: Record<string, number>;
  flete: number;
  direccion: string;
  municipio: string;
  total?: number;
  anticipo?: number;
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

type Props = {
  reservations: Reservation[];
  loading: boolean;
  updateStatus: (id: string, status: string) => void;
  notifyClient: (r: Reservation, tipo: "confirmada" | "cancelada") => void;
  deleteReservation: (id: string) => void;
  setNotaReservation: (r: Reservation) => void;
  setNotaPrefill: (p: any) => void;
  setContratoReservation: (r: Reservation) => void;
  setContratoPrefill: (p: any) => void;
  setReservacionManualOpen: (v: boolean) => void;
};

const packageLabels: Record<string, string> = {
  inflable: "Inflable Castillo",
  mobiliario: "Mobiliario Infantil",
  pintacaritas: "Pintacaritas",
  yesitos: "Kit de Yesitos",
  "paquete-completo": "Paquete Completo",
};

const statusChipClass: Record<string, string> = {
  pendiente:  "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmada: "bg-green-50 text-green-700 border-green-200",
  cancelada:  "bg-red-50 text-red-700 border-red-200",
  completada: "bg-blue-50 text-blue-700 border-blue-200",
};

const statusColors: Record<string, string> = {
  pendiente:  "bg-yellow-50 text-yellow-800 border-yellow-300",
  confirmada: "bg-green-50 text-green-800 border-green-300",
  cancelada:  "bg-red-50 text-red-800 border-red-300",
  completada: "bg-blue-50 text-blue-800 border-blue-300",
};

type Filter = "todas" | "pendientes" | "confirmadas" | "semana";

const ReservacionesView = ({
  reservations, loading, updateStatus, notifyClient, deleteReservation,
  setNotaReservation, setNotaPrefill, setContratoReservation, setContratoPrefill,
  setReservacionManualOpen,
}: Props) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("todas");

  const filtered = reservations.filter((r) => {
    const matchSearch = !search ||
      r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      r.customer_phone.includes(search);
    const matchFilter =
      filter === "todas"      ? true :
      filter === "pendientes" ? r.status === "pendiente" :
      filter === "confirmadas"? r.status === "confirmada" :
      filter === "semana"     ? isThisWeek(parseISO(r.event_date + "T12:00:00"), { locale: es }) :
      true;
    return matchSearch && matchFilter;
  });

  const filterTabs: { id: Filter; label: string; count?: number }[] = [
    { id: "todas",       label: "Todas",       count: reservations.length },
    { id: "pendientes",  label: "Pendientes",  count: reservations.filter((r) => r.status === "pendiente").length },
    { id: "confirmadas", label: "Confirmadas", count: reservations.filter((r) => r.status === "confirmada").length },
    { id: "semana",      label: "Esta semana" },
  ];

  const ActionButtons = ({ r }: { r: Reservation }) => {
    const cd = r.cotizador_data;
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
          title="Marcar como completada"
          onClick={() => updateStatus(r.id, "completada")}
        >
          <CheckCircle2 size={15} />
        </Button>
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 text-green-500 hover:text-green-700 hover:bg-green-50"
          title="Avisar por WhatsApp"
          onClick={() => notifyClient(r, "confirmada")}
        >
          <MessageCircle size={15} />
        </Button>
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 text-primary hover:text-primary/80 hover:bg-primary/10"
          title="Crear nota de pago"
          onClick={() => {
            setNotaPrefill({
              ...(cd ? {
                servicios: cd.servicios,
                precios: cd.precios,
                flete: cd.flete,
                address: cd.direccion,
                skipToPreview: true,
              } : { skipToPreview: false }),
            });
            setNotaReservation(r);
          }}
        >
          <FileText size={15} />
        </Button>
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 text-purple-500 hover:text-purple-700 hover:bg-purple-50"
          title="Generar contrato"
          onClick={() => {
            const cdd = r.cotizador_data;
            setContratoPrefill({
              servicios: cdd ? Object.keys(cdd.servicios).filter((id) => cdd.servicios[id] > 0) : [],
              address: cdd?.direccion ?? "",
              skipToPreview: false,
            });
            setContratoReservation(r);
          }}
        >
          <ScrollText size={15} />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50">
              <Trash2 size={15} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar reservación?</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminará permanentemente la reservación de <strong>{r.customer_name}</strong> para el{" "}
                {format(parseISO(r.event_date + "T12:00:00"), "dd 'de' MMMM", { locale: es })}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => deleteReservation(r.id)}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                filter === tab.id
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-white text-muted-foreground border-border hover:bg-muted/40"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1.5 text-[10px] rounded-full px-1 ${
                  filter === tab.id ? "bg-primary/20" : "bg-muted"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <Button
          variant="hero"
          size="sm"
          className="ml-auto whitespace-nowrap shrink-0"
          onClick={() => setReservacionManualOpen(true)}
        >
          <PlusCircle size={14} /> Nueva reservación
        </Button>
      </div>

      {/* Empty state */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
          <CalendarCheck size={32} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm">{search ? "Sin resultados para esa búsqueda" : "No hay reservaciones activas"}</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Fecha</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Cliente</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground hidden lg:table-cell">Servicios</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Estado</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const cd = r.cotizador_data as any;
                  const pct = cd?.total ? Math.min(100, Math.round(((cd.anticipo ?? 0) / cd.total) * 100)) : null;
                  return (
                    <TableRow key={r.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="whitespace-nowrap">
                        <p className="font-heading font-semibold text-sm">
                          {format(parseISO(r.event_date + "T12:00:00"), "dd MMM", { locale: es })}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {format(parseISO(r.event_date + "T12:00:00"), "yyyy")}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-sm">{r.customer_name}</p>
                        <a href={`tel:${r.customer_phone}`} className="text-primary hover:underline text-xs flex items-center gap-1">
                          <Phone size={10} /> {r.customer_phone}
                        </a>
                        {r.customer_email && (
                          <a href={`mailto:${r.customer_email}`} className="text-muted-foreground hover:underline text-[11px] flex items-center gap-1">
                            <Mail size={10} /> {r.customer_email}
                          </a>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <p className="text-sm font-medium">{packageLabels[r.package] ?? r.package}</p>
                        {r.notes && (
                          <p className="text-xs text-muted-foreground truncate max-w-[160px]">{r.notes}</p>
                        )}
                        {pct !== null && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex-1 bg-border rounded-full h-1.5 max-w-[80px]">
                              <div
                                className="bg-primary rounded-full h-1.5 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground">{pct}% pagado</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select value={r.status} onValueChange={(val) => updateStatus(r.id, val)}>
                          <SelectTrigger className={`w-32 h-7 text-xs border rounded-xl ${statusColors[r.status] ?? ""}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="confirmada">Confirmada</SelectItem>
                            <SelectItem value="cancelada">Cancelada</SelectItem>
                            <SelectItem value="completada">Completada</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <ActionButtons r={r} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-border p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-heading font-bold text-base">{r.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(r.event_date + "T12:00:00"), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${statusChipClass[r.status] ?? ""}`}>
                    {r.status}
                  </span>
                </div>
                <div className="mb-3 space-y-1">
                  <p className="text-sm font-medium">{packageLabels[r.package] ?? r.package}</p>
                  {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}
                  <a href={`tel:${r.customer_phone}`} className="text-primary text-xs flex items-center gap-1 hover:underline">
                    <Phone size={11} /> {r.customer_phone}
                  </a>
                </div>
                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <Select value={r.status} onValueChange={(val) => updateStatus(r.id, val)}>
                    <SelectTrigger className={`w-28 h-7 text-xs border rounded-xl ${statusColors[r.status] ?? ""}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="confirmada">Confirmada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                    </SelectContent>
                  </Select>
                  <ActionButtons r={r} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ReservacionesView;
