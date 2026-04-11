import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, ChevronLeft, Eye } from "lucide-react";
import logo from "@/assets/logo.png";

type Reservation = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  event_date: string;
  package: string;
};

export type ContratoPrefill = {
  address?: string;
  hora?: string;
  horaFin?: string;
  servicios?: string[];   // ids de servicios seleccionados
  total?: number;
  anticipo?: number;
};

type Props = {
  reservation: Reservation | null;
  open: boolean;
  onClose: () => void;
  prefill?: ContratoPrefill;
};

const SERVICIOS_OPCIONES = [
  { id: "inflable",      label: "Inflable Castillo Blanco 3×3 m",              valor: 3500 },
  { id: "mesa-pastel",   label: "Mesita Infantil Pastel (6 sillas plástico)",   valor: 800  },
  { id: "mesa-blanca",   label: "Mesita Blanca (8 sillas madera)",              valor: 1200 },
  { id: "arte",          label: "Arte en Mesa",                                 valor: 300  },
  { id: "yesitos",       label: "Kit de Yesitos",                               valor: 150  },
  { id: "pintacaritas",  label: "Pintacaritas (1.5 hrs)",                       valor: 800  },
  { id: "globos",        label: "Guirnalda de Globos",                          valor: 400  },
];

// ── Plantilla visual ──────────────────────────────────────────────────────────
const ContratoTemplate = ({
  reservation, address, hora, horaFin,
  serviciosSeleccionados, total, anticipo, folio,
}: {
  reservation: Reservation; address: string; hora: string; horaFin: string;
  serviciosSeleccionados: string[]; total: number; anticipo: number; folio: string;
}) => {
  const fecha = format(parseISO(reservation.event_date + "T12:00:00"), "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  const hoy = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });
  const saldo = total - anticipo;
  const tieneInflable = serviciosSeleccionados.includes("inflable");
  const tieneMobiliario = serviciosSeleccionados.some((s) => s.startsWith("mesa"));

  const pink = "#e8679a";
  const lightPink = "#fdf2f7";
  const cell = { padding: "6px 10px", borderBottom: "1px solid #f0dde9" } as React.CSSProperties;

  return (
    <div style={{ width: 700, background: "#fff", fontFamily: "'Segoe UI', Arial, sans-serif", color: "#1a1a1a", padding: "40px 48px", boxSizing: "border-box", fontSize: 12, lineHeight: 1.65 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `3px solid ${pink}`, paddingBottom: 14, marginBottom: 20 }}>
        <img src={logo} alt="Pequesaurios" style={{ height: 68, objectFit: "contain" }} />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: pink }}>CONTRATO DE RENTA</div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Folio: {folio}</div>
          <div style={{ fontSize: 11, color: "#888" }}>Fecha de emisión: {hoy}</div>
        </div>
      </div>

      {/* Partes */}
      <div style={{ background: lightPink, borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: pink, fontSize: 10, textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 }}>Partes del contrato</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 11 }}>PROVEEDOR</div>
            <div>Pequesaurios Mobiliario Infantil</div>
            <div style={{ color: "#666" }}>Tel: 818 054 0369 · @pequesaurioss</div>
            <div style={{ color: "#666" }}>Monterrey, Nuevo León</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 11 }}>CLIENTE (ARRENDATARIO)</div>
            <div style={{ fontWeight: 600 }}>{reservation.customer_name}</div>
            <div style={{ color: "#666" }}>Tel: {reservation.customer_phone}</div>
            {reservation.customer_email && <div style={{ color: "#666" }}>{reservation.customer_email}</div>}
          </div>
        </div>
      </div>

      {/* Evento */}
      <div style={{ background: lightPink, borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: pink, fontSize: 10, textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 }}>Datos del evento</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div><span style={{ fontWeight: 600 }}>Fecha: </span>{fecha}</div>
          <div><span style={{ fontWeight: 600 }}>Horario: </span>{hora}{horaFin ? ` a ${horaFin}` : ""}</div>
          {address && <div style={{ gridColumn: "1 / -1" }}><span style={{ fontWeight: 600 }}>Lugar: </span>{address}</div>}
        </div>
      </div>

      {/* Artículos */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: pink, fontSize: 10, textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 }}>Artículos rentados</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: pink }}>
              <th style={{ color: "#fff", padding: "7px 10px", textAlign: "left", fontWeight: 600 }}>Artículo</th>
              <th style={{ color: "#fff", padding: "7px 10px", textAlign: "right", fontWeight: 600 }}>Valor de reposición</th>
            </tr>
          </thead>
          <tbody>
            {serviciosSeleccionados.map((id) => {
              const s = SERVICIOS_OPCIONES.find((o) => o.id === id);
              return (
                <tr key={id}>
                  <td style={cell}>{s?.label ?? id}</td>
                  <td style={{ ...cell, textAlign: "right", color: "#666" }}>${(s?.valor ?? 0).toLocaleString()} MXN</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Condiciones */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: pink, fontSize: 10, textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 }}>Términos y condiciones de uso</div>

        {tieneInflable && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 3 }}>Inflable</div>
            {[
              "Uso exclusivo para niños menores de 12 años. Máximo 6 niños simultáneamente.",
              "Adulto responsable supervisando en todo momento.",
              "Prohibido zapatos, objetos punzantes, alimentos o bebidas dentro del inflable.",
              "Suspender uso inmediatamente ante lluvia, viento fuerte o condiciones climáticas adversas.",
              "Prohibido colgar, jalar o dañar paredes, columnas y costuras.",
            ].map((c, i) => <div key={i} style={{ paddingLeft: 12, color: "#444", marginBottom: 2 }}>• {c}</div>)}
          </div>
        )}

        {tieneMobiliario && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 3 }}>Mobiliario</div>
            {[
              "No rayar, doblar, pintar ni dañar mesas o sillas.",
              "Entregar el mobiliario limpio y en las mismas condiciones recibidas.",
              "Cualquier pieza dañada o extraviada deberá ser repuesta o pagada al precio de lista.",
            ].map((c, i) => <div key={i} style={{ paddingLeft: 12, color: "#444", marginBottom: 2 }}>• {c}</div>)}
          </div>
        )}

        <div>
          <div style={{ fontWeight: 700, marginBottom: 3 }}>Generales</div>
          {[
            "Pequesaurios no se hace responsable de accidentes por mal uso de los artículos rentados.",
            "Cambios de horario deben notificarse con mínimo 24 horas de anticipación.",
            "En caso de cancelación por el cliente, el anticipo no es reembolsable.",
            "El saldo restante debe liquidarse al momento de entrega de los artículos.",
          ].map((c, i) => <div key={i} style={{ paddingLeft: 12, color: "#444", marginBottom: 2 }}>• {c}</div>)}
        </div>
      </div>

      {/* Penalizaciones */}
      <div style={{ background: "#fff5f9", border: `1px solid ${pink}`, borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: pink, fontSize: 10, textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 }}>Penalizaciones por daños</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: "#fce0ee" }}>
              <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: 600, color: "#c0397a" }}>Situación</th>
              <th style={{ padding: "6px 10px", textAlign: "right", fontWeight: 600, color: "#c0397a" }}>Cargo</th>
            </tr>
          </thead>
          <tbody>
            {[
              { s: "Daño parcial reparable (costura, vinilo, patas)", c: "Costo de reparación a precio de taller" },
              { s: "Daño mayor que inutiliza el artículo (daño total)", c: "100% del valor de reposición del artículo" },
              { s: "Artículo extraviado o robado", c: "100% del valor de reposición del artículo" },
              { s: "Inflable con suciedad excesiva que requiere lavado especial", c: "$300 – $500 MXN adicionales" },
              { s: "Silla o mesa rota por mal uso", c: "$150 – $400 MXN por pieza según artículo" },
              { s: "Retención del equipo más allá del horario acordado sin aviso", c: "$200 MXN por hora adicional" },
            ].map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fdf2f7" }}>
                <td style={cell}>{r.s}</td>
                <td style={{ ...cell, textAlign: "right", fontWeight: 600, color: "#c0397a" }}>{r.c}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 8, fontSize: 11, color: "#888", fontStyle: "italic" }}>
          El cliente acepta cubrir cualquier cargo por daño antes o al momento de la devolución del equipo.
        </div>
      </div>

      {/* Pago */}
      <div style={{ background: lightPink, borderRadius: 8, padding: "12px 16px", marginBottom: 28 }}>
        <div style={{ fontWeight: 700, color: pink, fontSize: 10, textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 }}>Acuerdo de pago</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
          {[
            { label: "Total del servicio", value: `$${total.toLocaleString()} MXN` },
            { label: "Anticipo pagado (50%)", value: `$${anticipo.toLocaleString()} MXN` },
            { label: "Saldo al entregar", value: `$${saldo.toLocaleString()} MXN` },
          ].map((r) => (
            <div key={r.label} style={{ background: "#fff", borderRadius: 6, padding: "8px 12px" }}>
              <div style={{ color: pink, fontWeight: 600, fontSize: 10 }}>{r.label}</div>
              <div style={{ fontWeight: 800, fontSize: 14, marginTop: 2 }}>{r.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Aceptación y firmas */}
      <div style={{ marginBottom: 20, fontSize: 11, color: "#555", textAlign: "center", fontStyle: "italic" }}>
        Al firmar este contrato, el cliente declara haber leído, entendido y aceptado todos los términos y condiciones descritos en este documento.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        {[`Proveedor\nPequesaurios Mobiliario Infantil`, `Cliente\n${reservation.customer_name}`].map((firma, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ height: 40 }} />
            <div style={{ borderTop: `1.5px solid ${pink}`, paddingTop: 6, whiteSpace: "pre-line", fontSize: 11, color: "#555" }}>{firma}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 20, paddingTop: 10, borderTop: "1px solid #eee", textAlign: "center", fontSize: 10, color: "#aaa" }}>
        Pequesaurios Mobiliario Infantil · Monterrey, N.L. · 818 054 0369 · @pequesaurioss
      </div>
    </div>
  );
};

