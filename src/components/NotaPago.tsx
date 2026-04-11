import { useRef, useState } from "react";
import html2canvas from "html2canvas";
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

type Reservation = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  event_date: string;
};

type Props = {
  reservation: Reservation | null;
  open: boolean;
  onClose: () => void;
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
  flete,
  metodoPago,
}: {
  reservation: Reservation;
  address: string;
  hora: string;
  paqueteNombre: string;
  servicios: Record<string, number>;
  flete: number;
  metodoPago: string;
}) => {
  const lineas = SERVICIOS.filter((s) => (servicios[s.id] ?? 0) > 0);
  const totalServicios = lineas.reduce((sum, s) => sum + s.price * (servicios[s.id] ?? 0), 0);
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
      {/* ── Header ── */}
      <div
        style={{
          background: "#fff",
          paddingTop: 28,
          paddingBottom: 0,
          textAlign: "center",
          position: "relative",
        }}
      >
        <img src={logo} alt="Pequesaurios" style={{ height: 80, objectFit: "contain" }} />

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
                <th style={{ color: "#fff", padding: "10px 14px", textAlign: "left", fontWeight: 600, width: "30%" }}>Paquete</th>
                <th style={{ color: "#fff", padding: "10px 14px", textAlign: "left", fontWeight: 600 }}>Descripción</th>
                <th style={{ color: "#fff", padding: "10px 14px", textAlign: "right", fontWeight: 600, width: "15%" }}>Precio</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #f0dde9" }}>
                <td style={{ padding: "14px", verticalAlign: "top", color: textGray, textAlign: "center" }}>
                  {paqueteNombre || "Paquete"}
                </td>
                <td style={{ padding: "14px", verticalAlign: "top" }}>
                  <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                    {lineas.map((s) => (
                      <li key={s.id}>
                        {s.name}
                        {(servicios[s.id] ?? 0) > 1 ? ` ×${servicios[s.id]}` : ""}
                      </li>
                    ))}
                  </ul>
                </td>
                <td style={{ padding: "14px", textAlign: "right", fontWeight: 600, verticalAlign: "top" }}>
                  {fmt(totalServicios)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "12px 14px", color: textGray, textAlign: "center" }}>Flete</td>
                <td />
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600 }}>
                  {fmt(flete)}
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
              { label: "Total", value: fmt(total), bold: false },
              { label: "Anticipo", value: fmt(anticipo), bold: false },
              { label: "Pendiente", value: fmt(pendiente), bold: true },
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
                <span style={{ fontWeight: row.bold ? 800 : 600 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
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
          <div style={{ textAlign: "right", lineHeight: 1.8 }}>
            <div>📸 🟦 @PEQUESAURIOSS</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Dialog ────────────────────────────────────────────────────────────────────
const NotaPago = ({ reservation, open, onClose }: Props) => {
  const notaRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState("");
  const [hora, setHora] = useState("");
  const [paqueteNombre, setPaqueteNombre] = useState("");
  const [servicios, setServicios] = useState<Record<string, number>>({});
  const [flete, setFlete] = useState(0);
  const [metodoPago, setMetodoPago] = useState("transferencia");
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(false);

  if (!reservation) return null;

  const hayServicios = Object.values(servicios).some((v) => v > 0);

  const totalServicios = SERVICIOS.filter((s) => (servicios[s.id] ?? 0) > 0)
    .reduce((sum, s) => sum + s.price * (servicios[s.id] ?? 0), 0);
  const total = totalServicios + flete;
  const anticipo = Math.round(total * 0.5);

  const cambiarCantidad = (id: string, delta: number) => {
    setServicios((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      if (next === 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: next };
    });
  };

  const descargarImagen = async () => {
    if (!notaRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(notaRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const link = document.createElement("a");
      const fechaStr = format(new Date(), "yyyyMMdd");
      link.download = `nota-${reservation.customer_name.split(" ")[0]}-${fechaStr}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
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
                {SERVICIOS.map((s) => {
                  const qty = servicios[s.id] ?? 0;
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                        qty > 0 ? "border-primary/40 bg-primary/5" : "border-border"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">${s.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => cambiarCantidad(s.id, -1)} disabled={qty === 0}>
                          <Minus size={13} />
                        </Button>
                        <span className="w-5 text-center text-sm font-semibold">{qty}</span>
                        <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => cambiarCantidad(s.id, 1)}>
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
                  flete={flete}
                  metodoPago={metodoPago}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setPreview(false)}>
                <ChevronLeft size={15} /> Editar
              </Button>
              <Button variant="hero" className="flex-1" onClick={descargarImagen} disabled={generating}>
                <Download size={16} />
                {generating ? "Generando..." : "Descargar imagen"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotaPago;
