import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard, CalendarCheck, Calendar, History,
  MessageCircle, FileText, Package, Image, Star, Truck,
  LayoutTemplate, LogOut, RefreshCw, Bell, Menu,
  Home, ChevronRight,
} from "lucide-react";
import logo from "@/assets/logo.png";

export type AdminSection =
  | "inicio" | "reservaciones" | "calendario" | "historial"
  | "mensajes" | "cotizaciones" | "productos" | "galeria"
  | "resenas" | "mobiliario" | "flete";

type NavItem = { id: AdminSection; label: string; icon: React.ReactNode; badge?: number };
type NavGroup = { label: string; items: NavItem[] };

type Props = {
  activeSection: AdminSection;
  setActiveSection: (s: AdminSection) => void;
  onRefresh: () => void;
  onLogout: () => void;
  loading: boolean;
  unreadMessages: number;
  unreadQuotes: number;
  historialCount: number;
  children: React.ReactNode;
};

const TITLES: Record<AdminSection, { title: string; subtitle: string }> = {
  inicio:         { title: "Inicio",              subtitle: "Resumen del negocio" },
  reservaciones:  { title: "Reservaciones",        subtitle: "Eventos activos y pendientes" },
  calendario:     { title: "Calendario",           subtitle: "Fechas bloqueadas y eventos" },
  historial:      { title: "Historial",            subtitle: "Eventos completados" },
  mensajes:       { title: "Mensajes",             subtitle: "Consultas y contactos" },
  cotizaciones:   { title: "Cotizaciones",         subtitle: "Presupuestos del cotizador" },
  productos:      { title: "Productos",            subtitle: "Catálogo y disponibilidad" },
  galeria:        { title: "Galería & Servicios",  subtitle: "Fotos y tarjetas del inicio" },
  resenas:        { title: "Reseñas",              subtitle: "Generador de links de reseña" },
  mobiliario:     { title: "Mobiliario",           subtitle: "Página de mobiliario infantil" },
  flete:          { title: "Flete",               subtitle: "Configuración de tarifas y rutas" },
};

