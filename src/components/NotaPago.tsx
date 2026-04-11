import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Download, Eye, ChevronLeft } from "lucide-react";
import logo from "@/assets/logo.png";

// ── Servicios ────────────────────────────────────────────────────────────────
const SERVICIOS = [
  { id: "inflable",     name: "Inflable blanco 3x3 metros",          price: 1300 },
  { id: "mesa-pastel",  name: "Mesita (6 sillas plástico pasteles)",  price: 500  },
  { id: "mesa-blanca",  name: "Mesita Blanca (8 sillas madera)",      price: 750  },
  { id: "arte",         name: "Arte en mesa (25 dibujos + crayolas + stickers)", price: 150 },
  { id: "yesitos",      name: "Kit de Yesitos",                       price: 20   },
  { id: "pintacaritas", name: "Pintacaritas (1.5 hrs)",               price: 800  },
  { id: "globos",       name: "Guirnalda de Globos",                  price: 200  },
];

// Mapeo de nuevos IDs a antiguos para compatibilidad
const ID_MAP: Record<string, { oldId: string; name: string }> = {
  "bpz-inflable":      { oldId: "bpz-inflable",      name: "BPZ · Inflable Castillo (solo)" },
  "bpz-basico":        { oldId: "bpz-basico",        name: "BPZ · Paquete Básico (inflable + mesita)" },
  "bpz-plus":          { oldId: "bpz-plus",          name: "BPZ · Paquete Plus (inflable + mesita arte)" },
  "inflable":          { oldId: "inflable",          name: "Inflable Castillo Blanco 3×3 m" },
  "mesa-pastel":       { oldId: "mesa-pastel",       name: "Mesita Infantil Pastel (6 sillas)" },
  "mesa-blanca":       { oldId: "mesa-blanca",       name: "Mesita Blanca (8 sillas madera)" },
  "mesa-extra":        { oldId: "mesa-extra",        name: "Mesa extra (segunda mesa)" },
  "yesito-basico":     { oldId: "yesito-basico",     name: "Kit Yesitos Básico (1 yesito)" },
  "yesito-intermedio": { oldId: "yesito-intermedio", name: "Kit Yesitos Intermedio (2 yesitos)" },
  "yesito-completo":   { oldId: "yesito-completo",   name: "Kit Yesitos Completo (3 yesitos)" },
  "arte":              { oldId: "arte",              name: "Arte en Mesa" },
  "globos":            { oldId: "globos",            name: "Guirnalda de Globos" },
  "pintacaritas":      { oldId: "pintacaritas",      name: "Pintacaritas (1.5 hrs)" },
};

type Reservation = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  event_date: string;
};

type Prefill = {
  address?: string;
  hora?: string;
  paqueteNombre?: string;
  servicios?: Record<string, number>;
  precios?: Record<string, number>;
  flete?: number;
  metodoPago?: string;
  skipToPreview?: boolean;
};

type Props = {
  reservation: Reservation | null;
  open: boolean;
  onClose: () => void;
  prefill?: Prefill;
};

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 0 });

