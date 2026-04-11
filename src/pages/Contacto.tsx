import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, MapPin, Phone, Instagram, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Contacto = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Campos requeridos", description: "Por favor llena nombre, email y mensaje.", variant: "destructive" });
      return;
    }
    setSending(true);

    const { error } = await (supabase as any).from("contacts").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      message: form.message.trim(),
    });

    setSending(false);

    if (error) {
      toast({ title: "Error", description: "No se pudo enviar el mensaje. Intenta de nuevo.", variant: "destructive" });
      return;
    }

    toast({ title: "¡Mensaje enviado!", description: "Te responderemos pronto. 🎉" });
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading text-4xl font-bold text-center mb-2">Contáctanos</h1>
      <p className="text-muted-foreground text-center mb-12">¡Estamos para ayudarte a crear la fiesta perfecta! 🎉</p>

      <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tu nombre" maxLength={100} />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tu@email.com" maxLength={255} />
          </div>
          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="81 1234 5678" maxLength={20} />
          </div>
          <div>
            <Label htmlFor="message">Mensaje *</Label>
            <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Cuéntanos sobre tu evento..." rows={5} maxLength={1000} />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={sending}>
            <Send size={18} /> Enviar Mensaje
          </Button>
        </form>

        {/* Info */}
        <div className="space-y-6">
          <div className="bg-muted/50 rounded-2xl p-6 border border-border">
            <h3 className="font-heading font-bold text-lg mb-4">Información de Contacto</h3>
            <div className="space-y-4">
              <a href="tel:8180540369" className="flex items-center gap-3 text-sm text-foreground/80 hover:text-primary transition-colors">
                <Phone size={18} className="text-primary" /> 818 054 0369
              </a>
              <a href="https://instagram.com/pequesaurioss" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground/80 hover:text-primary transition-colors">
                <Instagram size={18} className="text-primary" /> @pequesaurioss
              </a>
              <p className="flex items-center gap-3 text-sm text-foreground/80">
                <MapPin size={18} className="text-primary" /> Monterrey, Nuevo León
              </p>
              <p className="flex items-center gap-3 text-sm text-foreground/80">
                <Clock size={18} className="text-primary" /> Lun-Vie 9:00-18:00
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-lavender/30 to-mint/30 rounded-2xl p-6 border border-border">
            <h3 className="font-heading font-bold text-lg mb-2">¿Prefieres WhatsApp? 💬</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Respuesta más rápida por WhatsApp. ¡Escríbenos directamente!
            </p>
            <Button variant="whatsapp" className="w-full" asChild>
              <a href="https://wa.me/528180540369" target="_blank" rel="noopener noreferrer">
                Escribir por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
