import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Result = "loading" | "confirmada" | "cancelada" | "error" | "invalid";

const messages: Record<Result, { icon: React.ReactNode; title: string; desc: string; color: string }> = {
  loading: {
    icon: <Loader2 size={52} className="animate-spin text-primary" />,
    title: "Procesando...",
    desc: "Un momento por favor.",
    color: "",
  },
  confirmada: {
    icon: <CheckCircle size={52} className="text-green-500" />,
    title: "¡Reservación confirmada!",
    desc: "El cliente será notificado. Puedes ver el detalle en el panel admin.",
    color: "text-green-600",
  },
  cancelada: {
    icon: <XCircle size={52} className="text-red-400" />,
    title: "Reservación cancelada",
    desc: "La fecha quedó libre nuevamente y la reservación aparece como cancelada en el panel.",
    color: "text-red-500",
  },
  error: {
    icon: <AlertTriangle size={52} className="text-yellow-500" />,
    title: "Error al actualizar",
    desc: "Hubo un problema. Intenta desde el panel de admin.",
    color: "text-yellow-600",
  },
  invalid: {
    icon: <AlertTriangle size={52} className="text-yellow-500" />,
    title: "Link inválido",
    desc: "Este link no tiene la información correcta o ya expiró.",
    color: "text-yellow-600",
  },
};

const Accion = () => {
  const [params] = useSearchParams();
  const [result, setResult] = useState<Result>("loading");

  useEffect(() => {
    const id = params.get("id");
    const estado = params.get("estado");

    if (!id || !["confirmada", "cancelada"].includes(estado ?? "")) {
      setResult("invalid");
      return;
    }

    const run = async () => {
      // 1. Fetch reservation data first
      const { data: reservation, error: fetchError } = await supabase
        .from("reservations")
        .select("customer_name, customer_phone, event_date, package")
        .eq("id", id)
        .single();

      if (fetchError || !reservation) {
        setResult("error");
        return;
      }

      // 2. Update status
      const { error: updateError } = await supabase
        .from("reservations")
        .update({ status: estado as string })
        .eq("id", id);

      if (updateError) {
        setResult("error");
        return;
      }

      setResult(estado as Result);

      // 3. Open WhatsApp to client with confirmation/cancellation message
      const packageLabels: Record<string, string> = {
        inflable: "Inflable Castillo Blanco",
        mobiliario: "Mobiliario Infantil",
        pintacaritas: "Pintacaritas",
        yesitos: "Kit de Yesitos",
        "paquete-completo": "Paquete Completo",
      };

      const [year, month, day] = reservation.event_date.split("-");
      const fechaLegible = `${day}/${month}/${year}`;
      const paquete = packageLabels[reservation.package] ?? reservation.package;
      const nombre = reservation.customer_name.split(" ")[0]; // solo primer nombre

      let mensaje = "";
      if (estado === "confirmada") {
        mensaje =
          `¡Hola ${nombre}! Queremos confirmarte que tu reservación con *Pequesaurios* está *confirmada*.\n\n` +
          `📅 *Fecha:* ${fechaLegible}\n` +
          `🎪 *Paquete:* ${paquete}\n\n` +
          `Si tienes alguna duda o cambio, escríbenos aquí mismo. ¡Nos vemos pronto!`;
      } else {
        mensaje =
          `Hola ${nombre}, te informamos que tu reservación del *${fechaLegible}* con *Pequesaurios* ha sido *cancelada*.\n\n` +
          `Si deseas reagendar o tienes alguna pregunta, con gusto te ayudamos. 😊`;
      }

      const phone = reservation.customer_phone.replace(/\D/g, "");
      const phoneWithCode = phone.startsWith("52") ? phone : `52${phone}`;
      window.open(`https://wa.me/${phoneWithCode}?text=${encodeURIComponent(mensaje)}`, "_blank");
    };

    run();
  }, []);

  const msg = messages[result];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-4">{msg.icon}</div>
        <h1 className={`font-heading text-2xl font-bold mb-2 ${msg.color}`}>{msg.title}</h1>
        <p className="text-muted-foreground text-sm mb-6">{msg.desc}</p>
        {result !== "loading" && (
          <Button asChild variant="outline">
            <Link to="/admin">Ir al panel admin</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Accion;
