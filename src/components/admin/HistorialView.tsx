import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { History, RefreshCw, FileText, Trash2, Trophy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  updateStatus: (id: string, status: string) => void;
  deleteReservation: (id: string) => void;
  setNotaReservation: (r: Reservation) => void;
  setNotaPrefill: (p: any) => void;
};

const packageLabels: Record<string, string> = {
  inflable: "Inflable Castillo",
  mobiliario: "Mobiliario Infantil",
  pintacaritas: "Pintacaritas",
  yesitos: "Kit de Yesitos",
  "paquete-completo": "Paquete Completo",
};

const HistorialView = ({
  reservations, updateStatus, deleteReservation,
  setNotaReservation, setNotaPrefill,
}: Props) => {
  const totalIngresos = reservations.reduce((sum, r) => {
    return sum + ((r.cotizador_data as any)?.total ?? 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[hsl(170_38%_92%)] rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="bg-[hsl(170_38%_80%)] rounded-xl p-2.5">
            <Trophy size={18} className="text-[hsl(170_38%_28%)]" />
          </div>
          <div>
            <p className="font-heading font-bold text-2xl text-[hsl(170_38%_25%)]">{reservations.length}</p>
            <p className="text-xs text-muted-foreground">Eventos completados</p>
          </div>
        </div>
        <div className="bg-[hsl(270_42%_94%)] rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="bg-[hsl(270_42%_84%)] rounded-xl p-2.5">
            <TrendingUp size={18} className="text-[hsl(270_35%_35%)]" />
          </div>
          <div>
            <p className="font-heading font-bold text-2xl text-[hsl(270_35%_30%)]">
              {totalIngresos > 0 ? `$${totalIngresos.toLocaleString()}` : `${reservations.length} ev.`}
            </p>
            <p className="text-xs text-muted-foreground">
              {totalIngresos > 0 ? "Ingreso histórico" : "en total"}
            </p>
          </div>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
          <History size={36} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm">Aún no hay eventos completados</p>
          <p className="text-xs mt-1">Marca una reservación confirmada con el ✓ azul para moverla aquí</p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block rounded-2xl border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50/60 hover:bg-blue-50/60">
                  <TableHead className="text-xs uppercase font-semibold text-muted-foreground tracking-wide">Fecha</TableHead>
                  <TableHead className="text-xs uppercase font-semibold text-muted-foreground tracking-wide">Cliente</TableHead>
                  <TableHead className="text-xs uppercase font-semibold text-muted-foreground tracking-wide hidden lg:table-cell">Servicio</TableHead>
                  <TableHead className="text-xs uppercase font-semibold text-muted-foreground tracking-wide hidden lg:table-cell">Notas</TableHead>
                  <TableHead className="text-xs uppercase font-semibold text-muted-foreground tracking-wide text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((r) => {
                  const cd = r.cotizador_data as any;
                  return (
                    <TableRow key={r.id} className="hover:bg-blue-50/20 transition-colors">
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
                        <a href={`tel:${r.customer_phone}`} className="text-primary hover:underline text-xs">
                          {r.customer_phone}
                        </a>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        <p>{packageLabels[r.package] ?? r.package}</p>
                        {cd?.total && (
                          <p className="text-xs text-muted-foreground">${cd.total.toLocaleString()} MXN</p>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[140px] truncate">
                        {r.notes ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50"
                            title="Regresar a confirmada"
                            onClick={() => updateStatus(r.id, "confirmada")}
                          >
                            <RefreshCw size={13} />
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
                            <FileText size={14} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50">
                                <Trash2 size={13} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar del historial?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se eliminará permanentemente el evento de <strong>{r.customer_name}</strong>.
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {reservations.map((r) => {
              const cd = r.cotizador_data as any;
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-border p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-heading font-bold text-sm">{r.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(r.event_date + "T12:00:00"), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </div>
                    <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-2 py-0.5 rounded-full">
                      Completada
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{packageLabels[r.package] ?? r.package}</p>
                  {cd?.total && (
                    <p className="text-xs font-semibold text-primary mb-2">${cd.total.toLocaleString()} MXN</p>
                  )}
                  <div className="flex gap-1 border-t border-border/60 pt-2.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-yellow-500" onClick={() => updateStatus(r.id, "confirmada")}>
                      <RefreshCw size={13} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => {
                      setNotaPrefill({ ...(cd ? { servicios: cd.servicios, precios: cd.precios, flete: cd.flete, address: cd.direccion, skipToPreview: true } : { skipToPreview: false }) });
                      setNotaReservation(r);
                    }}>
                      <FileText size={13} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default HistorialView;