const AdminShell = ({
  activeSection, setActiveSection, onRefresh, onLogout,
  loading, unreadMessages, unreadQuotes, historialCount, children,
}: Props) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const navGroups: NavGroup[] = [
    {
      label: "Operación",
      items: [
        { id: "inicio",        label: "Inicio",         icon: <LayoutDashboard size={16} /> },
        { id: "reservaciones", label: "Reservaciones",  icon: <CalendarCheck size={16} /> },
        { id: "calendario",    label: "Calendario",     icon: <Calendar size={16} /> },
        { id: "historial",     label: "Historial",      icon: <History size={16} />, badge: historialCount > 0 ? historialCount : undefined },
      ],
    },
    {
      label: "Bandeja",
      items: [
        { id: "mensajes",     label: "Mensajes",     icon: <MessageCircle size={16} />, badge: unreadMessages > 0 ? unreadMessages : undefined },
        { id: "cotizaciones", label: "Cotizaciones", icon: <FileText size={16} />,      badge: unreadQuotes  > 0 ? unreadQuotes  : undefined },
      ],
    },
    {
      label: "Contenido",
      items: [
        { id: "productos",  label: "Productos",           icon: <Package size={16} /> },
        { id: "galeria",    label: "Galería & Servicios", icon: <Image size={16} /> },
        { id: "resenas",    label: "Reseñas",             icon: <Star size={16} /> },
        { id: "mobiliario", label: "Mobiliario",          icon: <LayoutTemplate size={16} /> },
      ],
    },
    {
      label: "Ajustes",
      items: [
        { id: "flete", label: "Flete", icon: <Truck size={16} /> },
      ],
    },
  ];

  const bottomNav: NavItem[] = [
    { id: "inicio",        label: "Inicio",        icon: <Home size={20} /> },
    { id: "reservaciones", label: "Reservas",       icon: <CalendarCheck size={20} /> },
    { id: "mensajes",      label: "Mensajes",       icon: <MessageCircle size={20} />, badge: unreadMessages > 0 ? unreadMessages : undefined },
    { id: "cotizaciones",  label: "Cotizaciones",   icon: <FileText size={20} />,      badge: unreadQuotes  > 0 ? unreadQuotes  : undefined },
  ];

  const moreItems: NavItem[] = [
    { id: "calendario",  label: "Calendario",  icon: <Calendar size={20} /> },
    { id: "historial",   label: "Historial",   icon: <History size={20} />, badge: historialCount > 0 ? historialCount : undefined },
    { id: "productos",   label: "Productos",   icon: <Package size={20} /> },
    { id: "galeria",     label: "Galería",     icon: <Image size={20} /> },
    { id: "resenas",     label: "Reseñas",     icon: <Star size={20} /> },
    { id: "mobiliario",  label: "Mobiliario",  icon: <LayoutTemplate size={20} /> },
    { id: "flete",       label: "Flete",       icon: <Truck size={20} /> },
  ];

  const sectionInfo = TITLES[activeSection];
  const totalUnread = unreadMessages + unreadQuotes;

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 py-4 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Pequesaurios" className="h-8 w-8 object-contain rounded-lg" />
          <div>
            <p className="font-heading font-bold text-sm">Pequesaurios</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Panel interno</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 mb-1">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveSection(item.id); onNavigate?.(); }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                      active
                        ? "bg-primary/12 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className={active ? "text-primary" : "text-muted-foreground"}>{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                        {item.badge}
                      </span>
                    )}
                    {active && <ChevronRight size={12} className="text-primary/50 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-border/60">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <LogOut size={15} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar — desktop only */}
      <aside
        className="hidden lg:flex w-56 flex-col border-r border-border/50 fixed inset-y-0 left-0 z-30"
        style={{ boxShadow: "1px 0 20px -4px hsl(270 40% 50% / 0.08)" }}
      >
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-56">
        {/* Topbar */}
        <header
          className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-border/50 px-4 lg:px-6 h-14 flex items-center justify-between gap-3"
          style={{ boxShadow: "0 1px 16px -4px hsl(270 40% 50% / 0.08)" }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden shrink-0 -ml-1 h-8 w-8">
                  <Menu size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-56 p-0 [&>button]:hidden">
                <SidebarContent onNavigate={() => setSheetOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="min-w-0">
              <h1 className="font-heading font-bold text-base leading-tight truncate">{sectionInfo.title}</h1>
              <p className="text-[11px] text-muted-foreground leading-tight hidden sm:block truncate">{sectionInfo.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading} className="h-8 w-8 text-muted-foreground">
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground relative">
              <Bell size={15} />
              {totalUnread > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onLogout} className="h-8 w-8 text-muted-foreground lg:hidden">
              <LogOut size={15} />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 lg:px-6 py-5 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/92 backdrop-blur-md border-t border-border/50 flex items-stretch h-[60px]"
        style={{ boxShadow: "0 -2px 16px -4px hsl(270 40% 50% / 0.10)" }}
      >
        {bottomNav.map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 px-1 transition-all ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <span className={active ? "text-primary" : ""}>{item.icon}</span>
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1.5 bg-primary text-white text-[9px] font-bold rounded-full min-w-[13px] h-[13px] flex items-center justify-center px-0.5 leading-none">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold leading-none ${active ? "text-primary" : ""}`}>{item.label}</span>
            </button>
          );
        })}

        {/* Más */}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button className="flex-1 flex flex-col items-center justify-center gap-0.5 px-1 text-muted-foreground">
              <Menu size={20} />
              <span className="text-[10px] font-semibold leading-none">Más</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-safe pb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Más secciones</p>
            <div className="grid grid-cols-4 gap-2">
              {moreItems.map((item) => {
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveSection(item.id); setMoreOpen(false); }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${
                      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <div className="relative">
                      {item.icon}
                      {item.badge !== undefined && (
                        <span className="absolute -top-1 -right-1.5 bg-primary text-white text-[9px] rounded-full min-w-[13px] h-[13px] flex items-center justify-center px-0.5">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-center leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default AdminShell;
