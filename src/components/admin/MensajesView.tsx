import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Mail, MessageCircle, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  contacts: ContactMessage[];
  markContactRead: (id: string) => void;
  deleteContact: (id: string) => void;
};

const Avatar = ({ name }: { name: string }) => {
  const initials = name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");
  return (
    <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary font-heading font-bold text-sm flex items-center justify-center shrink-0">
      {initials}
    </div>
  );
};

const MensajesView = ({ contacts, markContactRead, deleteContact }: Props) => {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Mail size={40} className="mx-auto mb-3 opacity-20" />
        <p className="text-sm font-medium">No hay mensajes aún</p>
        <p className="text-xs mt-1">Los mensajes del formulario de contacto aparecen aquí</p>
      </div>
    );
  }

  const unread = contacts.filter((c) => !c.read);
  const read   = contacts.filter((c) =>  c.read);

  const MensajeCard = ({ c }: { c: ContactMessage }) => (
    <div className={`rounded-2xl border p-4 transition-colors ${
      c.read ? "border-border bg-white" : "border-primary/25 bg-primary/4"
    }`} style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-start gap-3">
        <Avatar name={c.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            {!c.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
            <span className="font-semibold text-sm">{c.name}</span>
            <span className="text-[11px] text-muted-foreground">
              {format(new Date(c.created_at), "dd MMM · HH:mm", { locale: es })}
            </span>
          </div>
          <p className="text-sm text-foreground/80 mb-2 leading-relaxed break-words">{c.message}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-primary transition-colors">
              <Mail size={11} /> {c.email}
            </a>
            {c.phone && (
              <a href={`tel:${c.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                <MessageCircle size={11} /> {c.phone}
              </a>
            )}
          </div>
        </div>

        <div className="flex gap-1 shrink-0 flex-col sm:flex-row">
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-primary hover:bg-primary/10"
            title="Responder por email"
            onClick={() => {
              if (!c.read) markContactRead(c.id);
              window.open(
                `mailto:${c.email}?subject=Re: Tu mensaje a Pequesaurios&body=Hola ${c.name.split(" ")[0]},%0A%0AGracias por contactarnos. `,
                "_blank"
              );
            }}
          >
            <Mail size={14} />
          </Button>
          {c.phone && (
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-green-600 hover:bg-green-50"
              title="Responder por WhatsApp"
              onClick={() => {
                if (!c.read) markContactRead(c.id);
                const phone = c.phone!.replace(/\D/g, "");
                const phoneWithCode = phone.startsWith("52") ? phone : `52${phone}`;
                const msg = encodeURIComponent(`¡Hola ${c.name.split(" ")[0]}! Gracias por contactar a *Pequesaurios*. `);
                window.open(`https://wa.me/${phoneWithCode}?text=${msg}`, "_blank");
              }}
            >
              <MessageCircle size={14} />
            </Button>
          )}
          {!c.read && (
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              title="Marcar como leído"
              onClick={() => markContactRead(c.id)}
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
                <AlertDialogTitle>¿Eliminar mensaje?</AlertDialogTitle>
                <AlertDialogDescription>Se eliminará el mensaje de <strong>{c.name}</strong>.</AlertDialogDescription>
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
  );

  return (
    <div className="space-y-5">
      {unread.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Sin leer ({unread.length})
          </p>
          <div className="space-y-2.5">
            {unread.map((c) => <MensajeCard key={c.id} c={c} />)}
          </div>
        </div>
      )}
      {read.length > 0 && (
        <div>
          {unread.length > 0 && (
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
              Leídos ({read.length})
            </p>
          )}
          <div className="space-y-2.5">
            {read.map((c) => <MensajeCard key={c.id} c={c} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default MensajesView;