// ── Plantilla visual de la nota ───────────────────────────────────────────────
const NotaTemplate = ({
  reservation,
  address,
  hora,
  paqueteNombre,
  servicios,
  precios,
  flete,
  metodoPago,
}: {
  reservation: Reservation;
  address: string;
  hora: string;
  paqueteNombre: string;
  servicios: Record<string, number>;
  precios?: Record<string, number>;
  flete: number;
  metodoPago: string;
}) => {
  // Precios por defecto para cada servicio
  const defaultPrices: Record<string, number> = {
    "bpz-inflable": 800,
    "bpz-basico": 1200,
    "bpz-plus": 1400,
    "inflable": 1300,
    "mesa-pastel": 500,
    "mesa-blanca": 750,
    "mesa-extra": 350,
    "yesito-basico": 20,
    "yesito-intermedio": 25,
    "yesito-completo": 30,
    "arte": 150,
    "globos": 200,
    "pintacaritas": 800,
  };

  const getServicePrice = (id: string) => {
    return precios?.[id] ?? defaultPrices[id] ?? 0;
  };

  // Obtener servicios seleccionados como array
  const lineas = Object.entries(servicios)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({
      id,
      name: ID_MAP[id]?.name || id,
      qty,
      price: getServicePrice(id),
    }));

  const totalServicios = lineas.reduce((sum, l) => sum + l.price * l.qty, 0);
  const total = totalServicios + flete;
  const anticipo = Math.round(total * 0.5);
  const pendiente = total - anticipo;

  const fechaStr = format(
    parseISO(reservation.event_date + "T12:00:00"),
    "EEEE d 'de' MMMM yyyy",
    { locale: es }
  );

  const metodosMap: Record<string, string> = {
    efectivo: "Efectivo",
    tarjeta: "Tarjeta",
    transferencia: "Transferencia",
  };

  const pink = "#e8679a";
  const lightPink = "#fce8f3";
  const textDark = "#1a1a1a";
  const textGray = "#666";

  return (
    <div
      style={{
        width: 550,
        background: lightPink,
        fontFamily: "'Segoe UI', Arial, sans-serif",
        color: textDark,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* ── Header con logo ── */}
      <div
        style={{
          background: "#fff",
          paddingTop: 24,
          paddingBottom: 0,
          textAlign: "center",
          position: "relative",
        }}
      >
        <img src={logo} alt="Pequesaurios" style={{ height: 72, objectFit: "contain", margin: "0 auto" }} />

        {/* Wavy divider */}
        <svg
          viewBox="0 0 550 40"
          style={{ display: "block", width: "100%", marginTop: 8 }}
          preserveAspectRatio="none"
        >
          <path
            d="M0,20 C55,40 110,0 165,20 C220,40 275,0 330,20 C385,40 440,0 495,20 L550,20 L550,40 L0,40 Z"
            fill={lightPink}
          />
        </svg>
      </div>

      <div style={{ padding: "8px 28px 28px" }}>
        {/* ── Datos del cliente ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: "18px 22px",
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
            <div>
              <span style={{ fontWeight: 700 }}>Fecha: </span>
              <span style={{ color: textGray }}>{fechaStr}</span>
            </div>
            <div>
              <span style={{ fontWeight: 700 }}>Teléfono: </span>
              <span style={{ color: textGray }}>{reservation.customer_phone}</span>
            </div>
            <div>
              <span style={{ fontWeight: 700 }}>Nombre: </span>
              <span style={{ color: textGray }}>{reservation.customer_name}</span>
            </div>
            {hora && (
              <div>
                <span style={{ fontWeight: 700 }}>Hora: </span>
                <span style={{ color: textGray }}>{hora}</span>
              </div>
            )}
            {address && (
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ fontWeight: 700 }}>Dirección: </span>
                <span style={{ color: textGray }}>{address}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabla de servicios ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: pink }}>
                <th style={{ color: "#fff", padding: "10px 14px", textAlign: "left", fontWeight: 600, width: "35%" }}>Paquete</th>
                <th style={{ color: "#fff", padding: "10px 14px", textAlign: "center", fontWeight: 600, width: "15%" }}>Cant</th>
                <th style={{ color: "#fff", padding: "10px 14px", textAlign: "right", fontWeight: 600, width: "25%" }}>Precio</th>
              </tr>
            </thead>
            <tbody>
              {lineas.map((linea) => (
                <tr key={linea.id} style={{ borderBottom: "1px solid #f0dde9" }}>
                  <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                    {linea.name}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center", color: textGray }}>
                    {linea.qty}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600 }}>
                    ${((linea.price * linea.qty)).toLocaleString("es-MX")}
                  </td>
                </tr>
              ))}
              <tr style={{ borderBottom: "1px solid #f0dde9" }}>
                <td style={{ padding: "12px 14px", color: textGray, textAlign: "center" }}>Flete</td>
                <td style={{ padding: "12px 14px", textAlign: "center", color: textGray }}>1</td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600 }}>
                  ${flete.toLocaleString("es-MX")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Pago ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Método de pago */}
          <div style={{ fontSize: 13 }}>
            <div style={{ fontWeight: 700, color: pink, marginBottom: 8 }}>Método de pago</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              {["efectivo", "tarjeta", "transferencia"].map((m) => (
                <div key={m} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: `2px solid ${pink}`,
                      background: metodoPago === m ? pink : "transparent",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: metodoPago === m ? pink : textGray, fontWeight: metodoPago === m ? 600 : 400 }}>
                    {metodosMap[m]}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ color: pink, fontSize: 12, fontStyle: "italic", marginTop: 8 }}>
              No hay devolución en caso de cancelación por parte del cliente.
            </div>
          </div>

          {/* Totales */}
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              overflow: "hidden",
              fontSize: 14,
            }}
          >
            {[
              { label: "Total", value: total, bold: false },
              { label: "Anticipo", value: anticipo, bold: false },
              { label: "Pendiente", value: pendiente, bold: true },
            ].map((row, i) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderBottom: i < 2 ? "1px solid #f0dde9" : "none",
                }}
              >
                <span style={{ color: pink, fontWeight: 600 }}>{row.label}</span>
                <span style={{ fontWeight: row.bold ? 800 : 600 }}>${row.value.toLocaleString("es-MX")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer con redes sociales ── */}
        <div
          style={{
            marginTop: 20,
            paddingTop: 14,
            borderTop: "1px solid #f0dde9",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: textGray,
          }}
        >
          <div style={{ lineHeight: 1.8 }}>
            <div>📍 Monterrey, N.L</div>
            <div>📞 8180540369</div>
          </div>
          <div style={{ textAlign: "right", lineHeight: 1.8, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>📸</span>
            <span style={{ fontSize: 18, color: "#0066ff" }}>🟦</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#666" }}>@PEQUESAURIOSS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Dialog ────────────────────────────────────────────────────────────────────
const NotaPago = ({ reservation, open, onClose, prefill }: Props) => {
  const notaRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState(prefill?.address ?? "");
  const [hora, setHora] = useState(prefill?.hora ?? "");
  const [paqueteNombre, setPaqueteNombre] = useState(prefill?.paqueteNombre ?? "");
  const [servicios, setServicios] = useState<Record<string, number>>(prefill?.servicios ?? {});
  const [precios, setPrecios] = useState<Record<string, number>>(prefill?.precios ?? {});
  const [flete, setFlete] = useState(prefill?.flete ?? 0);
  const [metodoPago, setMetodoPago] = useState(prefill?.metodoPago ?? "transferencia");
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(prefill?.skipToPreview ?? false);

  useEffect(() => {
    if (open && prefill) {
      setAddress(prefill.address ?? "");
      setHora(prefill.hora ?? "");
      setPaqueteNombre(prefill.paqueteNombre ?? "");
      setServicios(prefill.servicios ?? {});
      setPrecios(prefill.precios ?? {});
      setFlete(prefill.flete ?? 0);
      setMetodoPago(prefill.metodoPago ?? "transferencia");
      setPreview(prefill.skipToPreview ?? false);
    }
  }, [open]);

  if (!reservation) return null;

  const getServicePrice = (id: string) => {
    const defaultPrices: Record<string, number> = {
      "bpz-inflable": 800,
      "bpz-basico": 1200,
      "bpz-plus": 1400,
      "inflable": 1300,
      "mesa-pastel": 500,
      "mesa-blanca": 750,
      "mesa-extra": 350,
      "yesito-basico": 20,
      "yesito-intermedio": 25,
      "yesito-completo": 30,
      "arte": 150,
      "globos": 200,
      "pintacaritas": 800,
    };
    return precios?.[id] ?? defaultPrices[id] ?? 0;
  };

  const hayServicios = Object.values(servicios).some((v) => v > 0);

  const totalServicios = Object.entries(servicios)
    .reduce((sum, [id, qty]) => sum + getServicePrice(id) * qty, 0);
  const total = totalServicios + flete;
  const anticipo = Math.round(total * 0.5);

  const cambiarCantidad = (id: string, delta: number) => {
    setServicios((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      if (next === 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: next };
    });
  };

  const descargarPDF = async () => {
    if (!notaRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(notaRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fce8f3",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      const fechaStr = format(new Date(), "yyyyMMdd");
      pdf.save(`nota-${reservation.customer_name.split(" ")[0]}-${fechaStr}.pdf`);
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    onClose();
    setPreview(false);
    setAddress("");
    setHora("");
    setPaqueteNombre("");
    setServicios({});
    setFlete(0);
    setMetodoPago("transferencia");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {preview ? "Vista previa de la nota" : `Crear Nota de Pago — ${reservation.customer_name}`}
          </DialogTitle>
        </DialogHeader>

        {!preview ? (
          <div className="space-y-5">
            {/* Nombre del paquete */}
            <div>
              <Label>Nombre del paquete</Label>
              <Input value={paqueteNombre} onChange={(e) => setPaqueteNombre(e.target.value)} placeholder="Ej: Paquete Dino Creativo" />
            </div>

            {/* Hora y dirección */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hora del evento</Label>
                <Input value={hora} onChange={(e) => setHora(e.target.value)} placeholder="Ej: 2:00 a 7:00 pm" />
              </div>
              <div>
                <Label>Flete ($)</Label>
                <Input
                  type="number"
                  min={0}
                  value={flete === 0 ? "" : flete}
                  onChange={(e) => setFlete(Number(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label>Dirección del evento</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej: Calle Roble 123, Col. Del Valle, Monterrey" />
            </div>

            {/* Método de pago */}
            <div>
              <Label className="mb-2 block">Método de pago</Label>
              <div className="flex gap-4">
                {["efectivo", "tarjeta", "transferencia"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMetodoPago(m)}
                    className={`flex-1 rounded-xl border py-2 text-sm capitalize transition-colors ${
                      metodoPago === m
                        ? "border-primary bg-primary/10 font-semibold text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Servicios */}
            <div>
              <Label className="mb-2 block">Servicios incluidos</Label>
              <div className="space-y-2">
                {Object.entries(ID_MAP).map(([id, { name }]) => {
                  const qty = servicios[id] ?? 0;
                  const currentPrice = getServicePrice(id);
                  return (
                    <div
                      key={id}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                        qty > 0 ? "border-primary/40 bg-primary/5" : "border-border"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">${currentPrice.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => cambiarCantidad(id, -1)} disabled={qty === 0}>
                          <Minus size={13} />
                        </Button>
                        <span className="w-5 text-center text-sm font-semibold">{qty}</span>
                        <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => cambiarCantidad(id, 1)}>
                          <Plus size={13} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumen rápido */}
            {hayServicios && (
              <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Anticipo (50%)</span>
                  <span className="font-semibold text-green-600">${anticipo.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Pendiente</span>
                  <span className="font-bold text-primary">${anticipo.toLocaleString()}</span>
                </div>
              </div>
            )}

            <Button className="w-full" variant="hero" disabled={!hayServicios} onClick={() => setPreview(true)}>
              <Eye size={16} /> Ver nota
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center overflow-auto">
              <div ref={notaRef}>
                <NotaTemplate
                  reservation={reservation}
                  address={address}
                  hora={hora}
                  paqueteNombre={paqueteNombre}
                  servicios={servicios}
                  precios={precios}
                  flete={flete}
                  metodoPago={metodoPago}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setPreview(false)}>
                <ChevronLeft size={15} /> Editar
              </Button>
              <Button variant="hero" className="flex-1" onClick={descargarPDF} disabled={generating}>
                <Download size={16} />
                {generating ? "Generando PDF..." : "Descargar PDF"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotaPago;
