import { format, parseISO, isToday, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarCheck, Clock, AlertCircle, MessageCircle, FileText,
  TrendingUp, DollarSign, CheckCircle, HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminSection } from "./AdminShell";

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

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
  read: boolean;
};

type Props = {
  reservations: Reservation[];
  contacts: ContactMessage[];
  quotes: Record<string, unknown>[];
  notifyClient: (r: Reservation, tipo: "confirmada" | "cancelada") => void;
  setActiveSection: (s: AdminSection) => void;
};

const packageLabels: Record<string, string> = {
  inflable: "Inflable Castillo",
  mobiliario: "Mobiliario Infantil",
  pintacaritas: "Pintacaritas",
  yesitos: "Kit de Yesitos",
  "paquete-completo": "Paquete Completo",
  bloqueado: "Fecha Bloqueada",
};

const statusChip: Record<string, string> = {
  pendiente:  "bg-yellow-50 text-yellow-700 border border-yellow-200",
  confirmada: "bg-green-50 text-green-700 border border-green-200",
  cancelada:  "bg-red-50 text-red-700 border border-red-200",
  completada: "bg-blue-50 text-blue-700 border border-blue-200",
};

const DashboardInicio = ({ reservations, contacts, quotes, notifyClient, setActiveSection }: Props) => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const isThisMonth = (dateStr: string) =>
    isWithinInterval(parseISO(dateStr + "T12:00:00"), { start: monthStart, end: monthEnd });

  const realReservations = reservations.filter((r) => r.package !== "bloqueado");

  const thisMonthAll = realReservations.filter((r) => isThisMonth(r.event_date));
  const confirmed = realReservations.filter((r) => r.status === "confirmada" && r.package !== "bloqueado");
  const pending   = realReservations.filter((r) => r.status === "pendiente"  && r.package !== "bloqueado");
  const unreadMsg = contacts.filter((c) => !c.read);
  const unreadQ   = quotes.filter((q) => !q.read);

  const cobradoEsteMes = thisMonthAll.reduce((sum, r) => {
    const anticipo = (r.cotizador_data as any)?.anticipo ?? 0;
    return sum + anticipo;
  }, 0);

  const porCobrar = confirmed.reduce((sum, r) => {
    const cd = r.cotizador_data as any;
    if (!cd?.total) return sum;
    const saldo = cd.total - (cd.anticipo ?? cd.total * 0.5);
    return sum + Math.max(0, saldo);
  }, 0);

  const todayEvents = realReservations.filter(
    (r) => isToday(parseISO(r.event_date + "T12:00:00")) && r.status !== "cancelada"
  );

  const kpis = [
    {
      label: "Cobrado este mes",
      value: cobradoEsteMes > 0 ? `$${cobradoEsteMes.toLocaleString()}` : `${thisMonthAll.length} eventos`,
      sub: cobradoEsteMes > 0 ? `${thisMonthAll.length} evento${thisMonthAll.length !== 1 ? "s" : ""}` : "en el mes",
      icon: <DollarSign size={18} />,
      bg: "bg-[hsl(50_68%_94%)]",
      iconBg: "bg-[hsl(50_68%_84%)] text-[hsl(50_45%_32%)]",
      textColor: "text-[hsl(50_45%_30%)]",
    },
    {
      label: "Por cobrar (saldos)",
      value: porCobrar > 0 ? `$${porCobrar.toLocaleString()}` : `${confirmed.length} confirmadas`,
      sub: porCobrar > 0 ? "saldo pendiente" : "activas",
      icon: <TrendingUp size={18} />,
      bg: "bg-[hsl(170_38%_92%)]",
      iconBg: "bg-[hsl(170_38%_80%)] text-[hsl(170_38%_28%)]",
      textColor: "text-[hsl(170_38%_25%)]",
    },
    {
      label: "Eventos confirmados",
      value: confirmed.length,
      sub: "activos ahora",
      icon: <CheckCircle size={18} />,
      bg: "bg-[hsl(270_42%_94%)]",
      iconBg: "bg-[hsl(270_42%_84%)] text-[hsl(270_35%_35%)]",
      textColor: "text-[hsl(270_35%_30%)]",
    },
    {
      label: "Por confirmar",
      value: pending.length,
      sub: "esperando respuesta",
      icon: <HelpCircle size={18} />,
      bg: "bg-[hsl(20_62%_94%)]",
      iconBg: "bg-[hsl(20_62%_84%)] text-[hsl(20_45%_32%)]",
      textColor: "text-[hsl(20_45%_30%)]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className={`${k.bg} rounded-2xl p-4 flex flex-col gap-2`} style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center justify-between">
              <span className={`${k.iconBg} rounded-xl p-2 flex items-center justify-center`}>{k.icon}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 text-right leading-tight max-w-[80px]">{k.label}</span>
            </div>
            <div>
              <p className={`font-heading font-bold text-2xl leading-none ${k.textColor}`}>{k.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid: Agenda + Acciones */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Agenda de hoy */}
        <div className="bg-white rounded-2xl border border-border p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primary/10 rounded-xl p-2">
              <CalendarCheck size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-sm">Agenda de hoy</h2>
              <p className="text-[11px] text-muted-foreground">
                {format(now, "EEEE d 'de' MMMM", { locale: es })}
              </p>
            </div>
          </div>

          {todayEvents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Clock size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Sin eventos para hoy</p>
              <p className="text-xs mt-1">Disfruta el día tranquila</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayEvents.map((r) => (
                <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-heading font-bold text-xs">
                      {r.customer_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{r.customer_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{packageLabels[r.package] ?? r.package}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusChip[r.status] ?? ""}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acción requerida */}
        <div className="bg-white rounded-2xl border border-border p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-[hsl(20_62%_90%)] rounded-xl p-2">
              <AlertCircle size={16} className="text-[hsl(20_55%_40%)]" />
            </div>
            <h2 className="font-heading font-semibold text-sm">Acción requerida</h2>
          </div>

          <div className="space-y-2.5">
            {/* Pendientes por confirmar */}
            {pending.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                <div className="w-8 h-8 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
                  <HelpCircle size={15} className="text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-yellow-800">
                    {pending.length} reservacion{pending.length !== 1 ? "es" : ""} pendiente{pending.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-yellow-600">Esperando confirmación</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 shrink-0 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  onClick={() => setActiveSection("reservaciones")}
                >
                  Ver
                </Button>
              </div>
            )}

            {/* WhatsApp pendientes */}
            {pending.slice(0, 2).map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/60">
                <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <MessageCircle size={14} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(r.event_date + "T12:00:00"), "dd 'de' MMMM", { locale: es })}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="whatsapp"
                  className="text-xs h-7 shrink-0"
                  onClick={() => notifyClient(r, "confirmada")}
                >
                  Avisar
                </Button>
              </div>
            ))}

            {/* Mensajes sin leer */}
            {unreadMsg.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageCircle size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary">
                    {unreadMsg.length} mensaje{unreadMsg.length !== 1 ? "s" : ""} sin leer
                  </p>
                  <p className="text-xs text-muted-foreground">De clientes potenciales</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 shrink-0"
                  onClick={() => setActiveSection("mensajes")}
                >
                  Ver
                </Button>
              </div>
            )}

            {/* Cotizaciones sin leer */}
            {unreadQ.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(270_42%_96%)] border border-[hsl(270_42%_85%)]">
                <div className="w-8 h-8 rounded-xl bg-[hsl(270_42%_88%)] flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-[hsl(270_35%_40%)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[hsl(270_35%_30%)]">
                    {unreadQ.length} cotizacion{unreadQ.length !== 1 ? "es" : ""} nueva{unreadQ.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">Del cotizador online</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 shrink-0"
                  onClick={() => setActiveSection("cotizaciones")}
                >
                  Ver
                </Button>
              </div>
            )}

            {pending.length === 0 && unreadMsg.length === 0 && unreadQ.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle size={28} className="mx-auto mb-2 text-green-400" />
                <p className="text-sm font-medium text-green-700">Todo al día</p>
                <p className="text-xs mt-0.5">No hay acciones pendientes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Próximos eventos */}
      {confirmed.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-green-50 rounded-xl p-2">
                <CalendarCheck size={16} className="text-green-600" />
              </div>
              <h2 className="font-heading font-semibold text-sm">Próximos confirmados</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7" onClick={() => setActiveSection("reservaciones")}>
              Ver todos
            </Button>
          </div>
          <div className="space-y-2">
            {confirmed.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
                <div className="text-center min-w-[36px]">
                  <p className="font-heading font-bold text-base text-primary leading-none">
                    {format(parseISO(r.event_date + "T12:00:00"), "d")}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    {format(parseISO(r.event_date + "T12:00:00"), "MMM", { locale: es })}
                  </p>
                </div>
                <div className="w-px h-8 bg-border/60" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{r.customer_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{packageLabels[r.package] ?? r.package}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 text-green-600 hover:bg-green-50 shrink-0"
                  onClick={() => notifyClient(r, "confirmada")}
                >
                  <MessageCircle size={13} />
                  WA
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardInicio;
