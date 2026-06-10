import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FileText, CheckCheck, Trash2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  quotes: Record<string, unknown>[];
  markQuoteRead: (id: string) => void;
  deleteQuote: (id: string) => void;
  setReservacionManualOpen: (v: boolean) => void;
};

const CotizacionesView = ({ quotes, markQuoteRead, deleteQuote, setReservacionManualOpen }: Props) => {
  if (quotes.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <FileText size={40} className="mx-auto mb-3 opacity-20" />
        <p className="text-sm font-medium">No hay cotizaciones aún</p>
        <p className="text-xs mt-1">Las cotizaciones del cotizador online aparecen aquí</p>
      </div>
    );
  }

  const unread = quotes.filter((q) => !q.read);
  const read   = quotes.filter((q) =>  q.read);

  const Avatar = ({ index }: { index: number }) => {
    const colors = [
      "bg-[hsl(270_42%_88%)] text-[hsl(270_35%_35%)]",
      "bg-[hsl(170_38%_84%)] text-[hsl(170_38%_28%)]",
      "bg-[hsl(20_62%_88%)] text-[hsl(20_45%_32%)]",
      "bg-[hsl(50_68%_84%)] text-[hsl(50_45%_32%)]",
    ];
    return (
      <div className={`w-9 h-9 rounded-xl font-heading font-bold text-sm flex items-center justify-center shrink-0 ${colors[index % colors.length]}`}>
        #{index + 1}
      </div>
    );
  };

  const CotizacionCard = ({ q, index }: { q: Record<string, unknown>; index: number }) => {
    const qItems = q.items as { name: string; qty: number; subtotal: number }[] ?? [];
    return (
      <div className={`rounded-2xl border p-4 transition-colors ${
        q.read ? "border-border bg-white" : "border-primary/25 bg-primary/4"
      }`} style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-start gap-3">
          <Avatar index={index} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {!q.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
              <span className="text-[11px] font-semibold text-muted-foreground">
                {format(new Date(q.created_at as string), "dd MMM yyyy · HH:mm", { locale: es })}
              </span>
              {!q.read && (
                <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">Nueva</span>
              )}
            </div>

            {/* Items */}
            <div className="space-y-1 mb-3">
              {qItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-foreground/80">{item.qty}× {item.name}</span>
                  <span className="font-medium">${item.subtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-2">
              <div>
                <span className="text-xs text-muted-foreground">Total estimado </span>
                <span className="font-heading font-bold text-primary text-base">${(q.total as number)?.toLocaleString()} MXN</span>
              </div>
              <Button
                size="sm"
                variant="hero"
                className="text-xs h-7"
                onClick={() => setReservacionManualOpen(true)}
              >
                <PlusCircle size={12} /> Convertir a reservación
              </Button>
            </div>
          </div>

          <div className="flex gap-1 shrink-0 flex-col">
            {!q.read && (
              <Button
                variant="ghost" size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                title="Marcar como leída"
                onClick={() => markQuoteRead(q.id as string)}
              >
                <CheckCheck size={14} />
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 size={14} />
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
  };

  return (
    <div className="space-y-5">
      {unread.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Nuevas ({unread.length})
          </p>
          <div className="space-y-2.5">
            {unread.map((q, i) => <CotizacionCard key={q.id as string} q={q} index={i} />)}
          </div>
        </div>
      )}
      {read.length > 0 && (
        <div>
          {unread.length > 0 && (
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
              Anteriores ({read.length})
            </p>
          )}
          <div className="space-y-2.5">
            {read.map((q, i) => <CotizacionCard key={q.id as string} q={q} index={unread.length + i} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default CotizacionesView;