// ── Dialog ────────────────────────────────────────────────────────────────────
const Contrato = ({ reservation, open, onClose, prefill }: Props) => {
  const contratoRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState("");
  const [hora, setHora] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([]);
  const [total, setTotal] = useState("");
  const [anticipo, setAnticipo] = useState("");
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (open && prefill) {
      setAddress(prefill.address ?? "");
      setHora(prefill.hora ?? "");
      setHoraFin(prefill.horaFin ?? "");
      setServiciosSeleccionados(prefill.servicios ?? []);
      if (prefill.total) { setTotal(String(prefill.total)); setAnticipo(String(prefill.anticipo ?? Math.round(prefill.total * 0.5))); }
    }
  }, [open]);

  if (!reservation) return null;

  const folio = `PQ-${format(new Date(), "yyyyMMdd")}-${reservation.id.slice(0, 4).toUpperCase()}`;
  const totalNum = parseInt(total) || 0;
  const anticipoNum = parseInt(anticipo) || Math.round(totalNum * 0.5);

  const toggleServicio = (id: string) =>
    setServiciosSeleccionados((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const descargarPDF = async () => {
    if (!contratoRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(contratoRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`contrato-${reservation.customer_name.split(" ")[0]}-${format(new Date(), "yyyyMMdd")}.pdf`);
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    onClose(); setPreview(false); setAddress(""); setHora(""); setHoraFin("");
    setServiciosSeleccionados([]); setTotal(""); setAnticipo("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{preview ? "Vista previa del contrato" : `Contrato de Renta — ${reservation.customer_name}`}</DialogTitle>
        </DialogHeader>

        {!preview ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Hora de inicio</Label><Input value={hora} onChange={(e) => setHora(e.target.value)} placeholder="Ej: 2:00 pm" /></div>
              <div><Label>Hora de fin</Label><Input value={horaFin} onChange={(e) => setHoraFin(e.target.value)} placeholder="Ej: 7:00 pm" /></div>
            </div>
            <div><Label>Dirección del evento</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, colonia, municipio" /></div>

            <div>
              <Label className="mb-2 block">Artículos rentados</Label>
              <div className="space-y-2">
                {SERVICIOS_OPCIONES.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer hover:bg-muted/30" onClick={() => toggleServicio(s.id)}>
                    <Checkbox checked={serviciosSeleccionados.includes(s.id)} onCheckedChange={() => toggleServicio(s.id)} />
                    <div className="flex-1">
                      <span className="text-sm">{s.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">(val. reposición: ${s.valor.toLocaleString()})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total del servicio ($)</Label>
                <Input type="number" value={total} onChange={(e) => { setTotal(e.target.value); setAnticipo(String(Math.round(parseInt(e.target.value || "0") * 0.5))); }} placeholder="Ej: 1300" />
              </div>
              <div>
                <Label>Anticipo pagado ($)</Label>
                <Input type="number" value={anticipo} onChange={(e) => setAnticipo(e.target.value)} placeholder="Auto: 50%" />
              </div>
            </div>

            <Button className="w-full" variant="hero" disabled={serviciosSeleccionados.length === 0 || !totalNum} onClick={() => setPreview(true)}>
              <Eye size={16} /> Ver contrato
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center overflow-auto">
              <div ref={contratoRef}>
                <ContratoTemplate reservation={reservation} address={address} hora={hora} horaFin={horaFin} serviciosSeleccionados={serviciosSeleccionados} total={totalNum} anticipo={anticipoNum} folio={folio} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setPreview(false)}><ChevronLeft size={15} /> Editar</Button>
              <Button variant="hero" className="flex-1" onClick={descargarPDF} disabled={generating}>
                <Download size={16} />{generating ? "Generando PDF..." : "Descargar contrato PDF"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Contrato;
